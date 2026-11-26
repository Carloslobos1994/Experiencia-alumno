import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TarjetaEvaluacion, { urgencia } from './TarjetaEvaluacion';

// Fecha local "AAAA-MM-DD" a N dias desde hoy
function enDias(n) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + n);
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mm}-${dd}`;
}

const EXAMEN = {
  id: 1,
  cursoCodigo: 'DSY1104',
  cursoNombre: 'Desarrollo Fullstack II',
  titulo: 'Examen Transversal Full Stack II',
  tipo: 'Examen transversal',
  descripcion: 'Aplicación completa con React, Spring Boot y pruebas unitarias.',
  sala: 'Laboratorio Principal Sala 319',
  porcentaje: 40,
  profesorNombre: 'Mario Adrián Huerta Silva',
};

describe('TarjetaEvaluacion (molécula) - carta de próxima evaluación', () => {
  it('muestra ramo, título, descripción, sala, ponderación y docente', () => {
    render(<TarjetaEvaluacion evaluacion={{ ...EXAMEN, fecha: enDias(19) }} />);
    expect(screen.getByText('DSY1104')).toBeInTheDocument();
    expect(screen.getByText('Examen Transversal Full Stack II')).toBeInTheDocument();
    expect(screen.getByText(/react, spring boot/i)).toBeInTheDocument();
    expect(screen.getByText('Laboratorio Principal Sala 319')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('Mario Adrián Huerta Silva')).toBeInTheDocument();
    expect(screen.getByText('En 19 días')).toBeInTheDocument();
  });

  it('indica "Mañana" cuando falta un día', () => {
    render(<TarjetaEvaluacion evaluacion={{ ...EXAMEN, fecha: enDias(1), sala: '' }} />);
    expect(screen.getByText('Mañana')).toBeInTheDocument();
    expect(screen.getByText('Por confirmar')).toBeInTheDocument();
  });

  it('clasifica la urgencia según los días restantes', () => {
    expect(urgencia(0).texto).toBe('Hoy');
    expect(urgencia(1).bg).toBe('danger');
    expect(urgencia(5)).toMatchObject({ texto: 'En 5 días', bg: 'warning' });
    expect(urgencia(20).bg).toBe('secondary');
  });
});
