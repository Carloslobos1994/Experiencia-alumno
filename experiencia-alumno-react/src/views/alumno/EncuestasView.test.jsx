import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EncuestasView from './EncuestasView';
import FormularioEncuesta, { PREGUNTAS } from '../../components/organisms/FormularioEncuesta';
import { encuestasService } from '../../api/servicios';

vi.mock('../../api/servicios', () => ({
  encuestasService: { pendientes: vi.fn(), responder: vi.fn() },
}));

const ENCUESTA = {
  id: 7, titulo: 'Encuesta Docente 2026-2', cursoCodigo: 'DSY1104', cursoNombre: 'Desarrollo Fullstack II',
  profesorNombre: 'Mario Adrián Huerta Silva', fechaCierre: '2026-12-16',
};

/** Marca un valor (1 a 5) en la pregunta indicada. */
async function responderPregunta(user, texto, valor) {
  const grupo = screen.getByRole('radiogroup', { name: texto });
  await user.click(within(grupo).getByLabelText(String(valor)));
}

describe('FormularioEncuesta (organismo)', () => {
  it('no permite enviar hasta responder las 4 preguntas', async () => {
    const user = userEvent.setup();
    const onEnviar = vi.fn();
    render(<FormularioEncuesta encuesta={ENCUESTA} onEnviar={onEnviar} />);

    const boton = screen.getByRole('button', { name: 'Enviar encuesta' });
    for (const pregunta of PREGUNTAS.slice(0, 3)) {
      await responderPregunta(user, pregunta.texto, 5);
    }
    expect(boton).toBeDisabled();

    await responderPregunta(user, PREGUNTAS[3].texto, 4);
    expect(boton).toBeEnabled();
  });

  it('envía las respuestas con el comentario (vacío = null)', async () => {
    const user = userEvent.setup();
    const onEnviar = vi.fn();
    render(<FormularioEncuesta encuesta={ENCUESTA} onEnviar={onEnviar} />);

    await responderPregunta(user, PREGUNTAS[0].texto, 5);
    await responderPregunta(user, PREGUNTAS[1].texto, 4);
    await responderPregunta(user, PREGUNTAS[2].texto, 3);
    await responderPregunta(user, PREGUNTAS[3].texto, 5);
    await user.click(screen.getByRole('button', { name: 'Enviar encuesta' }));

    expect(onEnviar).toHaveBeenCalledWith({ claridad: 5, puntualidad: 4, retroalimentacion: 3, dominio: 5, comentario: null });
  });

  it('muestra "Enviando..." mientras se registra', () => {
    render(<FormularioEncuesta encuesta={ENCUESTA} onEnviar={() => {}} enviando />);
    expect(screen.getByRole('button', { name: 'Enviando...' })).toBeDisabled();
  });
});

describe('EncuestasView - el alumno responde la encuesta docente', () => {
  it('registra la respuesta en el backend y la encuesta desaparece', async () => {
    const user = userEvent.setup();
    encuestasService.pendientes.mockResolvedValueOnce([ENCUESTA]).mockResolvedValue([]);
    encuestasService.responder.mockResolvedValue({});
    render(<EncuestasView />);

    expect(await screen.findByText('Encuesta Docente 2026-2')).toBeInTheDocument();
    for (const pregunta of PREGUNTAS) {
      await responderPregunta(user, pregunta.texto, 5);
    }
    await user.type(screen.getByLabelText('Comentario (opcional)'), 'Explica muy bien');
    await user.click(screen.getByRole('button', { name: 'Enviar encuesta' }));

    expect(encuestasService.responder).toHaveBeenCalledWith(7, {
      claridad: 5, puntualidad: 5, retroalimentacion: 5, dominio: 5, comentario: 'Explica muy bien',
    });
    expect(await screen.findByText(/tu respuesta para Desarrollo Fullstack II fue registrada/i)).toBeInTheDocument();
    expect(await screen.findByText(/no tienes encuestas pendientes/i)).toBeInTheDocument();
  });

  it('muestra el error si el alumno ya había respondido', async () => {
    const user = userEvent.setup();
    encuestasService.pendientes.mockResolvedValue([ENCUESTA]);
    encuestasService.responder.mockRejectedValue({
      response: { status: 409, data: { mensaje: 'Ya respondiste esta encuesta' } },
    });
    render(<EncuestasView />);

    await screen.findByText('Encuesta Docente 2026-2');
    for (const pregunta of PREGUNTAS) {
      await responderPregunta(user, pregunta.texto, 3);
    }
    await user.click(screen.getByRole('button', { name: 'Enviar encuesta' }));
    expect(await screen.findByText('Ya respondiste esta encuesta')).toBeInTheDocument();
  });
});
