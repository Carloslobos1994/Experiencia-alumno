// src/views/admin/AdminCursosView.jsx
// ADMIN: CRUD de cursos (con profesor a cargo) e inscripcion de alumnos.
import { useState } from 'react';
import { Button, Card, Container, Form, InputGroup, ListGroup, Modal, Table } from 'react-bootstrap';
import { useDatos } from '../../hooks/useDatos';
import { academicoService, usuariosService } from '../../api/servicios';
import { mensajeError } from '../../utils/errores';
import Cargando from '../../components/atoms/Cargando';
import AlertaMensaje from '../../components/atoms/AlertaMensaje';
import EncabezadoPagina from '../../components/molecules/EncabezadoPagina';

const CURSO_VACIO = { codigo: '', seccion: '', nombre: '', profesorId: '' };

const cargarDatos = () =>
  Promise.all([academicoService.cursos(), usuariosService.listar('PROFESOR'), usuariosService.listar('ALUMNO')]).then(
    ([cursos, profesores, alumnos]) => ({ cursos, profesores, alumnos }),
  );

/** Modal de inscripciones de un curso: lista alumnos inscritos, permite agregar y quitar. */
function InscripcionesCurso({ curso, alumnos, onCerrar, onCambio }) {
  const { datos: inscritos, cargando, error, recargar } = useDatos(() => academicoService.alumnosCurso(curso.id), [curso.id]);
  const [alumnoId, setAlumnoId] = useState('');
  const [errorAccion, setErrorAccion] = useState(null);

  const disponibles = alumnos.filter((a) => !inscritos?.some((i) => i.id === a.id));

  const ejecutar = async (accion) => {
    setErrorAccion(null);
    try {
      await accion();
      setAlumnoId('');
      recargar();
      onCambio();
    } catch (e) {
      setErrorAccion(mensajeError(e));
    }
  };

  return (
    <Modal show onHide={onCerrar} centered>
      <Modal.Header closeButton>
        <Modal.Title className="h5 fw-bold text-primary">Inscripciones · {curso.codigo} {curso.nombre}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <AlertaMensaje mensaje={error} />
        <AlertaMensaje mensaje={errorAccion} />
        <InputGroup className="mb-3">
          <Form.Select aria-label="Alumno a inscribir" value={alumnoId} onChange={(e) => setAlumnoId(e.target.value)}>
            <option value="">Seleccione un alumno...</option>
            {disponibles.map((a) => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </Form.Select>
          <Button disabled={!alumnoId} onClick={() => ejecutar(() => academicoService.inscribir(curso.id, Number(alumnoId)))}>
            Inscribir
          </Button>
        </InputGroup>
        {cargando ? (
          <Cargando />
        ) : (
          <ListGroup>
            {inscritos?.length === 0 && <ListGroup.Item className="text-muted">Sin alumnos inscritos.</ListGroup.Item>}
            {inscritos?.map((a) => (
              <ListGroup.Item key={a.id} className="d-flex justify-content-between align-items-center">
                {a.nombre}
                <Button size="sm" variant="outline-danger"
                  onClick={() => ejecutar(() => academicoService.desinscribir(curso.id, a.id))}>
                  Quitar
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
    </Modal>
  );
}

function AdminCursosView() {
  const { datos, cargando, error, recargar } = useDatos(cargarDatos);
  const [formulario, setFormulario] = useState(null);
  const [errorForm, setErrorForm] = useState(null);
  const [inscripciones, setInscripciones] = useState(null);
  const [errorAccion, setErrorAccion] = useState(null);

  if (cargando) {
    return <Cargando />;
  }

  const cambiar = (campo) => (e) => setFormulario((f) => ({ ...f, [campo]: e.target.value }));

  const guardar = async (evento) => {
    evento.preventDefault();
    setErrorForm(null);
    // Solo los campos que espera CursoRequest en el backend
    const curso = {
      codigo: formulario.codigo,
      seccion: formulario.seccion,
      nombre: formulario.nombre,
      profesorId: Number(formulario.profesorId),
    };
    try {
      if (formulario.id) {
        await academicoService.actualizarCurso(formulario.id, curso);
      } else {
        await academicoService.crearCurso(curso);
      }
      setFormulario(null);
      recargar();
    } catch (e) {
      setErrorForm(mensajeError(e));
    }
  };

  const eliminar = async (curso) => {
    if (!window.confirm(`¿Eliminar el curso ${curso.codigo} ${curso.nombre}?`)) {
      return;
    }
    setErrorAccion(null);
    try {
      await academicoService.eliminarCurso(curso.id);
      recargar();
    } catch (e) {
      setErrorAccion(mensajeError(e));
    }
  };

  return (
    <Container className="my-4">
      <EncabezadoPagina titulo="Gestión de Cursos" subtitulo="Asignaturas, profesor a cargo e inscripciones">
        <Button variant="primary" className="fw-bold" onClick={() => { setErrorForm(null); setFormulario({ ...CURSO_VACIO }); }}>
          Nuevo curso
        </Button>
      </EncabezadoPagina>
      <AlertaMensaje mensaje={error} />
      <AlertaMensaje mensaje={errorAccion} onCerrar={() => setErrorAccion(null)} />

      <Card className="shadow-sm border-0 p-3 rounded-3">
        <Table responsive hover className="align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Código</th>
              <th>Sección</th>
              <th>Asignatura</th>
              <th>Profesor</th>
              <th>Alumnos</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datos?.cursos.map((c) => (
              <tr key={c.id}>
                <td className="fw-bold">{c.codigo}</td>
                <td>{c.seccion}</td>
                <td>{c.nombre}</td>
                <td>{c.profesorNombre}</td>
                <td>{c.totalAlumnos}</td>
                <td className="text-end text-nowrap">
                  <Button size="sm" variant="success" className="me-1" onClick={() => setInscripciones(c)}>Inscripciones</Button>
                  <Button size="sm" variant="warning" className="me-1"
                    onClick={() => { setErrorForm(null); setFormulario({ ...c }); }}>Editar</Button>
                  <Button size="sm" variant="danger" onClick={() => eliminar(c)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal show={Boolean(formulario)} onHide={() => setFormulario(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold text-primary">{formulario?.id ? 'Editar curso' : 'Nuevo curso'}</Modal.Title>
        </Modal.Header>
        {formulario && (
          <Form onSubmit={guardar}>
            <Modal.Body>
              <AlertaMensaje mensaje={errorForm} />
              <Form.Group className="mb-3" controlId="cuCodigo">
                <Form.Label className="fw-semibold">Código *</Form.Label>
                <Form.Control value={formulario.codigo} onChange={cambiar('codigo')} placeholder="DSY1104" required />
              </Form.Group>
              <Form.Group className="mb-3" controlId="cuSeccion">
                <Form.Label className="fw-semibold">Sección *</Form.Label>
                <Form.Control value={formulario.seccion} onChange={cambiar('seccion')} placeholder="001V" required />
              </Form.Group>
              <Form.Group className="mb-3" controlId="cuNombre">
                <Form.Label className="fw-semibold">Nombre *</Form.Label>
                <Form.Control value={formulario.nombre} onChange={cambiar('nombre')} required />
              </Form.Group>
              <Form.Group className="mb-3" controlId="cuProfesor">
                <Form.Label className="fw-semibold">Profesor a cargo *</Form.Label>
                <Form.Select value={formulario.profesorId} onChange={cambiar('profesorId')} required>
                  <option value="">Seleccione...</option>
                  {datos?.profesores.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setFormulario(null)}>Cancelar</Button>
              <Button type="submit" variant="primary">Guardar</Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal>

      {inscripciones && (
        <InscripcionesCurso curso={inscripciones} alumnos={datos?.alumnos ?? []}
          onCerrar={() => setInscripciones(null)} onCambio={recargar} />
      )}
    </Container>
  );
}

export default AdminCursosView;
