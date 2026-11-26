import { describe, expect, it } from 'vitest';
import { menuPorRol, rutaInicio, tieneRol } from './permisos';

describe('utils/permisos - restricciones por rol en el frontend', () => {
  it('cada rol tiene su página de inicio', () => {
    expect(rutaInicio('ALUMNO')).toBe('/alumno');
    expect(rutaInicio('PROFESOR')).toBe('/profesor/cursos');
    expect(rutaInicio('ADMIN')).toBe('/admin/usuarios');
    expect(rutaInicio('DESCONOCIDO')).toBe('/login');
  });

  it('el alumno no ve opciones de administración en su menú', () => {
    const rutas = menuPorRol('ALUMNO').map((m) => m.ruta);
    expect(rutas).toContain('/alumno/mensualidades');
    expect(rutas.some((r) => r.startsWith('/admin'))).toBe(false);
    expect(rutas.some((r) => r.startsWith('/profesor'))).toBe(false);
  });

  it('el profesor ve sus cursos pero no finanzas', () => {
    const rutas = menuPorRol('PROFESOR').map((m) => m.ruta);
    expect(rutas).toContain('/profesor/cursos');
    expect(rutas).not.toContain('/admin/finanzas');
  });

  it('un rol inexistente no tiene menú', () => {
    expect(menuPorRol(undefined)).toEqual([]);
  });

  it('tieneRol valida el rol del usuario', () => {
    const alumno = { rol: 'ALUMNO' };
    expect(tieneRol(alumno, ['ALUMNO'])).toBe(true);
    expect(tieneRol(alumno, ['ADMIN', 'PROFESOR'])).toBe(false);
    expect(tieneRol(alumno, undefined)).toBe(true);
    expect(tieneRol(alumno, [])).toBe(true);
    expect(tieneRol(null, ['ALUMNO'])).toBe(false);
  });
});
