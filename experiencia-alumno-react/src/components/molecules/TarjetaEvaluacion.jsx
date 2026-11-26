// MOLECULA: carta de una proxima evaluacion (ramo, titulo, descripcion, fecha, sala, ponderacion y docente).
import { Badge, Card } from 'react-bootstrap';
import { diasRestantes, formatearFecha } from '../../utils/formato';

/** Texto y color segun cuantos dias faltan. */
export function urgencia(dias) {
  if (dias <= 0) return { texto: 'Hoy', bg: 'danger', text: 'white' };
  if (dias === 1) return { texto: 'Mañana', bg: 'danger', text: 'white' };
  if (dias <= 7) return { texto: `En ${dias} días`, bg: 'warning', text: 'dark' };
  return { texto: `En ${dias} días`, bg: 'secondary', text: 'white' };
}

function TarjetaEvaluacion({ evaluacion }) {
  const estado = urgencia(diasRestantes(evaluacion.fecha));
  const esExamen = evaluacion.tipo?.toLowerCase().includes('examen');

  return (
    <Card className={`h-100 shadow-sm rounded-3 border-0 border-top border-4 ${esExamen ? 'border-danger' : 'border-primary'}`}>
      <Card.Body className="d-flex flex-column p-3">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
          <Badge bg="dark" className="text-wrap text-start">{evaluacion.cursoCodigo}</Badge>
          <Badge bg={estado.bg} text={estado.text}>{estado.texto}</Badge>
        </div>
        <small className="text-muted fw-semibold">{evaluacion.cursoNombre}</small>
        <h6 className="fw-bold text-dark mt-1 mb-2">{evaluacion.titulo}</h6>
        {evaluacion.descripcion && (
          <p className="small text-secondary mb-3 flex-grow-1">{evaluacion.descripcion}</p>
        )}
        <ul className="list-unstyled small mb-0 mt-auto">
          <li><strong>Fecha:</strong> {formatearFecha(evaluacion.fecha)}</li>
          <li><strong>Tipo:</strong> {evaluacion.tipo}</li>
          <li><strong>Sala:</strong> {evaluacion.sala || 'Por confirmar'}</li>
          <li><strong>Ponderación:</strong> {evaluacion.porcentaje}%</li>
          <li><strong>Docente:</strong> {evaluacion.profesorNombre}</li>
        </ul>
      </Card.Body>
    </Card>
  );
}

export default TarjetaEvaluacion;
