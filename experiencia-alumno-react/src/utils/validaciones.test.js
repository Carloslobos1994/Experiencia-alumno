import { describe, expect, it } from 'vitest';
import { validarCorreoAlumno, validarCorreoInstitucional, validarNota, validarPassword } from './validaciones';

describe('utils/validaciones', () => {
  it('acepta correos institucionales de alumnos, profesores y administración', () => {
    expect(validarCorreoInstitucional('carlos.lobos@duocuc.cl')).toBe(true);
    expect(validarCorreoInstitucional('mari.huertas@profesorduocuc.cl')).toBe(true);
    expect(validarCorreoInstitucional('du.tessini@profesor.duocuc.cl')).toBe(true);
    expect(validarCorreoInstitucional(' MariaFinanzas@AdminDuocUC.cl ')).toBe(true);
  });

  it('rechaza correos externos o mal formados', () => {
    expect(validarCorreoInstitucional('correo@gmail.com')).toBe(false);
    expect(validarCorreoInstitucional('@duocuc.cl')).toBe(false);
    expect(validarCorreoInstitucional('a@b@duocuc.cl')).toBe(false);
    expect(validarCorreoInstitucional(undefined)).toBe(false);
  });

  it('valida el correo institucional de alumno (@duocuc.cl)', () => {
    expect(validarCorreoAlumno('carlos@duocuc.cl')).toBe(true);
    expect(validarCorreoAlumno('carlos@gmail.com')).toBe(false);
    expect(validarCorreoAlumno(null)).toBe(false);
  });

  it('exige contraseñas de al menos 8 caracteres', () => {
    expect(validarPassword('Duoc2026!')).toBe(true);
    expect(validarPassword('corta')).toBe(false);
    expect(validarPassword(undefined)).toBe(false);
  });

  it('valida notas entre 1.0 y 7.0', () => {
    expect(validarNota('6.5')).toBe(true);
    expect(validarNota(1)).toBe(true);
    expect(validarNota(7)).toBe(true);
    expect(validarNota('7.1')).toBe(false);
    expect(validarNota('0.9')).toBe(false);
    expect(validarNota('abc')).toBe(false);
    expect(validarNota('')).toBe(false);
    expect(validarNota(null)).toBe(false);
  });
});
