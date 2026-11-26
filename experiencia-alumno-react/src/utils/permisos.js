// src/utils/permisos.js
// Reglas de acceso del frontend: que menu ve cada rol y a donde entra al iniciar sesion.
// Importante: esto mejora la experiencia (oculta lo que no corresponde), pero la seguridad
// real esta en el backend, que responde 403 si un rol intenta una accion no permitida.

export const ROLES = {
  ADMIN: 'ADMIN',
  PROFESOR: 'PROFESOR',
  ALUMNO: 'ALUMNO',
};

export const NOMBRE_ROL = {
  ADMIN: 'Administración',
  PROFESOR: 'Profesor',
  ALUMNO: 'Alumno',
};

const RUTA_INICIO = {
  ADMIN: '/admin/usuarios',
  PROFESOR: '/profesor/cursos',
  ALUMNO: '/alumno',
};

const MENU = {
  ALUMNO: [
    { ruta: '/alumno', texto: 'Inicio' },
    { ruta: '/alumno/cursos', texto: 'Cursos y notas' },
    { ruta: '/alumno/mensualidades', texto: 'Mensualidades' },
    { ruta: '/alumno/encuestas', texto: 'Encuesta docente' },
    { ruta: '/alumno/proyectos', texto: 'Proyectos' },
    { ruta: '/mensajes', texto: 'Mensajes' },
  ],
  PROFESOR: [
    { ruta: '/profesor/cursos', texto: 'Mis cursos' },
    { ruta: '/profesor/encuestas', texto: 'Encuesta docente' },
    { ruta: '/mensajes', texto: 'Mensajes' },
  ],
  ADMIN: [
    { ruta: '/admin/usuarios', texto: 'Usuarios' },
    { ruta: '/admin/cursos', texto: 'Cursos' },
    { ruta: '/admin/finanzas', texto: 'Finanzas' },
    { ruta: '/admin/encuestas', texto: 'Encuestas' },
    { ruta: '/mensajes', texto: 'Mensajes' },
  ],
};

export function menuPorRol(rol) {
  return MENU[rol] ?? [];
}

export function rutaInicio(rol) {
  return RUTA_INICIO[rol] ?? '/login';
}

/** true si el usuario tiene alguno de los roles permitidos (sin roles = cualquier usuario autenticado). */
export function tieneRol(usuario, rolesPermitidos) {
  if (!usuario) {
    return false;
  }
  if (!rolesPermitidos || rolesPermitidos.length === 0) {
    return true;
  }
  return rolesPermitidos.includes(usuario.rol);
}
