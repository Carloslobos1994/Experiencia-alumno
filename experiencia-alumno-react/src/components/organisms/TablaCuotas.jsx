// ORGANISMO: tabla del carrito de mensualidades. Solo las cuotas PENDIENTES se pueden seleccionar.
import { Form, Table } from 'react-bootstrap';
import { formatearFecha, formatearPesos } from '../../utils/formato';
import BadgeEstado from '../atoms/BadgeEstado';

function TablaCuotas({ cuotas, seleccionadas = [], onToggle, mostrarAlumno = false, acciones }) {
  return (
    <Table responsive hover className="align-middle mb-0">
      <thead className="table-light">
        <tr>
          {onToggle && <th style={{ width: '60px' }}>Pagar</th>}
          {mostrarAlumno && <th>Alumno</th>}
          <th>Concepto</th>
          <th>Categoría</th>
          <th>Vencimiento</th>
          <th>Monto</th>
          <th>Estado</th>
          {acciones && <th className="text-end">Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {cuotas.length === 0 && (
          <tr>
            <td colSpan={8} className="text-center text-muted py-4">
              No hay cuotas registradas.
            </td>
          </tr>
        )}
        {cuotas.map((cuota) => (
          <tr key={cuota.id}>
            {onToggle && (
              <td>
                {cuota.estado === 'PENDIENTE' && (
                  <Form.Check
                    type="checkbox"
                    id={`cuota-${cuota.id}`}
                    aria-label={`Seleccionar ${cuota.concepto}`}
                    checked={seleccionadas.includes(cuota.id)}
                    onChange={() => onToggle(cuota.id)}
                  />
                )}
              </td>
            )}
            {mostrarAlumno && <td>{cuota.alumnoNombre}</td>}
            <td className="fw-semibold text-dark">{cuota.concepto}</td>
            <td className="text-muted">{cuota.categoriaNombre}</td>
            <td className="text-muted">{formatearFecha(cuota.vencimiento)}</td>
            <td className="fw-bold">{formatearPesos(cuota.monto)}</td>
            <td>
              <BadgeEstado estado={cuota.estado} />
            </td>
            {acciones && <td className="text-end">{acciones(cuota)}</td>}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default TablaCuotas;
