// src/views/admin/AdminFinanzasView.jsx
// ADMIN / Finanzas: carga mensualidades (individual o masiva), revisa cuotas y boletas.
import { useState } from 'react';
import { Button, Card, Col, Container, Form, Modal, Row, Tab, Table, Tabs } from 'react-bootstrap';
import { useDatos } from '../../hooks/useDatos';
import { finanzasService, usuariosService } from '../../api/servicios';
import { mensajeError } from '../../utils/errores';
import { formatearFechaHora, formatearPesos } from '../../utils/formato';
import Cargando from '../../components/atoms/Cargando';
import AlertaMensaje from '../../components/atoms/AlertaMensaje';
import EncabezadoPagina from '../../components/molecules/EncabezadoPagina';
import TarjetaDato from '../../components/molecules/TarjetaDato';
import TablaCuotas from '../../components/organisms/TablaCuotas';

const CUOTA_VACIA = { alumnoId: '', categoriaId: '', concepto: 'Mensualidad Enero 2027', monto: 319000, vencimiento: '', periodo: '2027-1' };

const cargarFinanzas = (alumnoId) =>
  Promise.all([
    finanzasService.cuotas(alumnoId || undefined),
    finanzasService.boletas(),
    finanzasService.categorias(),
    usuariosService.listar('ALUMNO'),
  ]).then(([cuotas, boletas, categorias, alumnos]) => ({ cuotas, boletas, categorias, alumnos }));

