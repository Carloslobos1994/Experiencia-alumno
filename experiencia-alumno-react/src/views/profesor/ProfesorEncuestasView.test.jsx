import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ProfesorEncuestasView from './ProfesorEncuestasView';
import { encuestasService } from '../../api/servicios';

vi.mock('../../api/servicios', () => ({
  encuestasService: { listar: vi.fn(), resultados: vi.fn() },
}));

const ENCUESTAS = [
  {
    id: 1, titulo: 'Encuesta Docente 2026-2', cursoCodigo: 'DSY1104', cursoNombre: 'Desarrollo Fullstack II',
    fechaCierre: '2026-12-16', abierta: true, respuestas: 2, inscritos: 4,
  },
  {
    id: 2, titulo: 'Encuesta Docente 2026-1', cursoCodigo: 'DSY1104', cursoNombre: 'Desarrollo Fullstack II',
    fechaCierre: '2026-06-30', abierta: false, respuestas: 4, inscritos: 4,
  },
];
const RESULTADO = {
  encuestaId: 1, titulo: 'Resultados 2026-2', cursoNombre: 'Desarrollo Fullstack II', profesorNombre: 'Mario Adrián Huerta Silva',
  respuestas: 2, inscritos: 4, claridad: 4.5, puntualidad: 4, retroalimentacion: 3.5, dominio: 5, promedioGeneral: 4.25,
  comentarios: ['Explica muy bien los conceptos'],
};

describe('ProfesorEncuestasView - resultados anónimos de la encuesta docente', () => {
  it('lista las encuestas de sus cursos con su estado y respuestas', async () => {
    encuestasService.listar.mockResolvedValue(ENCUESTAS);
    render(<ProfesorEncuestasView />);

    expect(await screen.findByText('Encuesta Docente 2026-2')).toBeInTheDocument();
    expect(screen.getByText('Abierta')).toBeInTheDocument();
    expect(screen.getByText('Cerrada')).toBeInTheDocument();
    expect(screen.getByText(/2\/4 respuestas/)).toBeInTheDocument();
  });

  it('al ver resultados muestra promedios y comentarios sin nombres', async () => {
    const user = userEvent.setup();
    encuestasService.listar.mockResolvedValue(ENCUESTAS);
    encuestasService.resultados.mockResolvedValue(RESULTADO);
    render(<ProfesorEncuestasView />);

    await user.click((await screen.findAllByRole('button', { name: 'Ver resultados' }))[0]);

    expect(encuestasService.resultados).toHaveBeenCalledWith(1);
    expect(await screen.findByText('Resultados 2026-2')).toBeInTheDocument();
    expect(screen.getByText('4.25 / 5')).toBeInTheDocument();
    expect(screen.getByText(/explica muy bien los conceptos/i)).toBeInTheDocument();
  });

  it('muestra el error si el backend niega los resultados', async () => {
    const user = userEvent.setup();
    encuestasService.listar.mockResolvedValue(ENCUESTAS);
    encuestasService.resultados.mockRejectedValue({
      response: { status: 403, data: { mensaje: 'Solo Administración o el profesor del curso pueden ver los resultados' } },
    });
    render(<ProfesorEncuestasView />);

    await user.click((await screen.findAllByRole('button', { name: 'Ver resultados' }))[1]);
    expect(await screen.findByText(/solo administración o el profesor del curso/i)).toBeInTheDocument();
  });

  it('avisa cuando sus cursos todavía no tienen encuestas', async () => {
    encuestasService.listar.mockResolvedValue([]);
    render(<ProfesorEncuestasView />);
    expect(await screen.findByText('Aún no hay encuestas para tus cursos.')).toBeInTheDocument();
  });
});
