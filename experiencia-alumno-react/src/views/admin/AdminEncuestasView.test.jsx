import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminEncuestasView from './AdminEncuestasView';
import { academicoService, encuestasService } from '../../api/servicios';

vi.mock('../../api/servicios', () => ({
  academicoService: { cursos: vi.fn() },
  encuestasService: { listar: vi.fn(), crear: vi.fn(), cerrar: vi.fn(), eliminar: vi.fn(), resultados: vi.fn() },
}));

const CURSOS = [
  { id: 1, codigo: 'DSY1104', nombre: 'Desarrollo Fullstack II', profesorNombre: 'Mario Adrián Huerta Silva' },
  { id: 2, codigo: 'DSY1105', nombre: 'Desarrollo de Aplicaciones Móviles', profesorNombre: 'Dusty César Tessini Panes' },
];
const ENCUESTAS = [
  {
    id: 5, cursoCodigo: 'DSY1104', cursoNombre: 'Desarrollo Fullstack II', profesorNombre: 'Mario Adrián Huerta Silva',
    titulo: 'Encuesta Docente 2026-2', fechaCierre: '2026-12-16', activa: true, abierta: true, respuestas: 1, inscritos: 4,
  },
];

describe('AdminEncuestasView - ADMIN gestiona la encuesta docente', () => {
  beforeEach(() => {
    encuestasService.listar.mockResolvedValue(ENCUESTAS);
    academicoService.cursos.mockResolvedValue(CURSOS);
  });

  it('lista las encuestas con respuestas recibidas sobre inscritos', async () => {
    render(<AdminEncuestasView />);
    expect(await screen.findByText('1/4')).toBeInTheDocument();
    expect(screen.getByText('Abierta')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /DSY1105 - Desarrollo de Aplicaciones Móviles/ })).toBeInTheDocument();
  });

  it('crea una encuesta para el curso elegido', async () => {
    const user = userEvent.setup();
    encuestasService.crear.mockResolvedValue({ id: 6 });
    render(<AdminEncuestasView />);

    await user.selectOptions(await screen.findByLabelText('Curso *'), '2');
    fireEvent.change(screen.getByLabelText('Cierre *'), { target: { value: '2026-12-20' } });
    await user.click(screen.getByRole('button', { name: 'Crear' }));

    expect(encuestasService.crear).toHaveBeenCalledWith({ cursoId: 2, titulo: 'Encuesta Docente 2026-2', fechaCierre: '2026-12-20' });
    expect(await screen.findByText(/encuesta creada/i)).toBeInTheDocument();
    await waitFor(() => expect(encuestasService.listar).toHaveBeenCalledTimes(2));
  });

  it('muestra el rechazo del backend al crear', async () => {
    const user = userEvent.setup();
    encuestasService.crear.mockRejectedValue({
      response: { status: 400, data: { mensaje: 'Datos de entrada inválidos', detalles: { fechaCierre: 'La fecha de cierre no puede estar en el pasado' } } },
    });
    render(<AdminEncuestasView />);

    await user.selectOptions(await screen.findByLabelText('Curso *'), '1');
    fireEvent.change(screen.getByLabelText('Cierre *'), { target: { value: '2020-01-01' } });
    await user.click(screen.getByRole('button', { name: 'Crear' }));

    expect(await screen.findByText('La fecha de cierre no puede estar en el pasado')).toBeInTheDocument();
  });

  it('cierra una encuesta activa', async () => {
    const user = userEvent.setup();
    encuestasService.cerrar.mockResolvedValue({});
    render(<AdminEncuestasView />);

    await user.click(await screen.findByRole('button', { name: 'Cerrar' }));
    expect(encuestasService.cerrar).toHaveBeenCalledWith(5);
    expect(await screen.findByText('Encuesta cerrada')).toBeInTheDocument();
  });

  it('elimina solo si el administrador confirma', async () => {
    const user = userEvent.setup();
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    encuestasService.eliminar.mockResolvedValue({});
    render(<AdminEncuestasView />);

    await user.click(await screen.findByRole('button', { name: 'Eliminar' }));
    expect(encuestasService.eliminar).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(encuestasService.eliminar).toHaveBeenCalledWith(5);
    expect(await screen.findByText('Encuesta eliminada')).toBeInTheDocument();
    confirmar.mockRestore();
  });

  it('muestra los resultados de la encuesta seleccionada', async () => {
    const user = userEvent.setup();
    encuestasService.resultados.mockResolvedValue({
      titulo: 'Resultados Fullstack', cursoNombre: 'Desarrollo Fullstack II', profesorNombre: 'Mario Adrián Huerta Silva',
      respuestas: 0, inscritos: 4, comentarios: [],
    });
    render(<AdminEncuestasView />);

    await user.click(await screen.findByRole('button', { name: 'Resultados' }));
    expect(encuestasService.resultados).toHaveBeenCalledWith(5);
    expect(await screen.findByText(/aún no hay respuestas/i)).toBeInTheDocument();
  });
});
