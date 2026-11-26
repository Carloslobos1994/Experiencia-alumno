import { describe, expect, it } from 'vitest';
import { agruparContactos, filtrarContactos, normalizar } from './contactos';

const CONTACTOS = [
  { id: 1, nombre: 'María Finanzas', email: 'mariafinanzas@adminduocuc.cl', rol: 'ADMIN' },
  { id: 2, nombre: 'Mario Adrián Huerta Silva', email: 'mari.huertas@profesorduocuc.cl', rol: 'PROFESOR' },
  { id: 3, nombre: 'Emilio Núñez', email: 'emilio@duocuc.cl', rol: 'ALUMNO' },
  { id: 4, nombre: 'Marcelo Pincheira', email: 'marcelo@duocuc.cl', rol: 'ALUMNO' },
];

describe('utils/contactos - directorio de mensajería', () => {
  it('normaliza tildes y mayúsculas', () => {
    expect(normalizar('  Núñez ')).toBe('nunez');
    expect(normalizar(undefined)).toBe('');
  });

  it('agrupa por Profesores, Alumnos y Administración', () => {
    const grupos = agruparContactos([...CONTACTOS, { id: 9, nombre: 'X', rol: 'OTRO' }]);
    expect(grupos.PROFESOR).toHaveLength(1);
    expect(grupos.ALUMNO.map((c) => c.id)).toEqual([3, 4]);
    expect(grupos.ADMIN).toHaveLength(1);
  });

  it('busca por nombre sin importar tildes', () => {
    expect(filtrarContactos(CONTACTOS, 'nunez').map((c) => c.id)).toEqual([3]);
  });

  it('busca por correo', () => {
    expect(filtrarContactos(CONTACTOS, 'marcelo@').map((c) => c.id)).toEqual([4]);
  });

  it('sin texto devuelve todos los contactos', () => {
    expect(filtrarContactos(CONTACTOS, '   ')).toHaveLength(4);
  });
});
