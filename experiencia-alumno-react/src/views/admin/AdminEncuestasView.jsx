// src/views/admin/AdminEncuestasView.jsx
// ADMIN crea la encuesta docente de un curso, la cierra y revisa sus resultados.
import { useState } from 'react';
import { Button, Card, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { useDatos } from '../../hooks/useDatos';
import { academicoService, encuestasService } from '../../api/servicios';
import { mensajeError } from '../../utils/errores';
import { formatearFecha } from '../../utils/formato';
import Cargando from '../../components/atoms/Cargando';
import AlertaMensaje from '../../components/atoms/AlertaMensaje';
import BadgeEstado from '../../components/atoms/BadgeEstado';
import EncabezadoPagina from '../../components/molecules/EncabezadoPagina';
import ResultadosEncuesta from '../../components/organisms/ResultadosEncuesta';

const cargarDatos = () =>
  Promise.all([encuestasService.listar(), academicoService.cursos()]).then(([encuestas, cursos]) => ({ encuestas, cursos }));

function AdminEncuestasView() {
  const { datos, cargando, error, recargar } = useDatos(cargarDatos);
  const [nueva, setNueva] = useState({ cursoId: '', titulo: 'Encuesta Docente 2026-2', fechaCierre: '' });
  const [resultado, setResultado] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [errorAccion, setErrorAccion] = useState(null);

  if (cargando) {
    return <Cargando />;
  }

  const ejecutar = async (accion, textoExito) => {
    setErrorAccion(null);
    try {
      await accion();
      if (textoExito) {
        setMensaje(textoExito);
      }
      recargar();
    } catch (e) {
      setErrorAccion(mensajeError(e));
    }
  };

  const crear = (evento) => {
    evento.preventDefault();
    ejecutar(
      () => encuestasService.crear({ ...nueva, cursoId: Number(nueva.cursoId) }),
      'Encuesta creada: los alumnos del curso ya pueden responderla.',
    );
  };

  const verResultados = async (id) => {
    setErrorAccion(null);
    try {
      setResultado(await encuestasService.resultados(id));
    } catch (e) {
      setErrorAccion(mensajeError(e));
    }
  };

  return (
    <Container className="my-4">
      <EncabezadoPagina titulo="Encuesta Docente" subtitulo="Administración crea la encuesta · el alumno responde · el profesor ve resultados anónimos" />
      <AlertaMensaje mensaje={error} />
      <AlertaMensaje mensaje={errorAccion} onCerrar={() => setErrorAccion(null)} />
      <AlertaMensaje mensaje={mensaje} variante="success" onCerrar={() => setMensaje(null)} />

      <Card className="shadow-sm border-0 p-3 rounded-3 mb-4">
        <h5 className="fw-bold text-primary">Nueva encuesta</h5>
        <Form onSubmit={crear}>
          <Row className="g-2 align-items-end">
            <Col md={4}>
              <Form.Group controlId="enCurso">
                <Form.Label className="fw-semibold">Curso *</Form.Label>
                <Form.Select value={nueva.cursoId} onChange={(e) => setNueva({ ...nueva, cursoId: e.target.value })} required>
                  <option value="">Seleccione...</option>
                  {datos?.cursos.map((c) => (
                    <option key={c.id} value={c.id}>{c.codigo} - {c.nombre} ({c.profesorNombre})</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="enTitulo">
                <Form.Label className="fw-semibold">Título *</Form.Label>
                <Form.Control value={nueva.titulo} onChange={(e) => setNueva({ ...nueva, titulo: e.target.value })} required />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId="enCierre">
                <Form.Label className="fw-semibold">Cierre *</Form.Label>
                <Form.Control type="date" value={nueva.fechaCierre} onChange={(e) => setNueva({ ...nueva, fechaCierre: e.target.value })} required />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button type="submit" className="w-100 fw-bold">Crear</Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Row className="g-4">
        <Col lg={7}>
          <Card className="shadow-sm border-0 p-3 rounded-3">
            <Table responsive hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Curso</th>
                  <th>Cierre</th>
                  <th>Respuestas</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {datos?.encuestas.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <strong>{e.cursoCodigo}</strong> {e.cursoNombre}
                      <br /><small className="text-muted">{e.profesorNombre}</small>
                    </td>
                    <td>{formatearFecha(e.fechaCierre)}</td>
                    <td>{e.respuestas}/{e.inscritos}</td>
                    <td><BadgeEstado estado={e.abierta ? 'ABIERTA' : 'CERRADA'} /></td>
                    <td className="text-end text-nowrap">
                      <Button size="sm" variant="outline-primary" className="me-1" onClick={() => verResultados(e.id)}>Resultados</Button>
                      {e.activa && (
                        <Button size="sm" variant="warning" className="me-1"
                          onClick={() => ejecutar(() => encuestasService.cerrar(e.id), 'Encuesta cerrada')}>Cerrar</Button>
                      )}
                      <Button size="sm" variant="danger"
                        onClick={() => window.confirm('¿Eliminar la encuesta y sus respuestas?')
                          && ejecutar(() => encuestasService.eliminar(e.id), 'Encuesta eliminada')}>
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>
        <Col lg={5}>
          <ResultadosEncuesta resultado={resultado} />
        </Col>
      </Row>
    </Container>
  );
}

export default AdminEncuestasView;
