// src/views/MensajesView.jsx
// Mensajeria interna (todos los roles): bandeja de entrada, enviados, leer, responder y redactar.
import { useState } from 'react';
import { Badge, Button, Card, Col, Container, ListGroup, Row, Tab, Tabs } from 'react-bootstrap';
import { useDatos } from '../hooks/useDatos';
import { mensajesService } from '../api/servicios';
import { formatearFechaHora } from '../utils/formato';
import Cargando from '../components/atoms/Cargando';
import AlertaMensaje from '../components/atoms/AlertaMensaje';
import BadgeRol from '../components/atoms/BadgeRol';
import EncabezadoPagina from '../components/molecules/EncabezadoPagina';
import ModalMensaje from '../components/organisms/ModalMensaje';

const cargarMensajes = () =>
  Promise.all([mensajesService.recibidos(), mensajesService.enviados(), mensajesService.contactos()]).then(
    ([recibidos, enviados, contactos]) => ({ recibidos, enviados, contactos }),
  );

function ListaMensajes({ mensajes, seleccionado, onSeleccionar, tipo }) {
  if (mensajes.length === 0) {
    return <p className="text-muted p-3 m-0">No hay mensajes.</p>;
  }
  return (
    <ListGroup variant="flush">
      {mensajes.map((m) => (
        <ListGroup.Item key={m.id} action active={seleccionado?.id === m.id} onClick={() => onSeleccionar(m, tipo)}
          className={tipo === 'recibido' && !m.leido ? 'fw-bold' : ''}>
          <div className="d-flex justify-content-between">
            <span>{tipo === 'recibido' ? m.remitenteNombre : `Para: ${m.destinatarioNombre}`}</span>
            <small>{formatearFechaHora(m.fechaEnvio)}</small>
          </div>
          <div className="small text-truncate">
            {tipo === 'recibido' && !m.leido && <Badge bg="primary" className="me-1">Nuevo</Badge>}
            {m.asunto}
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}

function MensajesView() {
  const { datos, cargando, error, recargar } = useDatos(cargarMensajes);
  const [seleccionado, setSeleccionado] = useState(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [modal, setModal] = useState(null);
  const [aviso, setAviso] = useState(null);

  if (cargando) {
    return <Cargando />;
  }

  const abrir = async (mensaje, tipo) => {
    setSeleccionado(mensaje);
    setTipoSeleccionado(tipo);
    if (tipo === 'recibido' && !mensaje.leido) {
      try {
        const actualizado = await mensajesService.marcarLeido(mensaje.id);
        setSeleccionado(actualizado);
        recargar();
      } catch {
        // si falla, el mensaje igual se muestra
      }
    }
  };

  const responder = () => {
    setModal({
      destinatario: { id: seleccionado.remitenteId, nombre: seleccionado.remitenteNombre, rol: seleccionado.remitenteRol },
      asuntoInicial: seleccionado.asunto.startsWith('RE:') ? seleccionado.asunto : `RE: ${seleccionado.asunto}`,
      respuestaAId: seleccionado.id,
    });
  };

  return (
    <Container className="my-4">
      <EncabezadoPagina titulo="Mensajes" subtitulo="Comunicación interna entre alumnos, profesores y Administración">
        <Button variant="primary" className="fw-bold" onClick={() => setModal({})}>
          Nuevo mensaje
        </Button>
      </EncabezadoPagina>
      <AlertaMensaje mensaje={error} />
      <AlertaMensaje mensaje={aviso} variante="success" onCerrar={() => setAviso(null)} />

      {datos && (
        <Row className="g-4">
          <Col md={5}>
            <Card className="shadow-sm border-0 rounded-3">
              <Tabs defaultActiveKey="recibidos" className="px-2 pt-2" fill>
                <Tab eventKey="recibidos" title={`Recibidos (${datos.recibidos.length})`}>
                  <ListaMensajes mensajes={datos.recibidos} seleccionado={seleccionado} onSeleccionar={abrir} tipo="recibido" />
                </Tab>
                <Tab eventKey="enviados" title={`Enviados (${datos.enviados.length})`}>
                  <ListaMensajes mensajes={datos.enviados} seleccionado={seleccionado} onSeleccionar={abrir} tipo="enviado" />
                </Tab>
              </Tabs>
            </Card>
          </Col>
          <Col md={7}>
            <Card className="shadow-sm border-0 rounded-3 h-100">
              <Card.Body>
                {!seleccionado ? (
                  <p className="text-muted m-0">Selecciona un mensaje para leerlo.</p>
                ) : (
                  <>
                    <h5 className="fw-bold text-primary">{seleccionado.asunto}</h5>
                    <p className="small text-muted mb-3">
                      De: <strong>{seleccionado.remitenteNombre}</strong> <BadgeRol rol={seleccionado.remitenteRol} /> ·
                      Para: <strong>{seleccionado.destinatarioNombre}</strong> · {formatearFechaHora(seleccionado.fechaEnvio)}
                    </p>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{seleccionado.cuerpo}</p>
                    {tipoSeleccionado === 'recibido' && (
                      <Button variant="outline-primary" className="fw-bold" onClick={responder}>
                        Responder
                      </Button>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {modal && (
        <ModalMensaje
          contactos={datos?.contactos ?? []}
          destinatario={modal.destinatario}
          asuntoInicial={modal.asuntoInicial}
          respuestaAId={modal.respuestaAId}
          onCerrar={() => setModal(null)}
          onEnviado={() => {
            setAviso('Mensaje enviado correctamente');
            recargar();
          }}
        />
      )}
    </Container>
  );
}

export default MensajesView;
