import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminUsuariosView from './AdminUsuariosView';
import { usuariosService } from '../../api/servicios';

vi.mock('../../api/servicios', () => ({
  usuariosService: { listar: vi.fn(), crear: vi.fn(), actualizar: vi.fn(), desactivar: vi.fn() },
}));

const USUARIOS = [
  { id: 1, nombre: 'María Finanzas', rut: '11.111.111-1', email: 'mariafinanzas@adminduocuc.cl', rol: 'ADMIN', activo: true },
  { id: 2, nombre: 'Mario Adrián Huerta Silva', rut: '22.222.222-2', email: 'mari.huertas@profesorduocuc.cl', rol: 'PROFESOR', activo: true },
  { id: 4, nombre: 'Carlos Lobos', rut: '12.345.678-9', email: 'carlos.lobos@duocuc.cl', rol: 'ALUMNO', activo: true,
    carrera: 'Analista Programador', sede: 'Plaza Oeste', fotoUrl: '/avatars/carlos.jpg' },
  { id: 9, nombre: 'Ex Alumno', rut: '9.999.999-9', email: 'ex@duocuc.cl', rol: 'ALUMNO', activo: false },
];

describe('AdminUsuariosView - CRUD de usuarios (ADMIN)', () => {
  beforeEach(() => {
    usuariosService.listar.mockResolvedValue(USUARIOS);
  });

  it('lista los usuarios con su rol y estado', async () => {
    render(<AdminUsuariosView />);
    expect(await screen.findByText('carlos.lobos@duocuc.cl')).toBeInTheDocument();
    expect(screen.getByText('mari.huertas@profesorduocuc.cl')).toBeInTheDocument();
    expect(screen.getAllByText('Activo')).toHaveLength(3);
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
    // una cuenta inactiva no muestra el botón Desactivar
    expect(screen.getAllByRole('button', { name: 'Desactivar' })).toHaveLength(3);
  });

  it('filtra por rol pidiéndole al backend solo ese rol', async () => {
    const user = userEvent.setup();
    render(<AdminUsuariosView />);
    await screen.findByText('carlos.lobos@duocuc.cl');

    await user.selectOptions(screen.getByLabelText('Filtrar por rol'), 'PROFESOR');
    await waitFor(() => expect(usuariosService.listar).toHaveBeenLastCalledWith('PROFESOR'));
  });

  it('crea un alumno nuevo con los valores por defecto', async () => {
    const user = userEvent.setup();
    usuariosService.crear.mockResolvedValue({ id: 10 });
    render(<AdminUsuariosView />);
    await screen.findByText('carlos.lobos@duocuc.cl');

    await user.click(screen.getByRole('button', { name: 'Nuevo usuario' }));
    await user.type(screen.getByLabelText('Nombre completo *'), 'Angelo Olivares');
    await user.type(screen.getByLabelText('RUT *'), '20.123.456-7');
    await user.type(screen.getByLabelText('Correo institucional *'), 'angelo@duocuc.cl');
    await user.type(screen.getByLabelText('Contraseña *'), 'Duoc2026!');
    await user.clear(screen.getByLabelText('Carrera'));
    await user.type(screen.getByLabelText('Carrera'), 'Ingeniería en Informática');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(usuariosService.crear).toHaveBeenCalledWith({
      nombre: 'Angelo Olivares', rut: '20.123.456-7', email: 'angelo@duocuc.cl', password: 'Duoc2026!',
      rol: 'ALUMNO', carrera: 'Ingeniería en Informática', sede: 'Plaza Oeste', activo: true, fotoUrl: null,
    });
    expect(await screen.findByText('Usuario Angelo Olivares creado')).toBeInTheDocument();
    expect(usuariosService.listar).toHaveBeenCalledTimes(2);
  });

  it('muestra el error si el correo ya existe', async () => {
    const user = userEvent.setup();
    usuariosService.crear.mockRejectedValue({
      response: { status: 409, data: { mensaje: 'Ya existe un usuario con el correo carlos.lobos@duocuc.cl' } },
    });
    render(<AdminUsuariosView />);
    await screen.findByText('carlos.lobos@duocuc.cl');

    await user.click(screen.getByRole('button', { name: 'Nuevo usuario' }));
    await user.type(screen.getByLabelText('Nombre completo *'), 'Duplicado');
    await user.type(screen.getByLabelText('RUT *'), '1-9');
    await user.type(screen.getByLabelText('Correo institucional *'), 'carlos.lobos@duocuc.cl');
    await user.type(screen.getByLabelText('Contraseña *'), 'Duoc2026!');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText(/ya existe un usuario con el correo/i)).toBeInTheDocument();
  });

  it('al editar, la contraseña vacía se envía como null (no se cambia)', async () => {
    const user = userEvent.setup();
    usuariosService.actualizar.mockResolvedValue({});
    render(<AdminUsuariosView />);
    await screen.findByText('carlos.lobos@duocuc.cl');

    await user.click(screen.getAllByRole('button', { name: 'Editar' })[2]);
    expect(screen.getByText('Editar usuario')).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Sede'));
    await user.type(screen.getByLabelText('Sede'), 'San Joaquín');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(usuariosService.actualizar).toHaveBeenCalledWith(4, expect.objectContaining({
      email: 'carlos.lobos@duocuc.cl', password: null, sede: 'San Joaquín', fotoUrl: '/avatars/carlos.jpg',
    }));
    expect(await screen.findByText('Usuario Carlos Lobos actualizado')).toBeInTheDocument();
  });

  it('desactiva una cuenta tras confirmar', async () => {
    const user = userEvent.setup();
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true);
    usuariosService.desactivar.mockResolvedValue({});
    render(<AdminUsuariosView />);
    await screen.findByText('carlos.lobos@duocuc.cl');

    await user.click(screen.getAllByRole('button', { name: 'Desactivar' })[2]);
    expect(usuariosService.desactivar).toHaveBeenCalledWith(4);
    expect(await screen.findByText('Cuenta de Carlos Lobos desactivada')).toBeInTheDocument();
    confirmar.mockRestore();
  });
});
