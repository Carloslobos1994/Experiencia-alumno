// src/views/alumno/EncuestasView.jsx
// Encuesta docente: el alumno responde las encuestas abiertas de sus cursos (una vez cada una).
import { useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useDatos } from '../../hooks/useDatos';
import { encuestasService } from '../../api/servicios';
import { mensajeError } from '../../utils/errores';
import { formatearFecha } from '../../utils/formato';
import Cargando from '../../components/atoms/Cargando';
import AlertaMensaje from '../../components/atoms/AlertaMensaje';
import EncabezadoPagina from '../../components/molecules/EncabezadoPagina';
import FormularioEncuesta from '../../components/organisms/FormularioEncuesta';

function EncuestasView() {
  const { datos: encuestas, cargando, error, recargar } = useDatos(encuestasService.pendientes);
  const [enviando, setEnviando] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [errorEnvio, setErrorEnvio] = useState(null);

  if (cargando) {
    return <Cargando />;
  }

  const responder = async (encuesta, respuesta) => {
    setEnviando(encuesta.id);
    setErrorEnvio(null);
    try {
      await encuestasService.responder(encuesta.id, respuesta);
      setAviso(`¡Gracias! Tu respuesta para ${encuesta.cursoNombre} fue registrada.`);
      recargar();
    } catch (e) {
      setErrorEnvio(mensajeError(e));
    } finally {
      setEnviando(null);
    }
  };

  return (
    <Container className="my-4">
      <EncabezadoPagina titulo="Encuesta Docente"
        subtitulo="Tu opinión ayuda a mejorar las clases. Los profesores solo ven promedios, nunca tu nombre." />
      <AlertaMensaje mensaje={error} />
      <AlertaMensaje mensaje={errorEnvio} onCerrar={() => setErrorEnvio(null)} />
      <AlertaMensaje mensaje={aviso} variante="success" onCerrar={() => setAviso(null)} />

      {encuestas?.length === 0 && (
        <p className="text-muted">No tienes encuestas pendientes. ¡Gracias por participar!</p>
      )}

      <Row className="g-4">
        {encuestas?.map((encuesta) => (
          <Col lg={6} key={encuesta.id}>
            <FormularioEncuesta encuesta={encuesta} enviando={enviando === encuesta.id}
              onEnviar={(respuesta) => responder(encuesta, respuesta)} />
            <small className="text-muted">Disponible hasta el {formatearFecha(encuesta.fechaCierre)}</small>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default EncuestasView;
