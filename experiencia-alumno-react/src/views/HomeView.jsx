import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  ListGroup,
  Modal,
  Row,
} from "react-bootstrap";
import {
  estudiantesDisponibles,
  informacionAlumno,
  proximasEvaluaciones,
  proyectosPortafolio,
} from "../data/datosAlumnos";

function HomeView() {
  const [destinatario, setDestinatario] = useState(null);
  const [asunto, setAsunto] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const cerrarModal = () => setDestinatario(null);

  const enviarMensaje = (event) => {
    event.preventDefault();
    if (!asunto.trim() || !descripcion.trim()) return;

    window.alert(
      `Mensaje enviado con éxito a ${destinatario.nombre} (${destinatario.correo})`
    );
    cerrarModal();
  };

  return (
    <Container className="my-4">
      <h1 className="mb-4 text-primary">Panel del alumno</h1>

      <Card className="card-ejecutiva mb-4 rounded-3 p-4">
        <p className="mb-1 fw-semibold">
          {informacionAlumno.carrera} · {informacionAlumno.sede}
        </p>
        <h2 className="h4">¡Bienvenido, {informacionAlumno.nombre}!</h2>
        <p className="mb-0">
          Semestre {informacionAlumno.semestreActual} ·{" "}
          {informacionAlumno.institucion}
        </p>
      </Card>

      <Row className="g-4 mb-4">
        <Col lg={7}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <h2 className="h5 text-primary">Próximas evaluaciones</h2>
              <ListGroup variant="flush">
                {proximasEvaluaciones.map((evaluacion) => (
                  <ListGroup.Item className="px-0" key={evaluacion.id}>
                    <strong>{evaluacion.ramo}</strong>
                    <div className="text-muted">
                      {evaluacion.tipo} · {evaluacion.fecha} · {evaluacion.sala}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <h2 className="h5 text-primary">Compañeros de grupo</h2>
              <ListGroup variant="flush">
                {estudiantesDisponibles.map((estudiante) => (
                  <ListGroup.Item
                    className="d-flex align-items-center justify-content-between gap-2 px-0"
                    key={estudiante.rut}
                  >
                    <span>
                      <strong className="d-block">{estudiante.nombre}</strong>
                      <small className="text-muted">{estudiante.correo}</small>
                    </span>
                    <Button
                      onClick={() => {
                        setAsunto("");
                        setDescripcion("");
                        setDestinatario(estudiante);
                      }}
                      size="sm"
                      variant="outline-primary"
                    >
                      Mensaje
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h2 className="h4 mb-3 text-primary">Proyectos de portafolio</h2>
      <Row className="g-3">
        {proyectosPortafolio.map((proyecto) => (
          <Col key={proyecto.id} md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <Badge bg="secondary" className="mb-2">
                  {proyecto.estado}
                </Badge>
                <Card.Title>{proyecto.titulo}</Card.Title>
                <Card.Text>{proyecto.descripcion}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal centered onHide={cerrarModal} show={Boolean(destinatario)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Nuevo mensaje para {destinatario?.nombre}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={enviarMensaje}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="correoDestino">
              <Form.Label>Para (correo institucional):</Form.Label>
              <Form.Control
                readOnly
                disabled
                type="email"
                value={destinatario?.correo || ""}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="asunto">
              <Form.Label>Asunto *</Form.Label>
              <Form.Control
                onChange={(event) => setAsunto(event.target.value)}
                required
                value={asunto}
              />
            </Form.Group>
            <Form.Group controlId="descripcion">
              <Form.Label>Descripción / mensaje *</Form.Label>
              <Form.Control
                as="textarea"
                onChange={(event) => setDescripcion(event.target.value)}
                required
                rows={4}
                value={descripcion}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={cerrarModal} variant="secondary">
              Cancelar
            </Button>
            <Button
              disabled={!asunto.trim() || !descripcion.trim()}
              type="submit"
            >
              Enviar mensaje
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default HomeView;
