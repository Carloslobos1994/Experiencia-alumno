import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginView from './LoginView';
import { useAuth } from '../hooks/useAuth';

// Mock: reemplazamos el hook de autenticacion para no llamar al backend real
vi.mock('../hooks/useAuth', () => ({ useAuth: vi.fn() }));

function renderizar() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/alumno" element={<p>Inicio alumno</p>} />
        <Route path="/admin/usuarios" element={<p>Panel admin</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LoginView - inicio de sesión con JWT', () => {
  let login;

  beforeEach(() => {
    login = vi.fn();
    useAuth.mockReturnValue({ login, usuario: null });
  });

  it('permite escribir correo y contraseña', async () => {
    const user = userEvent.setup();
    renderizar();
    await user.type(screen.getByLabelText(/correo institucional/i), 'carlos.lobos@duocuc.cl');
    await user.type(screen.getByLabelText(/contraseña/i), 'Duoc2026!');
    expect(screen.getByLabelText(/correo institucional/i)).toHaveValue('carlos.lobos@duocuc.cl');
    expect(screen.getByLabelText(/contraseña/i)).toHaveValue('Duoc2026!');
  });

  it('rechaza correos no institucionales sin llamar al backend', async () => {
    const user = userEvent.setup();
    renderizar();
    await user.type(screen.getByLabelText(/correo institucional/i), 'correo@gmail.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'Duoc2026!');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));
    expect(screen.getByText(/acceso restringido/i)).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('exige la contraseña', async () => {
    const user = userEvent.setup();
    renderizar();
    await user.type(screen.getByLabelText(/correo institucional/i), 'carlos.lobos@duocuc.cl');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));
    expect(screen.getByText(/debe ingresar su contraseña/i)).toBeInTheDocument();
  });

  it('con credenciales correctas redirige al inicio según el rol', async () => {
    const user = userEvent.setup();
    login.mockResolvedValue({ id: 4, rol: 'ALUMNO' });
    renderizar();
    await user.type(screen.getByLabelText(/correo institucional/i), 'carlos.lobos@duocuc.cl');
    await user.type(screen.getByLabelText(/contraseña/i), 'Duoc2026!');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));
    expect(login).toHaveBeenCalledWith('carlos.lobos@duocuc.cl', 'Duoc2026!');
    expect(await screen.findByText('Inicio alumno')).toBeInTheDocument();
  });

  it('muestra el mensaje del backend si las credenciales son incorrectas (401)', async () => {
    const user = userEvent.setup();
    login.mockRejectedValue({ response: { status: 401, data: { mensaje: 'Correo o contraseña incorrectos' } } });
    renderizar();
    await user.type(screen.getByLabelText(/correo institucional/i), 'carlos.lobos@duocuc.cl');
    await user.type(screen.getByLabelText(/contraseña/i), 'mala-clave');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));
    expect(await screen.findByText('Correo o contraseña incorrectos')).toBeInTheDocument();
  });

  it('si ya hay sesión activa no muestra el login', () => {
    useAuth.mockReturnValue({ login, usuario: { rol: 'ADMIN' } });
    renderizar();
    expect(screen.getByText('Panel admin')).toBeInTheDocument();
  });
});
