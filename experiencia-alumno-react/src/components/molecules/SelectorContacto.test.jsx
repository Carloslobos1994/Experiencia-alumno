import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SelectorContacto from './SelectorContacto';
import DirectorioContactos from '../organisms/DirectorioContactos';

const CONTACTOS = [
  { id: 1, nombre: 'María Finanzas', email: 'mariafinanzas@adminduocuc.cl', rol: 'ADMIN' },
  { id: 2, nombre: 'Mario Adrián Huerta Silva', email: 'mari.huertas@profesorduocuc.cl', rol: 'PROFESOR' },
  { id: 3, nombre: 'Emilio Núñez', email: 'emilio@duocuc.cl', rol: 'ALUMNO' },
  { id: 4, nombre: 'Marcelo Pincheira', email: 'marcelo@duocuc.cl', rol: 'ALUMNO' },
];

describe('SelectorContacto (molécula) - destinatario por sección', () => {
  it('parte en Profesores y permite cambiar a Alumnos', async () => {
    const user = userEvent.setup();
    render(<SelectorContacto contactos={CONTACTOS} seleccionadoId={null} onSeleccionar={() => {}} />);

    expect(screen.getByText('Mario Adrián Huerta Silva')).toBeInTheDocument();
    expect(screen.queryByText('Marcelo Pincheira')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /alumnos/i }));
    expect(screen.getByText('Marcelo Pincheira')).toBeInTheDocument();
    expect(screen.getByText('Emilio Núñez')).toBeInTheDocument();
  });

  it('busca dentro de la sección y selecciona el contacto', async () => {
    const user = userEvent.setup();
    const onSeleccionar = vi.fn();
    render(<SelectorContacto contactos={CONTACTOS} seleccionadoId={null} onSeleccionar={onSeleccionar} />);

    await user.click(screen.getByRole('button', { name: /alumnos/i }));
    await user.type(screen.getByLabelText('Buscar contacto'), 'nunez');

    expect(screen.queryByText('Marcelo Pincheira')).not.toBeInTheDocument();
    await user.click(screen.getByText('Emilio Núñez'));
    expect(onSeleccionar).toHaveBeenCalledWith(CONTACTOS[2]);
  });

  it('avisa cuando no hay resultados', async () => {
    const user = userEvent.setup();
    render(<SelectorContacto contactos={CONTACTOS} seleccionadoId={null} onSeleccionar={() => {}} />);
    await user.type(screen.getByLabelText('Buscar contacto'), 'zzz');
    expect(screen.getByText(/sin resultados/i)).toBeInTheDocument();
  });
});

describe('DirectorioContactos (organismo)', () => {
  it('muestra las 3 secciones y permite escribir a un compañero', async () => {
    const user = userEvent.setup();
    const onEscribir = vi.fn();
    render(<DirectorioContactos contactos={CONTACTOS} onEscribir={onEscribir} />);

    expect(screen.getByRole('button', { name: /profesores/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /alumnos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /administración/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Buscar en mis contactos'), 'marcelo');
    await user.click(screen.getByRole('button', { name: /alumnos/i }));
    await user.click(await screen.findByRole('button', { name: 'Mensaje' }));
    expect(onEscribir).toHaveBeenCalledWith(CONTACTOS[3]);
  });
});
