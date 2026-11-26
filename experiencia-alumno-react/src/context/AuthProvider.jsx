// src/context/AuthProvider.jsx
// Gestion de sesion del frontend (IE3.3.2):
// - login: llama al backend, guarda accessToken + refreshToken + usuario en sessionStorage.
// - recarga de pagina (F5): restaura la sesion guardada y la confirma con GET /auth/me.
// - token expirado: el interceptor de Axios lo renueva solo; si no puede, emite "sesion-expirada".
// - logout: borra la sesion del navegador.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from '../api/servicios';
import { EVENTO_SESION_EXPIRADA } from '../api/axiosClient';
import { guardarSesion, guardarTokens, leerSesion, limpiarSesion, tokenExpirado } from '../utils/sesion';

/** Sesion guardada y todavia renovable (refreshToken vigente). */
function sesionInicial() {
  const sesion = leerSesion();
  if (!sesion) {
    return null;
  }
  if (tokenExpirado(sesion.refreshToken)) {
    limpiarSesion();
    return null;
  }
  return sesion;
}

export function AuthProvider({ children }) {
  const [sesionGuardada] = useState(sesionInicial);
  const [usuario, setUsuario] = useState(sesionGuardada?.usuario ?? null);
  const [verificando, setVerificando] = useState(Boolean(sesionGuardada));

  // Al recargar la pagina: confirmar con el backend que el token sigue siendo valido.
  useEffect(() => {
    if (!sesionGuardada) {
      return undefined;
    }
    let activo = true;
    authService
      .me()
      .then((datosUsuario) => {
        if (activo) {
          const actual = leerSesion();
          if (actual) {
            guardarTokens(actual.accessToken, actual.refreshToken, datosUsuario);
          }
          setUsuario(datosUsuario);
        }
      })
      .catch(() => {
        if (activo) {
          limpiarSesion();
          setUsuario(null);
        }
      })
      .finally(() => {
        if (activo) {
          setVerificando(false);
        }
      });
    return () => {
      activo = false;
    };
  }, [sesionGuardada]);

  // Si el interceptor no pudo renovar el token, se cierra la sesion en la interfaz.
  useEffect(() => {
    const alExpirar = () => setUsuario(null);
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
  }, []);

  const login = useCallback(async (email, password) => {
    const respuesta = await authService.login(email.trim().toLowerCase(), password);
    guardarSesion(respuesta);
    setUsuario(respuesta.usuario);
    return respuesta.usuario;
  }, []);

  const logout = useCallback(() => {
    limpiarSesion();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, autenticado: Boolean(usuario), verificando, login, logout }),
    [usuario, verificando, login, logout],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
