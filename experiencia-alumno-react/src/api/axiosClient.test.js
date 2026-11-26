import { beforeEach, describe, expect, it } from 'vitest';
import { adjuntarToken, esRutaPublica } from './axiosClient';
import { guardarSesion } from '../utils/sesion';

describe('api/axiosClient - interceptor de autenticación', () => {
  beforeEach(() => sessionStorage.clear());

  it('agrega el header Authorization cuando hay sesión', () => {
    guardarSesion({ accessToken: 'token-123', refreshToken: 'r', usuario: { id: 1 } });
    const config = adjuntarToken({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer token-123');
  });

  it('no agrega el header si no hay sesión', () => {
    const config = adjuntarToken({ headers: {} });
    expect(config.headers.Authorization).toBeUndefined();
  });

  it('login y refresh no intentan renovar el token (evita bucles)', () => {
    expect(esRutaPublica('/auth/login')).toBe(true);
    expect(esRutaPublica('/auth/refresh')).toBe(true);
    expect(esRutaPublica('/auth/me')).toBe(false);
    expect(esRutaPublica('/cuotas/mis-cuotas')).toBe(false);
  });
});
