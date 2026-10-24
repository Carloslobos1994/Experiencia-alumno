import { Container } from 'react-bootstrap';

function Footer() {
  const anioActual = new Date().getFullYear();

  return (
    <footer className="bg-light py-4 mt-auto border-top">
      <Container className="text-center text-muted small">
        <p className="fw-semibold mb-1">
          © {anioActual} Duoc UC. Todos los derechos reservados.
        </p>
        <p className="m-0 text-secondary">
          Plataforma Institucional de Experiencia Alumno — Escuela de Informatica y Telecomunicaciones 
        </p>
      </Container>
    </footer>
  );
}

export default Footer;