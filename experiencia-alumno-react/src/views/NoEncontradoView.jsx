// src/views/NoEncontradoView.jsx
import { Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function NoEncontradoView() {
  return (
    <Container className="my-5 text-center">
      <h1 className="display-4 fw-bold text-primary">404</h1>
      <h4 className="fw-bold">Página no encontrada</h4>
      <p className="text-muted">La dirección que buscas no existe.</p>
      <Button as={Link} to="/" variant="primary">
        Ir al inicio
      </Button>
    </Container>
  );
}

export default NoEncontradoView;
