import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MensajesView from './MensajesView';
import { mensajesService } from '../api/servicios';

vi.mock('../api/servicios', () => ({
  mensajesService: { recibidos: vi.fn(), enviados: vi.fn(), contactos: vi.fn(), marcarLeido: vi.fn(), enviar: vi.fn() },
}));

const RECIBIDO_NUEVO = {
  id: 10, remitenteId: 5, remitenteNombre: 'Marcelo Pincheira', remitenteRol: 'ALUMNO',
  destinatarioNombre: 'Carlos Lobos', asunto: 'Coordinación EP3', cuerpo: 'Yo me encargo de las vistas del alumno.',
  fechaEnvio: '2026-11-24T10:30:00', leido: false,
};
const RECIBIDO_LEIDO = {
  id: 11, remitenteId: 1, remitenteNombre: 'María Finanzas', remitenteRol: 'ADMIN',
  destinatarioNombre: 'Carlos Lobos', asunto: 'Mensualidad de diciembre', cuerpo: 'Recuerda revisar tus cuotas.',
  fechaEnvio: '2026-11-20T09:00:00', leido: true,
};
const ENVIADO = {
  id: 12, remitenteId: 4, remitenteNombre: 'Carlos Lobos', remitenteRol: 'ALUMNO',
  destinatarioNombre: 'Mario Adrián Huerta Silva', asunto: 'Consulta sobre la EP3', cuerpo: '¿Se presenta en grupo?',
  fechaEnvio: '2026-11-23T18:00:00', leido: true,
};

describe('MensajesView - mensajería interna', () => {
  beforeEach(() => {
    mensajesService.recibidos.mockResolvedValue([RECIBIDO_NUEVO, RECIBIDO_LEIDO]);
    mensajesService.enviados.mockResolvedValue([ENVIADO]);
    mensajesService.contactos.mockResolvedValue([]);
  });

  it('muestra la bandeja con el conteo de recibidos y enviados', async () => {
    render(<MensajesView />);
    expect(await screen.findByRole('tab', { name: 'Recibidos (2)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Enviados (1)' })).toBeInTheDocument();
    expect(screen.getByText('Nuevo')).toBeInTheDocument();
    expect(screen.getByText('Selecciona un mensaje para leerlo.')).toBeInTheDocument();
  });

  it('al abrir un mensaje nuevo lo marca como leído en el backend', async () => {
    const user = userEvent.setup();
    mensajesService.marcarLeido.mockResolvedValue({ ...RECIBIDO_NUEVO, leido: true });
    render(<MensajesView />);

    await user.click(await screen.findByText('Coordinación EP3'));
    expect(mensajesService.marcarLeido).toHaveBeenCalledWith(10);
    expect(await screen.findByText('Yo me encargo de las vistas del alumno.')).toBeInTheDocument();
  });

  it('un mensaje ya leído no se vuelve a marcar', async () => {
    const user = userEvent.setup();
    render(<MensajesView />);

    await user.click(await screen.findByText('Mensualidad de diciembre'));
    expect(screen.getByText('Recuerda revisar tus cuotas.')).toBeInTheDocument();
    expect(mensajesService.marcarLeido).not.toHaveBeenCalled();
  });

  it('responde un mensaje con "RE:" y el id del mensaje original', async () => {
    const user = userEvent.setup();
    mensajesService.marcarLeido.mockResolvedValue({ ...RECIBIDO_NUEVO, leido: true });
    mensajesService.enviar.mockResolvedValue({ id: 13 });
    render(<MensajesView />);

    await user.click(await screen.findByText('Coordinación EP3'));
    await user.click(await screen.findByRole('button', { name: 'Responder' }));

    expect(screen.getByText('Responder mensaje')).toBeInTheDocument();
    expect(screen.getByLabelText('Asunto *')).toHaveValue('RE: Coordinación EP3');
    await user.type(screen.getByLabelText('Mensaje *'), 'Perfecto, yo hago la seguridad.');
    await user.click(screen.getByRole('button', { name: 'Enviar Mensaje' }));

    expect(mensajesService.enviar).toHaveBeenCalledWith({
      destinatarioId: 5, asunto: 'RE: Coordinación EP3', cuerpo: 'Perfecto, yo hago la seguridad.', respuestaAId: 10,
    });
    expect(await screen.findByText('Mensaje enviado correctamente')).toBeInTheDocument();
  });

  it('los mensajes enviados no tienen botón Responder', async () => {
    const user = userEvent.setup();
    render(<MensajesView />);

    await user.click(await screen.findByRole('tab', { name: 'Enviados (1)' }));
    await user.click(screen.getByText('Consulta sobre la EP3'));
    expect(screen.getByText('¿Se presenta en grupo?')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Responder' })).not.toBeInTheDocument();
  });
});
