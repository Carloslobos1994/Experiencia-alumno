import { useState } from 'react';
import { Container, Row, Col, Card, Badge, ListGroup, Button, Modal, Form } from 'react-bootstrap';
import { informacionAlumno, proximasEvaluaciones, estudiantesDisponibles, proyectosPortafolio } from '../data/datosAlumnos';
import fotoPerfilImg from '../assets/perfil.jpg';

function HomeView({ cambiarVista }) {
  // Estado para controlar el modal de mensajes en Home
  const [showModal, setShowModal] = useState(false);
  const [destinatario, setDestinatario] = useState(null);
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Abrir modal con datos del compañero seleccionado
  const handleAbrirModal = (companero) => {
    setDestinatario(companero);
    setAsunto('');
    setDescripcion('');
    setShowModal(true);
  };

  const handleCerrarModal = () => {
    setShowModal(false);
    setDestinatario(null);
  };

  const handleEnviarMensaje = (e) => {
    e.preventDefault();

    if (!asunto.trim() || !descripcion.trim()) {
      alert("Debes ingresar un asunto y una descripción para enviar el mensaje.");
      return;
    }

    alert(`Mensaje enviado con éxito a ${destinatario.nombre} (${destinatario.correo})`);
    handleCerrarModal();
  };

  return (
    <Container className="my-4">
      <h2 className="mb-4 text-primary fw-bold">Panel del Alumno</h2>
      
      {/* Tarjeta Ejecutiva Principal */}
      <Card className="card-ejecutiva p-4 mb-4 rounded-3">
        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
          <span className="fw-bold text-primary small text-uppercase">
            Carrera: {informacionAlumno.carrera}
          </span>
          <span className="fw-bold text-secondary small text-uppercase">
            Sede: {informacionAlumno.sede}
          </span>
        </div>

        <div className="text-center my-3">
          <img 
            src={fotoPerfilImg} 
            alt="Foto de Perfil" 
            className="rounded-circle shadow border border-3 border-primary mb-3"
            style={{ width: '95px', height: '95px', objectFit: 'cover' }} 
          />
          <h3 className="fw-bold text-dark mb-1">¡Bienvenido, {informacionAlumno.nombre}!</h3>
          <p className="text-muted small fw-semibold">Portal Académico Institucional</p>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-dark fs-6">Semestre: {informacionAlumno.semestreActual}°</span>
            <Badge bg="warning" text="dark" className="px-3 py-2 fw-bold shadow-sm">
              Cursando
            </Badge>
          </div>
          <span className="text-dark small fw-bold">
            Institución | {informacionAlumno.institucion}
          </span>
        </div>
      </Card>

      <Row className="g-4 mb-4">
        {/* Próximas Evaluaciones */}
        <Col md={7}>
          <Card className="shadow-sm border-0 p-3 h-100 rounded-3">
            <h5 className="text-primary fw-bold mb-3">Próximas Evaluaciones</h5>
            <ListGroup variant="flush">
              {proximasEvaluaciones.map((evalItem) => (
                <ListGroup.Item key={evalItem.id} className="px-0 py-3 border-bottom">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong className="text-dark d-block mb-1">{evalItem.ramo}</strong>
                      <p className="text-muted m-0 small">{evalItem.tipo} - {evalItem.fecha}</p>
                    </div>
                    <Badge bg="primary" className="px-3 py-2">
                      {evalItem.sala}
                    </Badge>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>

        {/* Compañeros de Grupo */}
        <Col md={5}>
          <Card className="shadow-sm border-0 p-3 h-100 rounded-3">
            <h5 className="text-primary fw-bold mb-3">Compañeros de Grupo</h5>
            <ListGroup variant="flush">
              {estudiantesDisponibles.map((comp) => (
                <ListGroup.Item key={comp.rut} className="px-0 py-3 d-flex justify-content-between align-items-center border-bottom">
                  <div>
                    <strong className="text-dark d-block">{comp.nombre}</strong>
                    <small className="text-muted fw-semibold">{comp.carrera}</small>
                  </div>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    className="fw-bold px-3"
                    onClick={() => handleAbrirModal(comp)}
                  >
                    Mensaje
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>

      {/* Mis Proyectos de Portafolio */}
      <Row className="mb-3">
        <Col>
          <h4 className="text-primary fw-bold">Mis Proyectos de Portafolio</h4>
        </Col>
      </Row>

      <Row className="g-4">
        {proyectosPortafolio.map((proj) => (
          <Col md={4} key={proj.id}>
            <Card className="shadow-sm border-0 h-100 d-flex flex-column rounded-3">
              <Card.Body className="d-flex flex-column p-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                  <Badge bg="dark" className="text-truncate" style={{ maxWidth: '100%' }}>
                    {proj.asignatura}
                  </Badge>
                  <Badge 
                    bg={proj.estado === 'Completado' ? 'success' : 'warning'} 
                    text={proj.estado === 'Completado' ? 'white' : 'dark'} 
                    className="px-2 py-1"
                  >
                    {proj.estado}
                  </Badge>
                </div>

                <h5 className="fw-bold text-dark mb-2">{proj.titulo}</h5>
                <p className="text-muted small flex-grow-1">{proj.descripcion}</p>
                
                <div className="d-flex flex-wrap gap-1 mt-auto pt-3">
                  {proj.tecnologias.map((tech, index) => (
                    <Badge bg="light" text="dark" key={index} className="border text-secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal para enviar mensaje al compañero */}
      <Modal show={showModal} onHide={handleCerrarModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold text-primary">
            Nuevo Mensaje para {destinatario?.nombre}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEnviarMensaje}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="formCorreoDestino">
              <Form.Label className="fw-semibold">Para (Correo institucional):</Form.Label>
              <Form.Control 
                type="email" 
                value={destinatario?.correo || ''} 
                disabled 
                readOnly
                className="bg-light"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formAsunto">
              <Form.Label className="fw-semibold">Asunto *</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Ej: Coordinación de entrega de proyecto"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formDescripcion">
              <Form.Label className="fw-semibold">Descripción / Mensaje *</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                placeholder="Escribe el contenido de tu mensaje..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCerrarModal}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={!asunto.trim() || !descripcion.trim()}
            >
              Enviar Mensaje
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default HomeView;