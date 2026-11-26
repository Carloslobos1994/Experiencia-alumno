// src/routes/RutaProtegida.jsx
// Restriccion de acceso en el frontend (IE3.3.3):
// - Sin sesion        -> redirige a /login (recordando a donde queria ir).
// - Rol no permitido  -> redirige a /no-autorizado.
// - Permitido         -> muestra la vista (children o rutas hijas con <Outlet />).
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { tieneRol } from '../utils/permisos';
import Cargando from '../components/atoms/Cargando';

function RutaProtegida({ roles, children }) {
  const { usuario, verificando } = useAuth();
  const ubicacion = useLocation();

  if (verificando) {
    return <Cargando texto="Verificando sesión..." />;
  }
  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }
  if (!tieneRol(usuario, roles)) {
    return <Navigate to="/no-autorizado" replace />;
  }
  return children ?? <Outlet />;
}

export default RutaProtegida;
