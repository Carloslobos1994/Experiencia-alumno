import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider } from './AuthProvider';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../api/servicios';
import { EVENTO_SESION_EXPIRADA } from '../api/axiosClient';
import { guardarSesion, leerSesion } from '../utils/sesion';

vi.mock('../api/servicios', () => ({
  authService: { login: vi.fn(), me: vi.fn() },
}));

/** JWT de prueba (sin firma real): solo importa el campo exp. */
function token(segundosDesdeAhora) {
  const exp = Math.floor(Date.now() / 1000) + segundosDesdeAhora;
  return `cabecera.${btoa(JSON.stringify({ exp }))}.firma`;
}

const CARLOS = { id: 4, nombre: 'Carlos Lobos', rol: 'ALUMNO' };

/** Componente consumidor: muestra el estado de la sesión y expone login/logout. */
function Consumidor() {
  const { usuario, autenticado, verificando, login, logout } = useAuth();
  let estado = 'anónimo';
  if (verificando) {
    estado = 'verificando';
  } else if (autenticado) {
    estado = usuario.nombre;
  }
  return (
    <div>
      <span data-testid="estado">{estado}</span>
      <button onClick={() => login('  Carlos.Lobos@DUOCUC.cl ', 'Duoc2026!')}>entrar</button>
      <button onClick={logout}>salir</button>
    </div>
  );
}

function renderizar() {
  return render(
    <AuthProvider>
      <Consumidor />
    </AuthProvider>,
  );
}

describe('AuthProvider - manejo de sesión con JWT', () => {
  it('login: normaliza el correo, guarda los tokens y deja al usuario autenticado', async () => {
    const user = userEvent.setup();
    authService.login.mockResolvedValue({ accessToken: token(900), refreshToken: token(604800), usuario: CARLOS });
    renderizar();
    expect(screen.getByTestId('estado')).toHaveTextContent('anónimo');

    await user.click(screen.getByRole('button', { name: 'entrar' }));

    expect(authService.login).toHaveBeenCalledWith('carlos.lobos@duocuc.cl', 'Duoc2026!');
    expect(await screen.findByText('Carlos Lobos')).toBeInTheDocument();
    expect(leerSesion().usuario).toEqual(CARLOS);
  });

  it('logout: borra la sesión del navegador', async () => {
    const user = userEvent.setup();
    authService.login.mockResolvedValue({ accessToken: token(900), refreshToken: token(604800), usuario: CARLOS });
    renderizar();
    await user.click(screen.getByRole('button', { name: 'entrar' }));
    await screen.findByText('Carlos Lobos');

    await user.click(screen.getByRole('button', { name: 'salir' }));
    expect(screen.getByTestId('estado')).toHaveTextContent('anónimo');
    expect(leerSesion()).toBeNull();
  });

  it('recarga (F5): restaura la sesión guardada y la confirma con /auth/me', async () => {
    guardarSesion({ accessToken: token(900), refreshToken: token(604800), usuario: CARLOS });
    authService.me.mockResolvedValue({ ...CARLOS, fotoUrl: '/avatars/carlos.jpg' });
    renderizar();

    expect(screen.getByTestId('estado')).toHaveTextContent('verificando');
    expect(await screen.findByText('Carlos Lobos')).toBeInTheDocument();
    expect(authService.me).toHaveBeenCalledTimes(1);
    expect(leerSesion().usuario.fotoUrl).toBe('/avatars/carlos.jpg');
  });

  it('si /auth/me rechaza el token, se cierra la sesión', async () => {
    guardarSesion({ accessToken: token(900), refreshToken: token(604800), usuario: CARLOS });
    authService.me.mockRejectedValue({ response: { status: 401 } });
    renderizar();

    expect(await screen.findByText('anónimo')).toBeInTheDocument();
    expect(leerSesion()).toBeNull();
  });

  it('con el refresh token vencido no intenta restaurar la sesión', () => {
    guardarSesion({ accessToken: token(-60), refreshToken: token(-60), usuario: CARLOS });
    renderizar();

    expect(screen.getByTestId('estado')).toHaveTextContent('anónimo');
    expect(authService.me).not.toHaveBeenCalled();
    expect(leerSesion()).toBeNull();
  });

  it('el evento "sesion-expirada" del interceptor cierra la sesión en la interfaz', async () => {
    const user = userEvent.setup();
    authService.login.mockResolvedValue({ accessToken: token(900), refreshToken: token(604800), usuario: CARLOS });
    renderizar();
    await user.click(screen.getByRole('button', { name: 'entrar' }));
    await screen.findByText('Carlos Lobos');

    act(() => {
      window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
    });
    expect(screen.getByTestId('estado')).toHaveTextContent('anónimo');
  });

  it('useAuth fuera de <AuthProvider> lanza un error claro', () => {
    const silenciar = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumidor />)).toThrow(/AuthProvider/);
    silenciar.mockRestore();
  });
});
