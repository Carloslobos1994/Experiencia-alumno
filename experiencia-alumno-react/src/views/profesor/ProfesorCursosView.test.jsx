import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProfesorCursosView from './ProfesorCursosView';
import { academicoService } from '../../api/servicios';

vi.mock('../../api/servicios', () => ({
  academicoService: {
    cursos: vi.fn(),
    evaluacionesCurso: vi.fn(),
    crearEvaluacion: vi.fn(),
    actualizarEvaluacion: vi.fn(),
    eliminarEvaluacion: vi.fn(),
    alumnosCurso: vi.fn(),
    notasEvaluacion: vi.fn(),
    registrarNota: vi.fn(),
  },
}));

const CURSOS = [
  { id: 1, codigo: 'DSY1104', nombre: 'Desarrollo Fullstack II', seccion: '001V', totalAlumnos: 4 },
  { id: 2, codigo: 'DSY1105', nombre: 'Desarrollo de Aplicaciones Móviles', seccion: '002V', totalAlumnos: 4 },
];
const EVALUACIONES_FULLSTACK = [
  { id: 11, titulo: 'Evaluación Parcial 1', tipo: 'Prueba escrita', fecha: '2026-09-15', sala: 'Sala 319', porcentaje: 20 },
  { id: 12, titulo: 'Evaluación Parcial 2', tipo: 'Entrega por encargo', fecha: '2026-10-24', sala: 'Sala 319', porcentaje: 20 },
  { id: 13, titulo: 'Evaluación Parcial 3', tipo: 'Entrega y presentación', fecha: '2026-11-26', sala: 'Sala 319', porcentaje: 20 },
];
const EVALUACIONES_MOVILES = [
  { id: 21, titulo: 'MVP TacticalDEV', tipo: 'Entrega y presentación', fecha: '2026-09-20', sala: 'Lab 205', porcentaje: 20 },
];

/** Abre el formulario "Nueva evaluación" y lo completa. */
async function completarNuevaEvaluacion(user, { titulo, tipo, fecha, porcentaje }) {
  await user.click(await screen.findByRole('button', { name: 'Nueva evaluación' }));
  await user.type(screen.getByLabelText('Título *'), titulo);
  await user.selectOptions(screen.getByLabelText('Tipo *'), tipo);
  fireEvent.change(screen.getByLabelText('Fecha *'), { target: { value: fecha } });
  await user.type(screen.getByLabelText('Ponderación (%) *'), porcentaje);
}

