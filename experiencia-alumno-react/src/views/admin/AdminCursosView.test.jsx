import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminCursosView from './AdminCursosView';
import { academicoService, usuariosService } from '../../api/servicios';

vi.mock('../../api/servicios', () => ({
  academicoService: {
    cursos: vi.fn(), crearCurso: vi.fn(), actualizarCurso: vi.fn(), eliminarCurso: vi.fn(),
    alumnosCurso: vi.fn(), inscribir: vi.fn(), desinscribir: vi.fn(),
  },
  usuariosService: { listar: vi.fn() },
}));

const CURSOS = [
  { id: 1, codigo: 'DSY1104', seccion: '001V', nombre: 'Desarrollo Fullstack II', profesorId: 2, profesorNombre: 'Mario Adrián Huerta Silva', totalAlumnos: 4 },
];
const PROFESORES = [
  { id: 2, nombre: 'Mario Adrián Huerta Silva' },
  { id: 3, nombre: 'Dusty César Tessini Panes' },
];
const ALUMNOS = [
  { id: 4, nombre: 'Carlos Lobos' },
  { id: 5, nombre: 'Marcelo Pincheira' },
];

describe('AdminCursosView - ADMIN gestiona cursos e inscripciones', () => {
  beforeEach(() => {
    academicoService.cursos.mockResolvedValue(CURSOS);
    usuariosService.listar.mockImplementation((rol) => Promise.resolve(rol === 'PROFESOR' ? PROFESORES : ALUMNOS));
  });

  it('lista los cursos con su profesor y cantidad de alumnos', async () => {
    render(<AdminCursosView />);
    expect(await screen.findByText('Desarrollo Fullstack II')).toBeInTheDocument();
    expect(screen.getByText('Mario Adrián Huerta Silva')).toBeInTheDocument();
    expect(usuariosService.listar).toHaveBeenCalledWith('PROFESOR');
    expect(usuariosService.listar).toHaveBeenCalledWith('ALUMNO');
  });

  it('crea un curso asignando un profesor', async () => {
    const user = userEvent.setup();
    academicoService.crearCurso.mockResolvedValue({ id: 3 });
    render(<AdminCursosView />);

    await user.click(await screen.findByRole('button', { name: 'Nuevo curso' }));
    await user.type(screen.getByLabelText('Código *'), 'DSY1106');
    await user.type(screen.getByLabelText('Sección *'), '003V');
    await user.type(screen.getByLabelText('Nombre *'), 'Arquitectura de Software');
    await user.selectOptions(screen.getByLabelText('Profesor a cargo *'), '3');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(academicoService.crearCurso).toHaveBeenCalledWith({
      codigo: 'DSY1106', seccion: '003V', nombre: 'Arquitectura de Software', profesorId: 3,
    });
    await waitFor(() => expect(academicoService.cursos).toHaveBeenCalledTimes(2));
  });

  it('muestra el error si el curso ya existe (409)', async () => {
    const user = userEvent.setup();
    academicoService.crearCurso.mockRejectedValue({
      response: { status: 409, data: { mensaje: 'Ya existe el curso DSY1104 sección 001V' } },
    });
    render(<AdminCursosView />);

    await user.click(await screen.findByRole('button', { name: 'Nuevo curso' }));
    await user.type(screen.getByLabelText('Código *'), 'DSY1104');
    await user.type(screen.getByLabelText('Sección *'), '001V');
    await user.type(screen.getByLabelText('Nombre *'), 'Duplicado');
    await user.selectOptions(screen.getByLabelText('Profesor a cargo *'), '2');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Ya existe el curso DSY1104 sección 001V')).toBeInTheDocument();
  });

  it('edita el nombre de un curso', async () => {
    const user = userEvent.setup();
    academicoService.actualizarCurso.mockResolvedValue({});
    render(<AdminCursosView />);

    await user.click(await screen.findByRole('button', { name: 'Editar' }));
    expect(screen.getByText('Editar curso')).toBeInTheDocument();
    const nombre = screen.getByLabelText('Nombre *');
    await user.clear(nombre);
    await user.type(nombre, 'Desarrollo Full Stack II');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(academicoService.actualizarCurso).toHaveBeenCalledWith(1, {
      codigo: 'DSY1104', seccion: '001V', nombre: 'Desarrollo Full Stack II', profesorId: 2,
    });
  });

  it('si el curso tiene evaluaciones el backend impide eliminarlo y se muestra el motivo', async () => {
    const user = userEvent.setup();
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true);
    academicoService.eliminarCurso.mockRejectedValue({
      response: { status: 400, data: { mensaje: 'No se puede eliminar: el curso tiene evaluaciones o encuestas registradas' } },
    });
    render(<AdminCursosView />);

    await user.click(await screen.findByRole('button', { name: 'Eliminar' }));
    expect(academicoService.eliminarCurso).toHaveBeenCalledWith(1);
    expect(await screen.findByText(/tiene evaluaciones o encuestas/)).toBeInTheDocument();
    confirmar.mockRestore();
  });

  it('inscribe solo a alumnos que aún no están en el curso y permite quitarlos', async () => {
    const user = userEvent.setup();
    academicoService.alumnosCurso.mockResolvedValue([{ id: 4, nombre: 'Carlos Lobos' }]);
    academicoService.inscribir.mockResolvedValue({});
    academicoService.desinscribir.mockResolvedValue({});
    render(<AdminCursosView />);

    await user.click(await screen.findByRole('button', { name: 'Inscripciones' }));
    expect(await screen.findByText('Carlos Lobos')).toBeInTheDocument();

    const selector = screen.getByLabelText('Alumno a inscribir');
    expect(screen.queryByRole('option', { name: 'Carlos Lobos' })).not.toBeInTheDocument();
    await user.selectOptions(selector, '5');
    await user.click(screen.getByRole('button', { name: 'Inscribir' }));
    expect(academicoService.inscribir).toHaveBeenCalledWith(1, 5);

    await user.click(screen.getByRole('button', { name: 'Quitar' }));
    expect(academicoService.desinscribir).toHaveBeenCalledWith(1, 4);
  });
});
