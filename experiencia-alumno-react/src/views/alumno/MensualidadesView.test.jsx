import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MensualidadesView from './MensualidadesView';
import { finanzasService } from '../../api/servicios';

// Mocks: usuario autenticado y servicios de la API
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ usuario: { id: 4, nombre: 'Carlos', carrera: 'Analista Programador', rol: 'ALUMNO' } }),
}));
vi.mock('../../api/servicios', () => ({
  finanzasService: { misCuotas: vi.fn(), misBoletas: vi.fn(), pagar: vi.fn() },
}));

const CUOTAS = [
  { id: 1, concepto: 'Mensualidad Octubre 2026', categoriaNombre: 'Mensualidad', vencimiento: '2026-10-25', monto: 319000, estado: 'PAGADA' },
  { id: 2, concepto: 'Mensualidad Noviembre 2026', categoriaNombre: 'Mensualidad', vencimiento: '2026-11-25', monto: 319000, estado: 'PENDIENTE' },
  { id: 3, concepto: 'Mensualidad Diciembre 2026', categoriaNombre: 'Mensualidad', vencimiento: '2026-12-25', monto: 319000, estado: 'PENDIENTE' },
];

describe('MensualidadesView - carrito de mensualidades integrado con la API', () => {
  beforeEach(() => {
    finanzasService.misCuotas.mockResolvedValue(CUOTAS);
    finanzasService.misBoletas.mockResolvedValue([]);
  });

  it('carga las cuotas del alumno desde el backend', async () => {
    render(<MensualidadesView />);
    expect(await screen.findByText('Mensualidad Noviembre 2026')).toBeInTheDocument();
    expect(finanzasService.misCuotas).toHaveBeenCalled();
  });

  it('solo las cuotas pendientes tienen casilla para pagar', async () => {
    render(<MensualidadesView />);
    await screen.findByText('Mensualidad Noviembre 2026');
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });

  it('el botón de pago está deshabilitado si no hay selección', async () => {
    render(<MensualidadesView />);
    const boton = await screen.findByRole('button', { name: /pagar selección/i });
    expect(boton).toBeDisabled();
  });

  it('al seleccionar dos cuotas suma el total y envía los ids al backend', async () => {
    const user = userEvent.setup();
    finanzasService.pagar.mockResolvedValue({ numero: 'B-000005', total: 638000 });
    render(<MensualidadesView />);

    await user.click(await screen.findByLabelText('Seleccionar Mensualidad Noviembre 2026'));
    await user.click(screen.getByLabelText('Seleccionar Mensualidad Diciembre 2026'));

    const boton = screen.getByRole('button', { name: /pagar selección/i });
    expect(boton).toHaveTextContent('$638.000');
    expect(within(screen.getByRole('heading', { name: /total a pagar/i })).getByText('$638.000')).toBeInTheDocument();

    await user.click(boton);

    expect(finanzasService.pagar).toHaveBeenCalledWith([2, 3], 'WEBPAY');
    expect(await screen.findByText(/boleta B-000005/i)).toBeInTheDocument();
  });

  it('muestra el error del backend si el pago es rechazado', async () => {
    const user = userEvent.setup();
    finanzasService.pagar.mockRejectedValue({ response: { status: 400, data: { mensaje: "La cuota 'Mensualidad Noviembre 2026' ya está pagada" } } });
    render(<MensualidadesView />);

    await user.click(await screen.findByLabelText('Seleccionar Mensualidad Noviembre 2026'));
    await user.click(screen.getByRole('button', { name: /pagar selección/i }));

    expect(await screen.findByText(/ya está pagada/i)).toBeInTheDocument();
  });
});
