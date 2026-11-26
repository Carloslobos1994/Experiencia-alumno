import { beforeEach, describe, expect, it } from 'vitest';
import {
  CLAVE_SESION,
  decodificarToken,
  guardarSesion,
  guardarTokens,
  leerSesion,
  limpiarSesion,
  tokenExpirado,
} from './sesion';

// Crea un JWT de prueba (sin firma real) con el payload indicado
function crearToken(payload) {
  // Igual que el backend: JSON en UTF-8 -> Base64URL sin relleno
  const base64url = (obj) => {
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  return `${base64url({ alg: 'HS384' })}.${base64url(payload)}.firma`;
}

describe('utils/sesion - persistencia de la sesión', () => {
  beforeEach(() => sessionStorage.clear());

  it('guarda y lee la sesión desde sessionStorage', () => {
    guardarSesion({ accessToken: 'a', refreshToken: 'r', usuario: { id: 1, rol: 'ALUMNO' } });
    expect(leerSesion()).toEqual({ accessToken: 'a', refreshToken: 'r', usuario: { id: 1, rol: 'ALUMNO' } });
  });

  it('guardarTokens actualiza el access token y conserva el resto', () => {
    guardarSesion({ accessToken: 'viejo', refreshToken: 'r1', usuario: { id: 1 } });
    guardarTokens('nuevo');
    expect(leerSesion()).toEqual({ accessToken: 'nuevo', refreshToken: 'r1', usuario: { id: 1 } });
  });

  it('limpiarSesion elimina la sesión', () => {
    guardarSesion({ accessToken: 'a', refreshToken: 'r', usuario: null });
    limpiarSesion();
    expect(leerSesion()).toBeNull();
  });

  it('leerSesion devuelve null si el contenido está corrupto', () => {
    sessionStorage.setItem(CLAVE_SESION, '{no-es-json');
    expect(leerSesion()).toBeNull();
  });
});

describe('utils/sesion - lectura del JWT', () => {
  it('decodifica el payload, incluyendo tildes', () => {
    const token = crearToken({ sub: 'carlos', nombre: 'Iván', exp: 100 });
    expect(decodificarToken(token)).toMatchObject({ sub: 'carlos', exp: 100 });
  });

  it('devuelve null con un token mal formado', () => {
    expect(decodificarToken('basura')).toBeNull();
  });

  it('detecta tokens vigentes y expirados', () => {
    const ahora = 1_000_000_000_000;
    const vigente = crearToken({ exp: ahora / 1000 + 60 });
    const vencido = crearToken({ exp: ahora / 1000 - 60 });
    expect(tokenExpirado(vigente, ahora)).toBe(false);
    expect(tokenExpirado(vencido, ahora)).toBe(true);
  });

  it('considera expirado un token vacío o sin exp', () => {
    expect(tokenExpirado(null)).toBe(true);
    expect(tokenExpirado(crearToken({ sub: 'x' }))).toBe(true);
  });
});
