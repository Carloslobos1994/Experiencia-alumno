// MOLECULA: tarjeta con un indicador (titulo + valor + detalle).
import { Card } from 'react-bootstrap';

function TarjetaDato({ titulo, valor, detalle, variante = 'primary' }) {
  return (
    <Card className={`shadow-sm border-0 border-start border-4 border-${variante} h-100 rounded-3`}>
      <Card.Body>
        <p className="text-muted small fw-semibold text-uppercase mb-1">{titulo}</p>
        <h3 className={`fw-bold text-${variante} mb-0`}>{valor}</h3>
        {detalle && <small className="text-secondary">{detalle}</small>}
      </Card.Body>
    </Card>
  );
}

export default TarjetaDato;
