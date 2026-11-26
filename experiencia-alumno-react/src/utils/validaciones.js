// src/utils/validaciones.js
// Validaciones del lado del cliente: dan respuesta inmediata al usuario.
// El backend vuelve a validar todo (nunca se confia solo en el navegador).

// Dominios institucionales permitidos para iniciar sesion
export const DOMINIOS_INSTITUCIONALES = [
  'duocuc.cl',
  'profesorduocuc.cl',
  'profesor.duocuc.cl',
  'adminduocuc.cl',
];

export function validarCorreoInstitucional(correo) {
  const limpio = (correo ?? '').trim().toLowerCase();
  const partes = limpio.split('@');
  return partes.length === 2 && partes[0].length > 0 && DOMINIOS_INSTITUCIONALES.includes(partes[1]);
}

// Valida el correo institucional de alumno (@duocuc.cl)
export function validarCorreoAlumno(correo) {
  return (correo ?? '').trim().toLowerCase().endsWith('@duocuc.cl');
}

export function validarPassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

/** Nota chilena valida: numero entre 1.0 y 7.0 */
export function validarNota(valor) {
  if (valor === '' || valor === null || valor === undefined) {
    return false;
  }
  const numero = Number(valor);
  return !Number.isNaN(numero) && numero >= 1 && numero <= 7;
}
