// src/views/alumno/MensualidadesView.jsx
// Carrito de mensualidades: las cuotas las carga Finanzas; el alumno selecciona y paga.
// El total que se muestra es referencial: el backend recalcula el total real al pagar.
import { useState } from 'react';
import { Button, Card, Container, Form, Table } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { useDatos } from '../../hooks/useDatos';
import { finanzasService } from '../../api/servicios';
import { mensajeError } from '../../utils/errores';
import { formatearFechaHora, formatearPesos } from '../../utils/formato';
import Cargando from '../../components/atoms/Cargando';
import AlertaMensaje from '../../components/atoms/AlertaMensaje';
import EncabezadoPagina from '../../components/molecules/EncabezadoPagina';
import TablaCuotas from '../../components/organisms/TablaCuotas';

const cargarFinanzas = () =>
  Promise.all([finanzasService.misCuotas(), finanzasService.misBoletas()]).then(([cuotas, boletas]) => ({ cuotas, boletas }));

function MensualidadesView() {
  const { usuario } = useAuth();
  const { datos, cargando, error, recargar } = useDatos(cargarFinanzas);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [medioPago, setMedioPago] = useState('WEBPAY');
  const [pagando, setPagando] = useState(false);
  const [errorPago, setErrorPago] = useState(null);
  const [boletaGenerada, setBoletaGenerada] = useState(null);

  if (cargando) {
    return <Cargando />;
  }

  const cuotas = datos?.cuotas ?? [];
  const boletas = datos?.boletas ?? [];

  const alternarCuota = (id) => {
    setSeleccionadas((actual) => (actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id]));
  };

  const totalAPagar = cuotas.filter((c) => seleccionadas.includes(c.id)).reduce((total, c) => total + c.monto, 0);

  const pagar = async () => {
    setPagando(true);
    setErrorPago(null);
    try {
      const boleta = await finanzasService.pagar(seleccionadas, medioPago);
      setBoletaGenerada(boleta);
      setSeleccionadas([]);
      recargar();
    } catch (e) {
      setErrorPago(mensajeError(e, 'No fue posible realizar el pago'));
    } finally {
      setPagando(false);
    }
  };

  return (
    <Container className="my-4">
      <EncabezadoPagina titulo="Estado de Mensualidades y Aranceles" subtitulo={`Carrera: ${usuario.carrera}`} />
      <AlertaMensaje mensaje={error} />
      <AlertaMensaje mensaje={errorPago} onCerrar={() => setErrorPago(null)} />
      {boletaGenerada && (
        <AlertaMensaje variante="success" onCerrar={() => setBoletaGenerada(null)}
          mensaje={`¡Pago realizado con éxito! Boleta ${boletaGenerada.numero} por ${formatearPesos(boletaGenerada.total)}.`} />
      )}

      <Card className="shadow-sm border-0 p-4 rounded-3 mb-4">
        <TablaCuotas cuotas={cuotas} seleccionadas={seleccionadas} onToggle={alternarCuota} />

        <div className="d-flex flex-wrap justify-content-between align-items-center pt-3 mt-3 border-top gap-3">
          <h5 className="text-secondary mb-0">
            Total a Pagar: <span className="text-dark fw-bold">{formatearPesos(totalAPagar)}</span>
          </h5>
          <div className="d-flex gap-2 align-items-center">
            <Form.Select aria-label="Medio de pago" value={medioPago} onChange={(e) => setMedioPago(e.target.value)}
              style={{ width: '180px' }}>
              <option value="WEBPAY">Webpay</option>
              <option value="DEBITO">Débito</option>
              <option value="CREDITO">Crédito</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </Form.Select>
            <Button variant="success" size="lg" className="fw-bold px-4"
              disabled={seleccionadas.length === 0 || pagando} onClick={pagar}>
              {pagando ? 'Procesando...' : `Pagar Selección (${formatearPesos(totalAPagar)})`}
            </Button>
          </div>
        </div>
      </Card>

      <h4 className="text-primary fw-bold mb-3">Mis Boletas</h4>
      <Card className="shadow-sm border-0 p-3 rounded-3">
        <Table responsive hover className="align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>N° Boleta</th>
              <th>Fecha</th>
              <th>Detalle</th>
              <th>Medio de pago</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {boletas.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted py-3">Aún no tienes boletas.</td>
              </tr>
            )}
            {boletas.map((b) => (
              <tr key={b.id}>
                <td className="fw-bold">{b.numero}</td>
                <td>{formatearFechaHora(b.fecha)}</td>
                <td className="small">{b.detalles.map((d) => d.concepto).join(', ')}</td>
                <td>{b.medioPago}</td>
                <td className="fw-bold">{formatearPesos(b.total)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
}

export default MensualidadesView;
