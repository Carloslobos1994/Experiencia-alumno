import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ProyectosView from './ProyectosView';
import ProyectoDetalleView from './ProyectoDetalleView';

function renderizar(ruta) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="/alumno/proyectos" element={<ProyectosView />} />
        <Route path="/alumno/proyectos/:id" element={<ProyectoDetalleView />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Portafolio de proyectos', () => {
  it('todos los proyectos aparecen como Completados', () => {
    renderizar('/alumno/proyectos');
    expect(screen.getAllByText('Completado')).toHaveLength(3);
  });

  it('al hacer clic en un proyecto se abre su detalle con el profesor evaluador', async () => {
    const user = userEvent.setup();
    renderizar('/alumno/proyectos');

    await user.click(screen.getByRole('link', { name: /ver detalle de gestor de base de datos académica/i }));

    expect(screen.getByRole('heading', { name: 'Gestor de Base de Datos Académica' })).toBeInTheDocument();
    expect(screen.getByText('Cristian Eduardo Espinoza Silva')).toBeInTheDocument();
    expect(screen.getByText(/procedimientos almacenados para cargas masivas/i)).toBeInTheDocument();
  });

  it('muestra un aviso si el proyecto no existe', () => {
    renderizar('/alumno/proyectos/no-existe');
    expect(screen.getByText('Proyecto no encontrado')).toBeInTheDocument();
  });
});
