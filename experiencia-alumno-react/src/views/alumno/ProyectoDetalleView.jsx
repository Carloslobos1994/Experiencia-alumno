// src/views/alumno/ProyectoDetalleView.jsx
// Detalle de un proyecto del portafolio (/alumno/proyectos/:id).
// Se llega desde el Inicio o desde la seccion Proyectos.
import { Badge, Button, Card, Col, Container, ListGroup, Row } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { buscarProyecto } from '../../data/datosAlumnos';

function ProyectoDetalleView() {
  const { id } = useParams();
  const proyecto = buscarProyecto(id);

  if (!proyecto) {
    return (
      <Container className="my-5 text-center">
        <h4 className="fw-bold">Proyecto no encontrado</h4>
        <Button as={Link} to="/alumno/proyectos" variant="primary" className="mt-2">Volver a Proyectos</Button>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Button as={Link} to="/alumno/proyectos" variant="link" className="px-0 mb-2">← Volver a Proyectos</Button>

      <Card className="card-ejecutiva p-4 rounded-3 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
          <Badge bg="dark">{proyecto.asignatura}</Badge>
          <Badge bg="success" className="px-3 py-2">{proyecto.estado}</Badge>
        </div>
        <h2 className="text-primary fw-bold mb-1">{proyecto.titulo}</h2>
        <p className="text-muted fw-semibold mb-0">{proyecto.descripcion}</p>
      </Card>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm border-0 p-4 rounded-3 h-100">
            <h5 className="fw-bold text-primary">Descripción del proyecto</h5>
            <p className="text-secondary">{proyecto.detalle}</p>
            <h5 className="fw-bold text-primary mt-2">Funcionalidades</h5>
            <ListGroup variant="flush">
              {proyecto.funcionalidades.map((f) => (
                <ListGroup.Item key={f} className="px-0">✔ {f}</ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm border-0 p-4 rounded-3 h-100">
            <h5 className="fw-bold text-primary">Ficha</h5>
            <ul className="list-unstyled small">
              <li className="mb-2"><strong>Asignatura:</strong><br />{proyecto.asignatura}</li>
              <li className="mb-2"><strong>Profesor evaluador:</strong><br />{proyecto.profesorEvaluador}</li>
              <li className="mb-2"><strong>Estado:</strong><br />{proyecto.estado}</li>
            </ul>
            <h6 className="fw-bold mt-2">Tecnologías</h6>
            <div className="d-flex flex-wrap gap-1">
              {proyecto.tecnologias.map((tech) => (
                <Badge bg="light" text="dark" key={tech} className="border text-secondary">{tech}</Badge>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ProyectoDetalleView;
