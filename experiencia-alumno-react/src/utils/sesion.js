// src/utils/sesion.js
// Persistencia de la sesion en el navegador.
//
// Se usa sessionStorage (y no localStorage) a proposito:
// - Sobrevive a la recarga de pagina (F5), que es lo que pide la rubrica.
// - Se borra al cerrar la pestana, reduciendo el riesgo si alguien usa el mismo computador.
// - Solo guardamos tokens JWT firmados por el backend: si alguien los modifica, el backend los rechaza.

export const CLAVE_SESION = 'experiencia-alumno-sesion';

export function guardarSesion({ accessToken, refreshToken, usuario }) {
  sessionStorage.setItem(CLAVE_SESION, JSON.stringify({ accessToken, refreshToken, usuario }));
}

/** Actualiza los tokens (por ejemplo, tras un refresh) conservando lo demas. */
export function guardarTokens(accessToken, refreshToken, usuario) {
  const actual = leerSesion() ?? {};
  guardarSesion({
    accessToken,
    refreshToken: refreshToken ?? actual.refreshToken,
    usuario: usuario ?? actual.usuario,
  });
}

export function leerSesion() {
  try {
    const texto = sessionStorage.getItem(CLAVE_SESION);
    return texto ? JSON.parse(texto) : null;
  } catch {
    return null;
  }
}

export function limpiarSesion() {
  sessionStorage.removeItem(CLAVE_SESION);
}

/**
 * Lee el contenido (payload) de un JWT sin verificar la firma.
 * Solo se usa para saber cuando expira; la verificacion real la hace el backend.
 */
export function decodificarToken(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** true si el token no existe, no se puede leer o ya expiro. */
export function tokenExpirado(token, ahora = Date.now()) {
  const datos = token ? decodificarToken(token) : null;
  if (!datos || !datos.exp) {
    return true;
  }
  return datos.exp * 1000 <= ahora;
}
