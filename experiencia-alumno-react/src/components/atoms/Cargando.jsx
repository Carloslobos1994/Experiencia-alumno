// ATOMO: indicador de carga.
import { Spinner } from 'react-bootstrap';

function Cargando({ texto = 'Cargando...' }) {
  return (
    <div className="d-flex align-items-center justify-content-center gap-2 py-5 text-primary" role="status">
      <Spinner animation="border" size="sm" />
      <span className="fw-semibold">{texto}</span>
    </div>
  );
}

export default Cargando;
