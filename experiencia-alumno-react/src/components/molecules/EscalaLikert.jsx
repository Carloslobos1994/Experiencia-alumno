// MOLECULA: pregunta de encuesta con escala 1 a 5 (radio buttons).
import { Form } from 'react-bootstrap';

const OPCIONES = [1, 2, 3, 4, 5];

function EscalaLikert({ id, pregunta, valor, onChange }) {
  return (
    <Form.Group className="mb-3" controlId={id}>
      <Form.Label className="fw-semibold d-block">{pregunta}</Form.Label>
      <div className="d-flex gap-3 align-items-center" role="radiogroup" aria-label={pregunta}>
        <small className="text-muted">Muy en desacuerdo</small>
        {OPCIONES.map((opcion) => (
          <Form.Check
            key={opcion}
            inline
            type="radio"
            id={`${id}-${opcion}`}
            name={id}
            label={String(opcion)}
            checked={valor === opcion}
            onChange={() => onChange(opcion)}
          />
        ))}
        <small className="text-muted">Muy de acuerdo</small>
      </div>
    </Form.Group>
  );
}

export default EscalaLikert;
