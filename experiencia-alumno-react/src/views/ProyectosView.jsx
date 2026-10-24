import { useState } from "react";
import { Badge, Button, Card, Col, Container, Row } from "react-bootstrap";
import {
  agregarProyecto,
  eliminarProyecto,
  proyectosIniciales,
} from "../data/datosAlumnos";

function ProyectosView() {
  const [proyectos, setProyectos] = useState(proyectosIniciales);

  const agregarProyectoDemo = () => {
    setProyectos((actuales) =>
      agregarProyecto(actuales, {
        titulo: "Nuevo proyecto",
        asignatura: "Proyecto personal",
        tecnologias: ["React"],
        descripcion: "Proyecto agregado al portafolio del alumno.",
        estado: "En Progreso",
      })
    );
  };

  return (
    <Container className="my-4">
      <div className="mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
        <h1 className="mb-0 text-primary">Mis proyectos</h1>
        <Button onClick={agregarProyectoDemo}>Agregar proyecto</Button>
      </div>
      <Row className="g-3">
        {proyectos.map((proyecto) => (
          <Col key={proyecto.id} md={6} lg={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <Badge bg="secondary" className="align-self-start mb-2">
                  {proyecto.estado}
                </Badge>
                <Card.Title>{proyecto.titulo}</Card.Title>
                <Card.Subtitle className="mb-3 text-muted">
                  {proyecto.asignatura}
                </Card.Subtitle>
                <Card.Text>{proyecto.descripcion}</Card.Text>
                <div className="mb-3 d-flex flex-wrap gap-2">
                  {proyecto.tecnologias.map((tecnologia) => (
                    <Badge bg="light" className="border text-dark" key={tecnologia}>
                      {tecnologia}
                    </Badge>
                  ))}
                </div>
                <Button
                  className="mt-auto align-self-start"
                  onClick={() =>
                    setProyectos((actuales) =>
                      eliminarProyecto(actuales, proyecto.id)
                    )
                  }
                  size="sm"
                  variant="outline-danger"
                >
                  Quitar del portafolio
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default ProyectosView;
