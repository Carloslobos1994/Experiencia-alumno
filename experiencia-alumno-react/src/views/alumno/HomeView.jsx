// src/views/alumno/HomeView.jsx
// Panel del alumno: perfil, proximas evaluaciones en cartas (creadas por sus profesores),
// directorio de contactos para mensajeria y portafolio de proyectos. Los datos vienen de la API.
// Privacidad: la deuda de mensualidades NO se muestra aqui; solo en la seccion "Mensualidades".
import { useState } from 'react';
import { Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDatos } from '../../hooks/useDatos';
import { academicoService, encuestasService, mensajesService } from '../../api/servicios';
import { proyectosPortafolio } from '../../data/datosAlumnos';
import Avatar from '../../components/atoms/Avatar';
import Cargando from '../../components/atoms/Cargando';
import AlertaMensaje from '../../components/atoms/AlertaMensaje';
import TarjetaDato from '../../components/molecules/TarjetaDato';
import TarjetaEvaluacion from '../../components/molecules/TarjetaEvaluacion';
import TarjetaProyecto from '../../components/molecules/TarjetaProyecto';
import ModalMensaje from '../../components/organisms/ModalMensaje';
import DirectorioContactos from '../../components/organisms/DirectorioContactos';

// Carga en paralelo todo lo que necesita el panel
const cargarPanel = () =>
  Promise.all([
    academicoService.proximasEvaluaciones(),
    academicoService.cursos(),
    encuestasService.pendientes(),
    mensajesService.contactos(),
    mensajesService.noLeidos(),
  ]).then(([evaluaciones, cursos, encuestas, contactos, mensajes]) => ({
    evaluaciones,
    cursos,
    encuestas,
    contactos,
    noLeidos: mensajes.noLeidos,
  }));

function HomeView() {
  const { usuario } = useAuth();
  const { datos, cargando, error } = useDatos(cargarPanel);
  const [destinatario, setDestinatario] = useState(null);
  const [aviso, setAviso] = useState(null);

  if (cargando) {
    return <Cargando />;
  }

  return (
    <Container className="my-4">
      <h2 className="mb-4 text-primary fw-bold">Panel del Alumno</h2>
      <AlertaMensaje mensaje={error} />
      <AlertaMensaje mensaje={aviso} variante="success" onCerrar={() => setAviso(null)} />

      {/* Tarjeta ejecutiva con los datos del alumno autenticado */}
      <Card className="card-ejecutiva p-4 mb-4 rounded-3">
        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
          <span className="fw-bold text-primary small text-uppercase">Carrera: {usuario.carrera}</span>
          <span className="fw-bold text-secondary small text-uppercase">Sede: {usuario.sede}</span>
        </div>
        <div className="text-center my-3">
          <Avatar nombre={usuario.nombre} fotoUrl={usuario.fotoUrl} tamano={120} />
          <h3 className="fw-bold text-dark mb-1 mt-3">¡Bienvenido, {usuario.nombre}!</h3>
          <p className="text-muted small fw-semibold">Portal Académico Institucional · RUT {usuario.rut}</p>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
          <Badge bg="warning" text="dark" className="px-3 py-2 fw-bold shadow-sm">
            Alumno Regular
          </Badge>
          <span className="text-dark small fw-bold">Institución | Duoc UC</span>
        </div>
      </Card>

      {datos && (
        <>
          <Row className="g-4 mb-4">
            <Col md={4}>
              <TarjetaDato titulo="Próximas evaluaciones" valor={datos.evaluaciones.length} variante="primary"
                detalle="Creadas por tus profesores" />
            </Col>
            <Col md={4}>
              <TarjetaDato titulo="Mensajes sin leer" valor={datos.noLeidos}
                variante={datos.noLeidos ? 'info' : 'success'} detalle={`${datos.cursos.length} cursos inscritos este semestre`} />
            </Col>
            <Col md={4}>
              <TarjetaDato titulo="Encuestas docentes" valor={datos.encuestas.length}
                variante={datos.encuestas.length ? 'danger' : 'success'} detalle="Pendientes de responder" />
            </Col>
          </Row>

          {/* Proximas evaluaciones en formato de cartas */}
          <Card className="shadow-sm border-0 p-3 p-md-4 mb-4 rounded-3">
            <h4 className="text-primary fw-bold mb-3">Próximas Evaluaciones</h4>
            {datos.evaluaciones.length === 0 ? (
              <p className="text-muted m-0">No tienes evaluaciones próximas.</p>
            ) : (
              <Row className="g-3">
                {datos.evaluaciones.map((ev) => (
                  <Col key={ev.id} xs={12} sm={6} xl={3}>
                    <TarjetaEvaluacion evaluacion={ev} />
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </>
      )}

      <Row className="g-4">
        {datos && (
          <Col lg={4}>
            <DirectorioContactos contactos={datos.contactos} onEscribir={setDestinatario} />
            {datos.encuestas.length > 0 && (
              <Button as={Link} to="/alumno/encuestas" variant="danger" className="mt-3 fw-bold w-100">
                Responder encuesta docente ({datos.encuestas.length})
              </Button>
            )}
          </Col>
        )}

        {/* Portafolio de proyectos realizados: cada tarjeta abre su detalle */}
        <Col lg={datos ? 8 : 12}>
          <h4 className="text-primary fw-bold mb-3">Mis Proyectos de Portafolio</h4>
          <Row className="g-3">
            {proyectosPortafolio.map((proyecto) => (
              <Col md={4} key={proyecto.id}>
                <TarjetaProyecto proyecto={proyecto} />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {destinatario && (
        <ModalMensaje
          destinatario={destinatario}
          onCerrar={() => setDestinatario(null)}
          onEnviado={() => setAviso(`Mensaje enviado a ${destinatario.nombre}`)}
        />
      )}
    </Container>
  );
}

export default HomeView;
