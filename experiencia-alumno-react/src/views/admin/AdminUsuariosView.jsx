// src/views/admin/AdminUsuariosView.jsx
// CRUD de usuarios (solo ADMIN): crear, editar y desactivar alumnos, profesores y personal.
import { useState } from 'react';
import { Button, Card, Col, Container, Form, Modal, Row, Table } from 'react-bootstrap';
import { useDatos } from '../../hooks/useDatos';
import { usuariosService } from '../../api/servicios';
import { mensajeError } from '../../utils/errores';
import { NOMBRE_ROL } from '../../utils/permisos';
import Cargando from '../../components/atoms/Cargando';
import AlertaMensaje from '../../components/atoms/AlertaMensaje';
import BadgeEstado from '../../components/atoms/BadgeEstado';
import BadgeRol from '../../components/atoms/BadgeRol';
import EncabezadoPagina from '../../components/molecules/EncabezadoPagina';
import Avatar from '../../components/atoms/Avatar';

const USUARIO_VACIO = { nombre: '', rut: '', email: '', password: '', rol: 'ALUMNO', carrera: 'Analista Programador', sede: 'Plaza Oeste', activo: true, fotoUrl: '' };

function AdminUsuariosView() {
  const [filtroRol, setFiltroRol] = useState('');
  const { datos: usuarios, cargando, error, recargar } = useDatos(() => usuariosService.listar(filtroRol || undefined), [filtroRol]);
  const [formulario, setFormulario] = useState(null);
  const [errorForm, setErrorForm] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [errorAccion, setErrorAccion] = useState(null);

  const cambiar = (campo) => (e) => {
    const valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormulario((f) => ({ ...f, [campo]: valor }));
  };

  const abrir = (usuario) => {
    setErrorForm(null);
    setFormulario(usuario ? { ...usuario, password: '' } : { ...USUARIO_VACIO });
  };

  const guardar = async (evento) => {
    evento.preventDefault();
    setErrorForm(null);
    // Solo los campos que espera UsuarioRequest en el backend (password vacio = no cambiar)
    const datos = {
      nombre: formulario.nombre,
      rut: formulario.rut,
      email: formulario.email,
      password: formulario.password || null,
      rol: formulario.rol,
      carrera: formulario.carrera || null,
      sede: formulario.sede || null,
      activo: formulario.activo,
      fotoUrl: formulario.fotoUrl || null,
    };
    try {
      if (formulario.id) {
        await usuariosService.actualizar(formulario.id, datos);
        setAviso(`Usuario ${formulario.nombre} actualizado`);
      } else {
        await usuariosService.crear(datos);
        setAviso(`Usuario ${formulario.nombre} creado`);
      }
      setFormulario(null);
      recargar();
    } catch (e) {
      setErrorForm(mensajeError(e));
    }
  };

  const desactivar = async (usuario) => {
    if (!window.confirm(`¿Desactivar la cuenta de ${usuario.nombre}? Conservará su historial.`)) {
      return;
    }
    setErrorAccion(null);
    try {
      await usuariosService.desactivar(usuario.id);
      setAviso(`Cuenta de ${usuario.nombre} desactivada`);
      recargar();
    } catch (e) {
      setErrorAccion(mensajeError(e));
    }
  };

  return (
    <Container className="my-4">
      <EncabezadoPagina titulo="Gestión de Usuarios" subtitulo="Alumnos, profesores y personal de Administración">
        <Form.Select aria-label="Filtrar por rol" value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)} style={{ width: '200px' }}>
          <option value="">Todos los roles</option>
          {Object.entries(NOMBRE_ROL).map(([valor, texto]) => (
            <option key={valor} value={valor}>{texto}</option>
          ))}
        </Form.Select>
        <Button variant="primary" className="fw-bold" onClick={() => abrir(null)}>Nuevo usuario</Button>
      </EncabezadoPagina>
      <AlertaMensaje mensaje={error} />
      <AlertaMensaje mensaje={errorAccion} onCerrar={() => setErrorAccion(null)} />
      <AlertaMensaje mensaje={aviso} variante="success" onCerrar={() => setAviso(null)} />

      {cargando ? (
        <Cargando />
      ) : (
        <Card className="shadow-sm border-0 p-3 rounded-3">
          <Table responsive hover className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios?.map((u) => (
                <tr key={u.id}>
                  <td className="fw-semibold">
                    <span className="d-inline-flex align-items-center gap-2">
                      <Avatar nombre={u.nombre} fotoUrl={u.fotoUrl} tamano={32} borde={false} />
                      {u.nombre}
                    </span>
                  </td>
                  <td>{u.rut}</td>
                  <td>{u.email}</td>
                  <td><BadgeRol rol={u.rol} /></td>
                  <td><BadgeEstado estado={u.activo ? 'ACTIVO' : 'INACTIVO'} /></td>
                  <td className="text-end text-nowrap">
                    <Button size="sm" variant="warning" className="me-1" onClick={() => abrir(u)}>Editar</Button>
                    {u.activo && <Button size="sm" variant="danger" onClick={() => desactivar(u)}>Desactivar</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <Modal show={Boolean(formulario)} onHide={() => setFormulario(null)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold text-primary">{formulario?.id ? 'Editar usuario' : 'Nuevo usuario'}</Modal.Title>
        </Modal.Header>
        {formulario && (
          <Form onSubmit={guardar}>
            <Modal.Body>
              <AlertaMensaje mensaje={errorForm} />
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="usNombre">
                    <Form.Label className="fw-semibold">Nombre completo *</Form.Label>
                    <Form.Control value={formulario.nombre} onChange={cambiar('nombre')} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="usRut">
                    <Form.Label className="fw-semibold">RUT *</Form.Label>
                    <Form.Control value={formulario.rut} onChange={cambiar('rut')} placeholder="12.345.678-9" required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="usEmail">
                    <Form.Label className="fw-semibold">Correo institucional *</Form.Label>
                    <Form.Control type="email" value={formulario.email} onChange={cambiar('email')} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="usPassword">
                    <Form.Label className="fw-semibold">Contraseña {formulario.id ? '' : '*'}</Form.Label>
                    <Form.Control type="password" value={formulario.password} onChange={cambiar('password')} minLength={8}
                      placeholder={formulario.id ? 'Dejar vacío para mantener la actual' : 'Mínimo 8 caracteres'}
                      required={!formulario.id} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="usRol">
                    <Form.Label className="fw-semibold">Rol *</Form.Label>
                    <Form.Select value={formulario.rol} onChange={cambiar('rol')}>
                      {Object.entries(NOMBRE_ROL).map(([valor, texto]) => (
                        <option key={valor} value={valor}>{texto}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="usCarrera">
                    <Form.Label className="fw-semibold">Carrera</Form.Label>
                    <Form.Control value={formulario.carrera ?? ''} onChange={cambiar('carrera')} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="usSede">
                    <Form.Label className="fw-semibold">Sede</Form.Label>
                    <Form.Control value={formulario.sede ?? ''} onChange={cambiar('sede')} />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3" controlId="usFoto">
                <Form.Label className="fw-semibold">Foto de perfil (ruta o URL)</Form.Label>
                <Form.Control value={formulario.fotoUrl ?? ''} onChange={cambiar('fotoUrl')} maxLength={255}
                  placeholder="/avatars/nombre.jpg (vacío = se muestran las iniciales)" />
              </Form.Group>
              {formulario.id && (
                <Form.Check type="switch" id="usActivo" label="Cuenta activa" checked={formulario.activo} onChange={cambiar('activo')} />
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setFormulario(null)}>Cancelar</Button>
              <Button type="submit" variant="primary">Guardar</Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal>
    </Container>
  );
}

export default AdminUsuariosView;
