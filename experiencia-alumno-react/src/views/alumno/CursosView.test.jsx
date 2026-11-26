import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CursosView from './CursosView';
import { academicoService } from '../../api/servicios';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ usuario: { id: 4, nombre: 'Carlos Lobos', carrera: 'Analista Programador', rol: 'ALUMNO' } }),
}));
vi.mock('../../api/servicios', () => ({
  academicoService: { misNotas: vi.fn() },
}));

const CURSOS = [
  {
    cursoId: 1, codigo: 'DSY1104', seccion: '001V', nombre: 'Desarrollo Fullstack II',
    profesorNombre: 'Mario Adrián Huerta Silva', promedio: 5.6, porcentajeEvaluado: 40,
    evaluaciones: [
      { evaluacionId: 11, titulo: 'Evaluación Parcial 1', tipo: 'Prueba escrita', fecha: '2026-09-15', porcentaje: 20, nota: 6.5 },
      { evaluacionId: 12, titulo: 'Evaluación Parcial 2', tipo: 'Entrega por encargo', fecha: '2026-10-24', porcentaje: 20, nota: 3.8 },
      { evaluacionId: 13, titulo: 'Examen Transversal', tipo: 'Examen transversal', fecha: '2026-12-14', porcentaje: 40, nota: null },
    ],
  },
  {
    cursoId: 2, codigo: 'DSY1105', seccion: '002V', nombre: 'Desarrollo de Aplicaciones Móviles',
    profesorNombre: 'Dusty César Tessini Panes', promedio: null, porcentajeEvaluado: 0, evaluaciones: [],
  },
];

describe('CursosView - asignaturas inscritas con notas y promedio', () => {
  it('muestra cada asignatura con su docente y su promedio ponderado', async () => {
    academicoService.misNotas.mockResolvedValue(CURSOS);
    render(<CursosView />);

    expect(await screen.findByText('DSY1104 - Desarrollo Fullstack II')).toBeInTheDocument();
    expect(screen.getByText(/Estudiante: Carlos Lobos/)).toBeInTheDocument();
    expect(screen.getByText(/Docente: Mario Adrián Huerta Silva/)).toBeInTheDocument();
    expect(screen.getByText('Promedio (40% evaluado)')).toBeInTheDocument();
    expect(screen.getByText('5.6')).toBeInTheDocument();
  });

  it('pinta en azul la nota aprobatoria y en rojo la reprobatoria; sin nota muestra "—"', async () => {
    academicoService.misNotas.mockResolvedValue(CURSOS);
    render(<CursosView />);

    expect(await screen.findByText('6.5')).toHaveClass('text-primary');
    expect(screen.getByText('3.8')).toHaveClass('text-danger');
    // la nota pendiente del examen y el promedio del ramo sin notas
    expect(screen.getAllByText('—')).toHaveLength(2);
  });

  it('avisa cuando el alumno no tiene asignaturas', async () => {
    academicoService.misNotas.mockResolvedValue([]);
    render(<CursosView />);
    expect(await screen.findByText('No tienes asignaturas inscritas.')).toBeInTheDocument();
  });

  it('muestra el error si el backend no responde', async () => {
    academicoService.misNotas.mockRejectedValue(new Error('Network Error'));
    render(<CursosView />);
    expect(await screen.findByText(/no se pudo conectar con el servidor/i)).toBeInTheDocument();
  });
});
