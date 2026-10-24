// src/views/ProyectosView.jsx
import { Container, Row, Col, Card } from 'react-bootstrap';
import { proyectosIniciales } from '../data/datosAlumnos';

function ProyectosView() {
  return (
    <Container className="my-4">
      <h2 className="mb-4 text-primary">Portafolio de Proyectos Académicos</h2>
      <Row className="g-4">
        {proyectosIniciales.map((proyecto) => (
          <Col key={proyecto.id} xs={12} md={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Img variant="top" src={proyecto.imagen} style={{ height: '160px', objectFit: 'cover' }} />
              <Card.Body className="d-flex flex-column">
                <Card.Title className="fw-bold">{proyecto.nombre}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted small">{proyecto.asignatura}</Card.Subtitle>
                <Card.Text className="small text-secondary flex-grow-1">
                  {proyecto.descripcion}
                </Card.Text>
                <span className={`badge bg-${proyecto.estado === 'Completado' ? 'success' : 'warning text-dark'} align-self-start`}>
                  {proyecto.estado}
                </span>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default ProyectosView;