describe('ProfesorCursosView - evaluaciones y notas del profesor', () => {
  beforeEach(() => {
    academicoService.cursos.mockResolvedValue(CURSOS);
    academicoService.evaluacionesCurso.mockImplementation((cursoId) =>
      Promise.resolve(cursoId === 1 ? EVALUACIONES_FULLSTACK : EVALUACIONES_MOVILES),
    );
  });

  it('muestra sus cursos, las evaluaciones y el % asignado', async () => {
    render(<ProfesorCursosView />);
    expect(await screen.findByText('Evaluación Parcial 3')).toBeInTheDocument();
    expect(screen.getByText('DSY1104 - Desarrollo Fullstack II')).toBeInTheDocument();
    expect(screen.getByText('60% asignado')).toBeInTheDocument();
    expect(academicoService.evaluacionesCurso).toHaveBeenCalledWith(1);
  });

  it('al elegir otro curso carga sus evaluaciones', async () => {
    const user = userEvent.setup();
    render(<ProfesorCursosView />);
    await user.click(await screen.findByText('DSY1105 - Desarrollo de Aplicaciones Móviles'));

    expect(await screen.findByText('MVP TacticalDEV')).toBeInTheDocument();
    expect(academicoService.evaluacionesCurso).toHaveBeenCalledWith(2);
  });

  it('crea una evaluación enviando solo los campos del DTO', async () => {
    const user = userEvent.setup();
    academicoService.crearEvaluacion.mockResolvedValue({ id: 14 });
    render(<ProfesorCursosView />);

    await completarNuevaEvaluacion(user, {
      titulo: 'Examen Transversal Full Stack II', tipo: 'Examen transversal', fecha: '2026-12-14', porcentaje: '40',
    });
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(academicoService.crearEvaluacion).toHaveBeenCalledWith({
      cursoId: 1, titulo: 'Examen Transversal Full Stack II', tipo: 'Examen transversal',
      fecha: '2026-12-14', sala: null, porcentaje: 40, descripcion: null,
    });
    await waitFor(() => expect(academicoService.evaluacionesCurso).toHaveBeenCalledTimes(2));
    expect(screen.queryByLabelText('Título *')).not.toBeInTheDocument();
  });

  it('si la ponderación supera el 100% muestra el rechazo del backend', async () => {
    const user = userEvent.setup();
    academicoService.crearEvaluacion.mockRejectedValue({
      response: { status: 400, data: { mensaje: 'La suma de ponderaciones del curso superaría el 100% (110%)' } },
    });
    render(<ProfesorCursosView />);

    await completarNuevaEvaluacion(user, {
      titulo: 'Examen', tipo: 'Examen', fecha: '2026-12-14', porcentaje: '50',
    });
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText(/superaría el 100%/)).toBeInTheDocument();
    expect(screen.getByLabelText('Título *')).toHaveValue('Examen');
  });

  it('edita una evaluación existente', async () => {
    const user = userEvent.setup();
    academicoService.actualizarEvaluacion.mockResolvedValue({});
    render(<ProfesorCursosView />);

    await screen.findByText('Evaluación Parcial 3');
    await user.click(screen.getAllByRole('button', { name: 'Editar' })[2]);
    const sala = screen.getByLabelText('Sala');
    await user.clear(sala);
    await user.type(sala, 'Laboratorio Principal Sala 319');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(academicoService.actualizarEvaluacion).toHaveBeenCalledWith(13, expect.objectContaining({
      titulo: 'Evaluación Parcial 3', sala: 'Laboratorio Principal Sala 319', porcentaje: 20,
    }));
  });

  it('elimina una evaluación solo si el profesor confirma', async () => {
    const user = userEvent.setup();
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    academicoService.eliminarEvaluacion.mockResolvedValue({});
    render(<ProfesorCursosView />);

    await screen.findByText('Evaluación Parcial 1');
    await user.click(screen.getAllByRole('button', { name: 'Eliminar' })[0]);
    expect(academicoService.eliminarEvaluacion).not.toHaveBeenCalled();

    await user.click(screen.getAllByRole('button', { name: 'Eliminar' })[0]);
    expect(academicoService.eliminarEvaluacion).toHaveBeenCalledWith(11);
    confirmar.mockRestore();
  });

  it('planilla de notas: valida el rango 1.0 - 7.0 antes de llamar al backend', async () => {
    const user = userEvent.setup();
    academicoService.alumnosCurso.mockResolvedValue([
      { id: 4, nombre: 'Carlos Lobos' },
      { id: 5, nombre: 'Marcelo Pincheira' },
    ]);
    academicoService.notasEvaluacion.mockResolvedValue([{ alumnoId: 4, valor: 6.5 }]);
    academicoService.registrarNota.mockResolvedValue({});
    render(<ProfesorCursosView />);

    await screen.findByText('Evaluación Parcial 1');
    await user.click(screen.getAllByRole('button', { name: 'Notas' })[0]);

    expect(await screen.findByLabelText('Nota de Carlos Lobos')).toHaveValue(6.5);
    const notaMarcelo = screen.getByLabelText('Nota de Marcelo Pincheira');

    await user.type(notaMarcelo, '8');
    await user.click(screen.getAllByRole('button', { name: 'Guardar' })[1]);
    expect(screen.getByText('Nota entre 1.0 y 7.0')).toBeInTheDocument();
    expect(academicoService.registrarNota).not.toHaveBeenCalled();

    await user.clear(notaMarcelo);
    await user.type(notaMarcelo, '6');
    await user.click(screen.getAllByRole('button', { name: 'Guardar' })[1]);
    expect(academicoService.registrarNota).toHaveBeenCalledWith({ evaluacionId: 11, alumnoId: 5, valor: 6 });
    expect(await screen.findByText('Guardada')).toBeInTheDocument();
  });
});
