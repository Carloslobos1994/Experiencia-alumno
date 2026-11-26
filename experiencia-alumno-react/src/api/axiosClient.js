// src/api/axiosClient.js
// Instancia unica de Axios para toda la app.
//
// 1. Interceptor de solicitud: agrega "Authorization: Bearer <accessToken>" a cada peticion.
// 2. Interceptor de respuesta: si el backend responde 401 (token expirado), pide un token nuevo
//    con el refreshToken y reintenta la peticion original UNA vez. Si el refresh tambien falla,
//    cierra la sesion y avisa a la app con el evento "sesion-expirada".
import axios from 'axios';
import { guardarTokens, leerSesion, limpiarSesion } from '../utils/sesion';

export const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
export const EVENTO_SESION_EXPIRADA = 'sesion-expirada';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export function adjuntarToken(config) {
  const sesion = leerSesion();
  if (sesion?.accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${sesion.accessToken}`;
  }
  return config;
}

api.interceptors.request.use(adjuntarToken);

// Si varias peticiones fallan a la vez con 401, se hace un solo refresh y todas lo esperan.
let refrescoEnCurso = null;

async function renovarToken() {
  const sesion = leerSesion();
  if (!sesion?.refreshToken) {
    throw new Error('Sin refresh token');
  }
  // Se usa axios "limpio" (sin interceptores) para no entrar en un bucle.
  const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: sesion.refreshToken });
  guardarTokens(data.accessToken, data.refreshToken, data.usuario);
  return data.accessToken;
}

export function esRutaPublica(url = '') {
  return /\/auth\/(login|refresh)/.test(url);
}

api.interceptors.response.use(
  (respuesta) => respuesta,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && original && !original._reintentado && !esRutaPublica(original.url)) {
      original._reintentado = true;
      try {
        if (!refrescoEnCurso) {
          refrescoEnCurso = renovarToken().finally(() => {
            refrescoEnCurso = null;
          });
        }
        const nuevoToken = await refrescoEnCurso;
        original.headers.Authorization = `Bearer ${nuevoToken}`;
        return api(original);
      } catch {
        limpiarSesion();
        window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
      }
    }
    return Promise.reject(error);
  },
);

export default api;
