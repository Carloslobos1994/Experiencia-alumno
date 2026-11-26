// src/utils/contactos.js
// Agrupa y filtra los contactos de la mensajeria (Profesores, Alumnos, Administracion).

export const GRUPOS_CONTACTO = [
  { rol: 'PROFESOR', titulo: 'Profesores' },
  { rol: 'ALUMNO', titulo: 'Alumnos' },
  { rol: 'ADMIN', titulo: 'Administración' },
];

/** Quita tildes y pasa a minusculas para buscar "nunez" y encontrar "Núñez". */
export function normalizar(texto) {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Filtra por nombre o correo. Sin texto devuelve todos. */
export function filtrarContactos(contactos, texto) {
  const buscado = normalizar(texto);
  if (!buscado) {
    return contactos;
  }
  return contactos.filter(
    (c) => normalizar(c.nombre).includes(buscado) || normalizar(c.email).includes(buscado),
  );
}

/** { PROFESOR: [...], ALUMNO: [...], ADMIN: [...] } */
export function agruparContactos(contactos) {
  const grupos = { PROFESOR: [], ALUMNO: [], ADMIN: [] };
  for (const contacto of contactos) {
    if (grupos[contacto.rol]) {
      grupos[contacto.rol].push(contacto);
    }
  }
  return grupos;
}