function AdminFinanzasView() {
  const [filtroAlumno, setFiltroAlumno] = useState('');
  const { datos, cargando, error, recargar } = useDatos(() => cargarFinanzas(filtroAlumno), [filtroAlumno]);
  const [formulario, setFormulario] = useState(null); // { modo: 'individual' | 'lote', ...campos }
  const [errorForm, setErrorForm] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [errorAccion, setErrorAccion] = useState(null);

  if (cargando) {
    return <Cargando />;
  }

  const cuotas = datos?.cuotas ?? [];
  const boletas = datos?.boletas ?? [];
  const recaudado = boletas.reduce((t, b) => t + b.total, 0);
  const pendiente = cuotas.filter((c) => c.estado === 'PENDIENTE').reduce((t, c) => t + c.monto, 0);

  const cambiar = (campo) => (e) => setFormulario((f) => ({ ...f, [campo]: e.target.value }));

  const abrir = (modo) => {
    setErrorForm(null);
    setFormulario({ ...CUOTA_VACIA, modo, categoriaId: datos?.categorias[0]?.id ?? '' });
  };

  const guardar = async (evento) => {
    evento.preventDefault();
    setErrorForm(null);
    const base = {
      categoriaId: Number(formulario.categoriaId),
      concepto: formulario.concepto,
      monto: Number(formulario.monto),
      vencimiento: formulario.vencimiento,
      periodo: formulario.periodo,
    };
    try {
      if (formulario.modo === 'lote') {
        const r = await finanzasService.crearLote(base);
        setAviso(`Carga masiva: ${r.creadas} cuota(s) creadas, ${r.omitidas} omitida(s) por duplicado.`);
      } else {
        await finanzasService.crearCuota({ ...base, alumnoId: Number(formulario.alumnoId) });
        setAviso('Cuota asignada correctamente.');
      }
      setFormulario(null);
      recargar();
    } catch (e) {
      setErrorForm(mensajeError(e));
    }
  };

  const eliminar = async (cuota) => {
    if (!window.confirm(`¿Eliminar "${cuota.concepto}" de ${cuota.alumnoNombre}?`)) {
      return;
    }
    setErrorAccion(null);
    try {
      await finanzasService.eliminarCuota(cuota.id);
      recargar();
    } catch (e) {
      setErrorAccion(mensajeError(e));
    }
  };

  return (
    <Container className="my-4">
      <EncabezadoPagina titulo="Finanzas" subtitulo="Mensualidades de los alumnos y boletas de pago">
        <Button variant="outline-primary" className="fw-bold" onClick={() => abrir('individual')}>Asignar cuota</Button>
        <Button variant="primary" className="fw-bold" onClick={() => abrir('lote')}>Carga masiva</Button>
      </EncabezadoPagina>
      <AlertaMensaje mensaje={error} />
      <AlertaMensaje mensaje={errorAccion} onCerrar={() => setErrorAccion(null)} />
      <AlertaMensaje mensaje={aviso} variante="success" onCerrar={() => setAviso(null)} />

      <Row className="g-4 mb-4">
        <Col md={4}><TarjetaDato titulo="Total recaudado" valor={formatearPesos(recaudado)} variante="success" detalle={`${boletas.length} boletas`} /></Col>
        <Col md={4}><TarjetaDato titulo="Por cobrar" valor={formatearPesos(pendiente)} variante="warning" detalle="Cuotas pendientes (filtro actual)" /></Col>
        <Col md={4}><TarjetaDato titulo="Alumnos" valor={datos?.alumnos.length ?? 0} variante="primary" detalle="Activos" /></Col>
      </Row>

      <Card className="shadow-sm border-0 rounded-3">
        <Tabs defaultActiveKey="cuotas" className="px-2 pt-2">
          <Tab eventKey="cuotas" title="Cuotas">
            <div className="p-3">
              <Form.Select aria-label="Filtrar por alumno" className="mb-3" style={{ maxWidth: '320px' }}
                value={filtroAlumno} onChange={(e) => setFiltroAlumno(e.target.value)}>
                <option value="">Todos los alumnos</option>
                {datos?.alumnos.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </Form.Select>
              <TablaCuotas cuotas={cuotas} mostrarAlumno
                acciones={(c) => c.estado === 'PENDIENTE' && (
                  <Button size="sm" variant="outline-danger" onClick={() => eliminar(c)}>Eliminar</Button>
                )} />
            </div>
          </Tab>
          <Tab eventKey="boletas" title={`Boletas (${boletas.length})`}>
            <div className="p-3">
              <Table responsive hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>N°</th>
                    <th>Alumno</th>
                    <th>Fecha</th>
                    <th>Detalle</th>
                    <th>Medio</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {boletas.map((b) => (
                    <tr key={b.id}>
                      <td className="fw-bold">{b.numero}</td>
                      <td>{b.alumnoNombre}<br /><small className="text-muted">{b.alumnoRut}</small></td>
                      <td>{formatearFechaHora(b.fecha)}</td>
                      <td className="small">{b.detalles.map((d) => d.concepto).join(', ')}</td>
                      <td>{b.medioPago}</td>
                      <td className="fw-bold">{formatearPesos(b.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Tab>
        </Tabs>
      </Card>

      <Modal show={Boolean(formulario)} onHide={() => setFormulario(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold text-primary">
            {formulario?.modo === 'lote' ? 'Carga masiva (todos los alumnos activos)' : 'Asignar cuota a un alumno'}
          </Modal.Title>
        </Modal.Header>
        {formulario && (
          <Form onSubmit={guardar}>
            <Modal.Body>
              <AlertaMensaje mensaje={errorForm} />
              {formulario.modo === 'individual' && (
                <Form.Group className="mb-3" controlId="cuAlumno">
                  <Form.Label className="fw-semibold">Alumno *</Form.Label>
                  <Form.Select value={formulario.alumnoId} onChange={cambiar('alumnoId')} required>
                    <option value="">Seleccione...</option>
                    {datos?.alumnos.map((a) => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
              <Form.Group className="mb-3" controlId="cuCategoria">
                <Form.Label className="fw-semibold">Categoría *</Form.Label>
                <Form.Select value={formulario.categoriaId} onChange={cambiar('categoriaId')} required>
                  {datos?.categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3" controlId="cuConcepto">
                <Form.Label className="fw-semibold">Concepto *</Form.Label>
                <Form.Control value={formulario.concepto} onChange={cambiar('concepto')} required maxLength={120} />
              </Form.Group>
              <Row>
                <Col>
                  <Form.Group className="mb-3" controlId="cuMonto">
                    <Form.Label className="fw-semibold">Monto (CLP) *</Form.Label>
                    <Form.Control type="number" min="1" value={formulario.monto} onChange={cambiar('monto')} required />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3" controlId="cuVencimiento">
                    <Form.Label className="fw-semibold">Vencimiento *</Form.Label>
                    <Form.Control type="date" value={formulario.vencimiento} onChange={cambiar('vencimiento')} required />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3" controlId="cuPeriodo">
                <Form.Label className="fw-semibold">Periodo</Form.Label>
                <Form.Control value={formulario.periodo} onChange={cambiar('periodo')} maxLength={20} />
              </Form.Group>
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

export default AdminFinanzasView;
