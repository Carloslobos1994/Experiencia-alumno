import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import NoAutorizadoView from './NoAutorizadoView';
import NoEncontradoView from './NoEncontradoView';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ usuario: { id: 2, nombre: 'Mario Adrián Huerta Silva', rol: 'PROFESOR' } }),
}));

describe('Páginas de error', () => {
  it('403: explica el acceso denegado y vuelve al inicio del rol', () => {
    render(<MemoryRouter><NoAutorizadoView /></MemoryRouter>);
    expect(screen.getByText('403')).toBeInTheDocument();
    expect(screen.getByText('Acceso no autorizado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver a mi inicio' })).toHaveAttribute('href', '/profesor/cursos');
  });

  it('404: indica que la página no existe y enlaza al inicio', () => {
    render(<MemoryRouter><NoEncontradoView /></MemoryRouter>);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ir al inicio' })).toHaveAttribute('href', '/');
  });
});
