import { describe, expect, it } from 'vitest';
import {
  claseNota,
  diasRestantes,
  formatearFecha,
  formatearFechaHora,
  formatearNota,
  formatearPesos,
  iniciales,
} from './formato';

describe('utils/formato', () => {
  it('formatea montos en pesos chilenos', () => {
    expect(formatearPesos(319000)).toBe('$319.000');
    expect(formatearPesos(null)).toBe('$0');
  });

  it('formatea fechas ISO al formato chileno', () => {
    expect(formatearFecha('2026-11-26')).toBe('26-11-2026');
    expect(formatearFecha(null)).toBe('—');
    expect(formatearFechaHora('2026-11-24T12:47:37.5')).toBe('24-11-2026 12:47');
    expect(formatearFechaHora(undefined)).toBe('—');
  });

  it('formatea notas con un decimal', () => {
    expect(formatearNota(6.5)).toBe('6.5');
    expect(formatearNota(7)).toBe('7.0');
    expect(formatearNota(null)).toBe('—');
    expect(formatearNota('')).toBe('—');
  });

  it('colorea la nota: azul aprobada, roja reprobada', () => {
    expect(claseNota(4.0)).toContain('text-primary');
    expect(claseNota(3.9)).toContain('text-danger');
    expect(claseNota(null)).toBe('text-muted');
  });

  it('calcula los días restantes', () => {
    const hoy = new Date(2026, 10, 24);
    expect(diasRestantes('2026-11-26', hoy)).toBe(2);
    expect(diasRestantes('2026-11-24', hoy)).toBe(0);
    expect(diasRestantes('2026-11-20', hoy)).toBe(-4);
  });

  it('obtiene las iniciales del nombre', () => {
    expect(iniciales('Carlos Iván Lobos')).toBe('CI');
    expect(iniciales('')).toBe('?');
  });
});
