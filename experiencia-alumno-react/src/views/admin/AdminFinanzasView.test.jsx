import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminFinanzasView from './AdminFinanzasView';
import { finanzasService, usuariosService } from '../../api/servicios';

vi.mock('../../api/servicios', () => ({
  finanzasService: {
    cuotas: vi.fn(), boletas: vi.fn(), categorias: vi.fn(),
    crearLote: vi.fn(), crearCuota: vi.fn(), eliminarCuota: vi.fn(),
  },
  usuariosService: { listar: vi.fn() },
}));

const ALUMNOS = [
  { id: 4, nombre: 'Carlos Lobos' },
  { id: 5, nombre: 'Marcelo Pincheira' },
];
const CUOTAS = [
  { id: 1, alumnoId: 4, alumnoNombre: 'Carlos Lobos', categoriaNombre: 'Mensualidad', concepto: 'Mensualidad Octubre 2026',
    monto: 319000, vencimiento: '2026-10-25', estado: 'PAGADA' },
  { id: 2, alumnoId: 4, alumnoNombre: 'Carlos Lobos', categoriaNombre: 'Mensualidad', concepto: 'Mensualidad Noviembre 2026',
    monto: 319000, vencimiento: '2026-11-25', estado: 'PENDIENTE' },
  { id: 3, alumnoId: 5, alumnoNombre: 'Marcelo Pincheira', categoriaNombre: 'Mensualidad', concepto: 'Mensualidad Noviembre 2026',
    monto: 319000, vencimiento: '2026-11-25', estado: 'PENDIENTE' },
];
const BOLETAS = [
  { id: 1, numero: 'B-000001', alumnoNombre: 'Carlos Lobos', alumnoRut: '11.111.111-1', fecha: '2026-10-05T10:15:00',
    total: 957000, medioPago: 'WEBPAY', detalles: [{ concepto: 'Mensualidad Agosto 2026' }, { concepto: 'Mensualidad Septiembre 2026' }] },
];

describe('AdminFinanzasView - Finanzas carga y controla las mensualidades', () => {
  beforeEach(() => {
    finanzasService.cuotas.mockResolvedValue(CUOTAS);
    finanzasService.boletas.mockResolvedValue(BOLETAS);
    finanzasService.categorias.mockResolvedValue([{ id: 1, nombre: 'Mensualidad' }, { id: 2, nombre: 'Matrícula' }]);
    usuariosService.listar.mockResolvedValue(ALUMNOS);
  });

  it('calcula lo recaudado (boletas) y lo pendiente por cobrar (cuotas pendientes)', async () => {
    render(<AdminFinanzasView />);
    expect(await screen.findByText('Total recaudado')).toBeInTheDocument();
    expect(screen.getAllByText('$957.000').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('$638.000')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Boletas (1)' })).toBeInTheDocument();
  });

  it('solo las cuotas pendientes se pueden eliminar', async () => {
    render(<AdminFinanzasView />);
    await screen.findByText('Total recaudado');
    expect(screen.getAllByRole('button', { name: 'Eliminar' })).toHaveLength(2);
  });

  it('carga masiva: informa cuántas cuotas se crearon y cuántas se omitieron', async () => {
    const user = userEvent.setup();
    finanzasService.crearLote.mockResolvedValue({ creadas: 2, omitidas: 0, cuotas: [] });
    render(<AdminFinanzasView />);

    await user.click(await screen.findByRole('button', { name: 'Carga masiva' }));
    expect(screen.getByText('Carga masiva (todos los alumnos activos)')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Vencimiento *'), { target: { value: '2027-01-25' } });
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(finanzasService.crearLote).toHaveBeenCalledWith({
      categoriaId: 1, concepto: 'Mensualidad Enero 2027', monto: 319000, vencimiento: '2027-01-25', periodo: '2027-1',
    });
    expect(await screen.findByText('Carga masiva: 2 cuota(s) creadas, 0 omitida(s) por duplicado.')).toBeInTheDocument();
  });

  it('asigna una cuota individual a un alumno', async () => {
    const user = userEvent.setup();
    finanzasService.crearCuota.mockResolvedValue({ id: 9 });
    render(<AdminFinanzasView />);

    await user.click(await screen.findByRole('button', { name: 'Asignar cuota' }));
    await user.selectOptions(screen.getByLabelText('Alumno *'), '5');
    await user.selectOptions(screen.getByLabelText('Categoría *'), '2');
    const concepto = screen.getByLabelText('Concepto *');
    await user.clear(concepto);
    await user.type(concepto, 'Matrícula 2027');
    fireEvent.change(screen.getByLabelText('Vencimiento *'), { target: { value: '2027-03-10' } });
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(finanzasService.crearCuota).toHaveBeenCalledWith(expect.objectContaining({
      alumnoId: 5, categoriaId: 2, concepto: 'Matrícula 2027', vencimiento: '2027-03-10',
    }));
    expect(await screen.findByText('Cuota asignada correctamente.')).toBeInTheDocument();
  });

  it('muestra el error del backend al asignar una cuota', async () => {
    const user = userEvent.setup();
    finanzasService.crearCuota.mockRejectedValue({
      response: { status: 400, data: { mensaje: 'Las cuotas solo se asignan a alumnos activos' } },
    });
    render(<AdminFinanzasView />);

    await user.click(await screen.findByRole('button', { name: 'Asignar cuota' }));
    await user.selectOptions(screen.getByLabelText('Alumno *'), '4');
    fireEvent.change(screen.getByLabelText('Vencimiento *'), { target: { value: '2027-01-25' } });
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Las cuotas solo se asignan a alumnos activos')).toBeInTheDocument();
  });

  it('filtra las cuotas por alumno pidiéndolas al backend', async () => {
    const user = userEvent.setup();
    render(<AdminFinanzasView />);

    await user.selectOptions(await screen.findByLabelText('Filtrar por alumno'), '4');
    await waitFor(() => expect(finanzasService.cuotas).toHaveBeenLastCalledWith('4'));
  });

  it('elimina una cuota pendiente tras confirmar', async () => {
    const user = userEvent.setup();
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true);
    finanzasService.eliminarCuota.mockResolvedValue({});
    render(<AdminFinanzasView />);

    await user.click((await screen.findAllByRole('button', { name: 'Eliminar' }))[0]);
    expect(finanzasService.eliminarCuota).toHaveBeenCalledWith(2);
    await waitFor(() => expect(finanzasService.cuotas).toHaveBeenCalledTimes(2));
    confirmar.mockRestore();
  });
});
