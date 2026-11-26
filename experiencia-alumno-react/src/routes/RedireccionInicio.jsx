// src/routes/RedireccionInicio.jsx
// Ruta "/": envia a cada usuario a su pagina de inicio segun su rol.
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { rutaInicio } from '../utils/permisos';
import Cargando from '../components/atoms/Cargando';

function RedireccionInicio() {
  const { usuario, verificando } = useAuth();
  if (verificando) {
    return <Cargando texto="Verificando sesión..." />;
  }
  return <Navigate to={usuario ? rutaInicio(usuario.rol) : '/login'} replace />;
}

export default RedireccionInicio;
