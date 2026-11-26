import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NavbarPrincipal from './NavbarPrincipal';
import { useAuth } from '../../hooks/useAuth';
import { mensajesService } from '../../api/servicios';

vi.mock('../../hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../../api/servicios', () => ({ mensajesService: { noLeidos: vi.fn() } }));

function renderizar() {
  return render(
    <MemoryRouter>
      <NavbarPrincipal />
    </MemoryRouter>,
  );
}

describe('NavbarPrincipal - menú según el rol', () => {
  beforeEach(() => {
    mensajesService.noLeidos.mockResolvedValue({ noLeidos: 3 });
  });

  it('el ALUMNO ve Mensualidades y no ve Usuarios ni Finanzas', async () => {
    useAuth.mockReturnValue({ usuario: { nombre: 'Carlos', rol: 'ALUMNO' }, logout: vi.fn() });
    renderizar();
    expect(screen.getByRole('link', { name: /mensualidades/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /usuarios/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /finanzas/i })).not.toBeInTheDocument();
    expect(await screen.findByLabelText('3 mensajes sin leer')).toBeInTheDocument();
  });

  it('el ADMIN ve Usuarios y Finanzas', () => {
    useAuth.mockReturnValue({ usuario: { nombre: 'María', rol: 'ADMIN' }, logout: vi.fn() });
    renderizar();
    expect(screen.getByRole('link', { name: /usuarios/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /finanzas/i })).toBeInTheDocument();
    expect(screen.getByText('Administración')).toBeInTheDocument();
  });

  it('cerrar sesión llama a logout', async () => {
    const user = userEvent.setup();
    const logout = vi.fn();
    useAuth.mockReturnValue({ usuario: { nombre: 'Mario', rol: 'PROFESOR' }, logout });
    renderizar();
    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }));
    expect(logout).toHaveBeenCalled();
  });
});
