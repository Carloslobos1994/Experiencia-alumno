// src/views/profesor/ProfesorEncuestasView.jsx
// El profesor ve los resultados ANONIMOS de la encuesta docente de sus cursos.
import { useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useDatos } from '../../hooks/useDatos';
import { encuestasService } from '../../api/servicios';
import { mensajeError } from '../../utils/errores';
import { formatearFecha } from '../../utils/formato';
import Cargando from '../../components/atoms/Cargando';
import AlertaMensaje from '../../components/atoms/AlertaMensaje';
import BadgeEstado from '../../components/atoms/BadgeEstado';
import EncabezadoPagina from '../../components/molecules/EncabezadoPagina';
import ResultadosEncuesta from '../../components/organisms/ResultadosEncuesta';

function ProfesorEncuestasView() {
  const { datos: encuestas, cargando, error } = useDatos(encuestasService.listar);
  const [resultado, setResultado] = useState(null);
  const [errorResultado, setErrorResultado] = useState(null);

  if (cargando) {
    return <Cargando />;
  }

  const verResultados = async (id) => {
    setErrorResultado(null);
    try {
      setResultado(await encuestasService.resultados(id));
    } catch (e) {
      setErrorResultado(mensajeError(e));
    }
  };

  return (
    <Container className="my-4">
      <EncabezadoPagina titulo="Encuesta Docente" subtitulo="Resultados anónimos de tus cursos (creadas por Administración)" />
      <AlertaMensaje mensaje={error} />
      <AlertaMensaje mensaje={errorResultado} />
      {encuestas?.length === 0 && <p className="text-muted">Aún no hay encuestas para tus cursos.</p>}

      <Row className="g-4">
        <Col lg={5}>
          {encuestas?.map((e) => (
            <Card key={e.id} className="shadow-sm border-0 rounded-3 mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <h6 className="fw-bold mb-1">{e.titulo}</h6>
                  <BadgeEstado estado={e.abierta ? 'ABIERTA' : 'CERRADA'} />
                </div>
                <small className="text-muted d-block mb-2">
                  {e.cursoCodigo} - {e.cursoNombre} · Cierre {formatearFecha(e.fechaCierre)} · {e.respuestas}/{e.inscritos} respuestas
                </small>
                <Button size="sm" variant="outline-primary" onClick={() => verResultados(e.id)}>
                  Ver resultados
                </Button>
              </Card.Body>
            </Card>
          ))}
        </Col>
        <Col lg={7}>
          <ResultadosEncuesta resultado={resultado} />
        </Col>
      </Row>
    </Container>
  );
}

export default ProfesorEncuestasView;
