import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthContext } from '../context/AuthContext';
import RutaProtegida from './RutaProtegida';
import RedireccionInicio from './RedireccionInicio';

// Monta la app de prueba con un usuario simulado en el contexto de autenticacion
function renderizar({ usuario = null, verificando = false, ruta = '/admin', roles = ['ADMIN'] }) {
  const valor = { usuario, verificando, autenticado: Boolean(usuario), login: () => {}, logout: () => {} };
  return render(
    <AuthContext.Provider value={valor}>
      <MemoryRouter initialEntries={[ruta]}>
        <Routes>
          <Route path="/" element={<RedireccionInicio />} />
          <Route path="/login" element={<p>Pantalla de login</p>} />
          <Route path="/no-autorizado" element={<p>Acceso no autorizado</p>} />
          <Route path="/alumno" element={<p>Inicio alumno</p>} />
          <Route element={<RutaProtegida roles={roles} />}>
            <Route path="/admin" element={<p>Panel de administración</p>} />
          </Route>
          <Route path="/privada" element={<RutaProtegida><p>Contenido privado</p></RutaProtegida>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('routes/RutaProtegida - restricciones de acceso por rol', () => {
  it('sin sesión redirige al login', () => {
    renderizar({ usuario: null });
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
  });

  it('un ALUMNO que entra a /admin es enviado a "no autorizado"', () => {
    renderizar({ usuario: { rol: 'ALUMNO' } });
    expect(screen.getByText('Acceso no autorizado')).toBeInTheDocument();
    expect(screen.queryByText('Panel de administración')).not.toBeInTheDocument();
  });

  it('un ADMIN puede ver /admin', () => {
    renderizar({ usuario: { rol: 'ADMIN' } });
    expect(screen.getByText('Panel de administración')).toBeInTheDocument();
  });

  it('muestra "Verificando sesión" mientras se confirma el token al recargar', () => {
    renderizar({ usuario: { rol: 'ADMIN' }, verificando: true });
    expect(screen.getByText(/verificando sesión/i)).toBeInTheDocument();
  });

  it('sin roles definidos basta con estar autenticado (children)', () => {
    renderizar({ usuario: { rol: 'PROFESOR' }, ruta: '/privada' });
    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });
});

describe('routes/RedireccionInicio', () => {
  it('envía al alumno a su inicio', () => {
    renderizar({ usuario: { rol: 'ALUMNO' }, ruta: '/' });
    expect(screen.getByText('Inicio alumno')).toBeInTheDocument();
  });

  it('sin sesión envía al login', () => {
    renderizar({ usuario: null, ruta: '/' });
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
  });

  it('espera mientras se verifica la sesión', () => {
    renderizar({ usuario: null, verificando: true, ruta: '/' });
    expect(screen.getByText(/verificando sesión/i)).toBeInTheDocument();
  });
});
