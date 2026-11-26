// src/views/profesor/ProfesorCursosView.jsx
// El profesor gestiona SUS cursos: crea/edita/elimina evaluaciones y registra notas.
// El backend valida que el curso sea suyo, que los % no superen 100 y que la nota este entre 1.0 y 7.0.
import { useState } from 'react';
import { Badge, Button, Card, Col, Container, Form, Modal, Row, Table } from 'react-bootstrap';
import { useDatos } from '../../hooks/useDatos';
import { academicoService } from '../../api/servicios';
import { mensajeError } from '../../utils/errores';
import { formatearFecha } from '../../utils/formato';
import { validarNota } from '../../utils/validaciones';
import Cargando from '../../components/atoms/Cargando';
import AlertaMensaje from '../../components/atoms/AlertaMensaje';
import EncabezadoPagina from '../../components/molecules/EncabezadoPagina';

const EVALUACION_VACIA = { titulo: '', tipo: 'Prueba escrita', fecha: '', sala: '', porcentaje: '', descripcion: '' };

/** Planilla de notas de una evaluacion: un campo por alumno inscrito. */
function PlanillaNotas({ curso, evaluacion, onCerrar }) {
  const cargar = () =>
    Promise.all([academicoService.alumnosCurso(curso.id), academicoService.notasEvaluacion(evaluacion.id)]);
  const { datos, cargando, error } = useDatos(cargar, [evaluacion.id]);
  const [valores, setValores] = useState({});
  const [estado, setEstado] = useState({});

  if (cargando) {
    return <Cargando />;
  }
  const [alumnos, notas] = datos ?? [[], []];
  const notaGuardada = (alumnoId) => notas.find((n) => n.alumnoId === alumnoId)?.valor ?? '';

  const guardar = async (alumno) => {
    const valor = valores[alumno.id] ?? notaGuardada(alumno.id);
    if (!validarNota(valor)) {
      setEstado((e) => ({ ...e, [alumno.id]: { error: 'Nota entre 1.0 y 7.0' } }));
      return;
    }
    try {
      await academicoService.registrarNota({ evaluacionId: evaluacion.id, alumnoId: alumno.id, valor: Number(valor) });
      setEstado((e) => ({ ...e, [alumno.id]: { ok: true } }));
    } catch (err) {
      setEstado((e) => ({ ...e, [alumno.id]: { error: mensajeError(err) } }));
    }
  };

  return (
    <Card className="shadow-sm border-0 rounded-3 mt-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-primary m-0">Notas: {evaluacion.titulo} ({evaluacion.porcentaje}%)</h5>
          <Button variant="outline-secondary" size="sm" onClick={onCerrar}>Cerrar</Button>
        </div>
        <AlertaMensaje mensaje={error} />
        <Table responsive className="align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Alumno</th>
              <th style={{ width: '140px' }}>Nota</th>
              <th style={{ width: '220px' }}></th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map((alumno) => (
              <tr key={alumno.id}>
                <td>{alumno.nombre}</td>
                <td>
                  <Form.Control type="number" step="0.1" min="1" max="7" aria-label={`Nota de ${alumno.nombre}`}
                    value={valores[alumno.id] ?? notaGuardada(alumno.id)}
                    onChange={(e) => setValores((v) => ({ ...v, [alumno.id]: e.target.value }))} />
                </td>
                <td>
                  <Button size="sm" variant="primary" onClick={() => guardar(alumno)}>Guardar</Button>{' '}
                  {estado[alumno.id]?.ok && <Badge bg="success">Guardada</Badge>}
                  {estado[alumno.id]?.error && <small className="text-danger">{estado[alumno.id].error}</small>}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

function ProfesorCursosView() {
  const { datos: cursos, cargando, error } = useDatos(academicoService.cursos);
  const [cursoId, setCursoId] = useState(null);

  if (cargando) {
    return <Cargando />;
  }
  const curso = cursos?.find((c) => c.id === cursoId) ?? cursos?.[0];

  return (
    <Container className="my-4">
      <EncabezadoPagina titulo="Mis Cursos" subtitulo="Evaluaciones y calificaciones de tus secciones" />
      <AlertaMensaje mensaje={error} />
      {cursos?.length === 0 && <p className="text-muted">No tienes cursos asignados.</p>}

      {curso && (
        <>
          <Row className="g-3 mb-4">
            {cursos.map((c) => (
              <Col md={6} key={c.id}>
                <Card role="button" onClick={() => setCursoId(c.id)}
                  className={`shadow-sm rounded-3 ${c.id === curso.id ? 'card-ejecutiva' : 'border-0'}`}>
                  <Card.Body>
                    <h5 className="fw-bold mb-1">{c.codigo} - {c.nombre}</h5>
                    <small className="text-muted">Sección {c.seccion} · {c.totalAlumnos} alumnos inscritos</small>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <EvaluacionesCurso key={curso.id} curso={curso} />
        </>
      )}
    </Container>
  );
}

/** Tabla de evaluaciones del curso con CRUD en modal. */
function EvaluacionesCurso({ curso }) {
  const { datos: evaluaciones, cargando, error, recargar } = useDatos(() => academicoService.evaluacionesCurso(curso.id), [curso.id]);
  const [formulario, setFormulario] = useState(null);
  const [errorForm, setErrorForm] = useState(null);
  const [planilla, setPlanilla] = useState(null);
  const [errorAccion, setErrorAccion] = useState(null);

  if (cargando) {
    return <Cargando />;
  }
  const lista = evaluaciones ?? [];
  const sumaPorcentajes = lista.reduce((t, e) => t + e.porcentaje, 0);

  const guardar = async (evento) => {
    evento.preventDefault();
    setErrorForm(null);
    // Solo los campos que espera EvaluacionRequest en el backend
    const datos = {
      cursoId: curso.id,
      titulo: formulario.titulo,
      tipo: formulario.tipo,
      fecha: formulario.fecha,
      sala: formulario.sala || null,
      porcentaje: Number(formulario.porcentaje),
      descripcion: formulario.descripcion || null,
    };
    try {
      if (formulario.id) {
        await academicoService.actualizarEvaluacion(formulario.id, datos);
      } else {
        await academicoService.crearEvaluacion(datos);
      }
      setFormulario(null);
      recargar();
    } catch (e) {
      setErrorForm(mensajeError(e));
    }
  };

  const eliminar = async (evaluacion) => {
    if (!window.confirm(`¿Eliminar la evaluación "${evaluacion.titulo}"?`)) {
      return;
    }
    setErrorAccion(null);
    try {
      await academicoService.eliminarEvaluacion(evaluacion.id);
      recargar();
    } catch (e) {
      setErrorAccion(mensajeError(e));
    }
  };

  const cambiar = (campo) => (e) => setFormulario((f) => ({ ...f, [campo]: e.target.value }));

  return (
    <>
      <Card className="shadow-sm border-0 p-3 rounded-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-primary m-0">
            Evaluaciones de {curso.nombre}{' '}
            <Badge bg={sumaPorcentajes === 100 ? 'success' : 'warning'} text={sumaPorcentajes === 100 ? 'white' : 'dark'}>
              {sumaPorcentajes}% asignado
            </Badge>
          </h5>
          <Button variant="primary" className="fw-bold" onClick={() => { setErrorForm(null); setFormulario({ ...EVALUACION_VACIA }); }}>
            Nueva evaluación
          </Button>
        </div>
        <AlertaMensaje mensaje={error} />
        <AlertaMensaje mensaje={errorAccion} onCerrar={() => setErrorAccion(null)} />
        <Table responsive hover className="align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Evaluación</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Sala</th>
              <th>%</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((ev) => (
              <tr key={ev.id}>
                <td className="fw-semibold">{ev.titulo}</td>
                <td>{ev.tipo}</td>
                <td>{formatearFecha(ev.fecha)}</td>
                <td>{ev.sala}</td>
                <td>{ev.porcentaje}%</td>
                <td className="text-end text-nowrap">
                  <Button size="sm" variant="success" className="me-1" onClick={() => setPlanilla(ev)}>Notas</Button>
                  <Button size="sm" variant="warning" className="me-1"
                    onClick={() => { setErrorForm(null); setFormulario({ ...ev }); }}>Editar</Button>
                  <Button size="sm" variant="danger" onClick={() => eliminar(ev)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {planilla && (
        <PlanillaNotas key={planilla.id} curso={curso} evaluacion={planilla} onCerrar={() => setPlanilla(null)} />
      )}

      <Modal show={Boolean(formulario)} onHide={() => setFormulario(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold text-primary">
            {formulario?.id ? 'Editar evaluación' : 'Nueva evaluación'}
          </Modal.Title>
        </Modal.Header>
        {formulario && (
          <Form onSubmit={guardar}>
            <Modal.Body>
              <AlertaMensaje mensaje={errorForm} />
              <Form.Group className="mb-3" controlId="evTitulo">
                <Form.Label className="fw-semibold">Título *</Form.Label>
                <Form.Control value={formulario.titulo} onChange={cambiar('titulo')} required maxLength={120} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="evTipo">
                <Form.Label className="fw-semibold">Tipo *</Form.Label>
                <Form.Select value={formulario.tipo} onChange={cambiar('tipo')}>
                  <option>Prueba escrita</option>
                  <option>Entrega por encargo</option>
                  <option>Entrega y presentación</option>
                  <option>Control</option>
                  <option>Examen</option>
                  <option>Examen transversal</option>
                </Form.Select>
              </Form.Group>
              <Row>
                <Col>
                  <Form.Group className="mb-3" controlId="evFecha">
                    <Form.Label className="fw-semibold">Fecha *</Form.Label>
                    <Form.Control type="date" value={formulario.fecha} onChange={cambiar('fecha')} required />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3" controlId="evPorcentaje">
                    <Form.Label className="fw-semibold">Ponderación (%) *</Form.Label>
                    <Form.Control type="number" min="1" max="100" value={formulario.porcentaje}
                      onChange={cambiar('porcentaje')} required />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3" controlId="evSala">
                <Form.Label className="fw-semibold">Sala</Form.Label>
                <Form.Control value={formulario.sala ?? ''} onChange={cambiar('sala')} maxLength={60} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="evDescripcion">
                <Form.Label className="fw-semibold">Descripción (la verá el alumno)</Form.Label>
                <Form.Control as="textarea" rows={2} maxLength={300} value={formulario.descripcion ?? ''}
                  onChange={cambiar('descripcion')} placeholder="Qué se evalúa, en una o dos líneas" />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setFormulario(null)}>Cancelar</Button>
              <Button type="submit" variant="primary">Guardar</Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal>
    </>
  );
}

export default ProfesorCursosView;
