// MOLECULA: tarjeta de un proyecto del portafolio. Al hacer clic abre su detalle.
import { Badge, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function TarjetaProyecto({ proyecto }) {
  return (
    <Card as={Link} to={`/alumno/proyectos/${proyecto.id}`}
      className="shadow-sm border-0 h-100 rounded-3 text-decoration-none tarjeta-proyecto"
      aria-label={`Ver detalle de ${proyecto.titulo}`}>
      <Card.Body className="d-flex flex-column p-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <Badge bg="dark" className="text-truncate" style={{ maxWidth: '100%' }}>{proyecto.asignatura}</Badge>
          <Badge bg="success">{proyecto.estado}</Badge>
        </div>
        <h5 className="fw-bold text-dark mb-2">{proyecto.titulo}</h5>
        <p className="text-muted small flex-grow-1">{proyecto.descripcion}</p>
        <div className="d-flex flex-wrap gap-1 mt-auto pt-3">
          {proyecto.tecnologias.map((tech) => (
            <Badge bg="light" text="dark" key={tech} className="border text-secondary">{tech}</Badge>
          ))}
        </div>
        <small className="text-primary fw-semibold mt-3">Ver detalle →</small>
      </Card.Body>
    </Card>
  );
}

export default TarjetaProyecto;
