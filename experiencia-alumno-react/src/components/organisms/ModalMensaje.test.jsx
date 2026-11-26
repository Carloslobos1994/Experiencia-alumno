import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ModalMensaje from './ModalMensaje';
import { mensajesService } from '../../api/servicios';

vi.mock('../../api/servicios', () => ({
  mensajesService: { enviar: vi.fn() },
}));

const CONTACTOS = [
  { id: 2, nombre: 'Mario Adrián Huerta Silva', email: 'mari.huertas@profesorduocuc.cl', rol: 'PROFESOR' },
  { id: 5, nombre: 'Marcelo Pincheira', email: 'marcelo@duocuc.cl', rol: 'ALUMNO' },
];

describe('ModalMensaje (organismo) - redactar y responder', () => {
  it('el botón Enviar se habilita solo con destinatario, asunto y mensaje', async () => {
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const onEnviado = vi.fn();
    mensajesService.enviar.mockResolvedValue({ id: 50 });
    render(<ModalMensaje contactos={CONTACTOS} onCerrar={onCerrar} onEnviado={onEnviado} />);

    expect(screen.getByText('Nuevo mensaje')).toBeInTheDocument();
    const enviar = screen.getByRole('button', { name: 'Enviar Mensaje' });
    expect(enviar).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /alumnos/i }));
    await user.click(screen.getByText('Marcelo Pincheira'));
    await user.type(screen.getByLabelText('Asunto *'), '  Coordinación EP3  ');
    expect(enviar).toBeDisabled();
    await user.type(screen.getByLabelText('Mensaje *'), 'Subo mi parte hoy');
    expect(enviar).toBeEnabled();

    await user.click(enviar);
    expect(mensajesService.enviar).toHaveBeenCalledWith({
      destinatarioId: 5, asunto: 'Coordinación EP3', cuerpo: 'Subo mi parte hoy', respuestaAId: null,
    });
    expect(onEnviado).toHaveBeenCalledWith({ id: 50 });
    expect(onCerrar).toHaveBeenCalled();
  });

  it('al responder muestra el título, el destinatario fijo y el asunto con RE:', () => {
    render(
      <ModalMensaje onCerrar={() => {}} respuestaAId={10} asuntoInicial="RE: Coordinación EP3"
        destinatario={{ id: 5, nombre: 'Marcelo Pincheira', rol: 'ALUMNO' }} />,
    );
    expect(screen.getByText('Responder mensaje')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Marcelo Pincheira (Alumno)')).toBeDisabled();
    expect(screen.getByLabelText('Asunto *')).toHaveValue('RE: Coordinación EP3');
  });

  it('muestra el error del backend y no cierra el modal', async () => {
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mensajesService.enviar.mockRejectedValue({
      response: { status: 403, data: { mensaje: 'No puedes enviar mensajes a este usuario' } },
    });
    render(<ModalMensaje onCerrar={onCerrar} destinatario={{ id: 9, nombre: 'Otro', email: 'otro@duocuc.cl' }} />);

    expect(screen.getByText('Nuevo mensaje para Otro')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Asunto *'), 'Hola');
    await user.type(screen.getByLabelText('Mensaje *'), 'Prueba');
    await user.click(screen.getByRole('button', { name: 'Enviar Mensaje' }));

    expect(await screen.findByText('No puedes enviar mensajes a este usuario')).toBeInTheDocument();
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('Cancelar cierra sin enviar', async () => {
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    render(<ModalMensaje contactos={CONTACTOS} onCerrar={onCerrar} />);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCerrar).toHaveBeenCalled();
    expect(mensajesService.enviar).not.toHaveBeenCalled();
  });
});
