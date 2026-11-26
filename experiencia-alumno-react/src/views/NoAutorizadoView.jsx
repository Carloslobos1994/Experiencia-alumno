// src/views/NoAutorizadoView.jsx
// Se muestra cuando un usuario intenta entrar a una ruta que su rol no permite.
import { Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { rutaInicio } from '../utils/permisos';

function NoAutorizadoView() {
  const { usuario } = useAuth();
  return (
    <Container className="my-5 text-center">
      <h1 className="display-4 fw-bold text-danger">403</h1>
      <h4 className="fw-bold">Acceso no autorizado</h4>
      <p className="text-muted">Tu perfil no tiene permisos para ver esta sección.</p>
      <Button as={Link} to={rutaInicio(usuario?.rol)} variant="primary">
        Volver a mi inicio
      </Button>
    </Container>
  );
}

export default NoAutorizadoView;
