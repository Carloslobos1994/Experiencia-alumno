// ORGANISMO: resultados anonimos de la encuesta docente (promedios 1-5 y comentarios).
import { Card, ListGroup, ProgressBar } from 'react-bootstrap';

const DIMENSIONES = [
  { campo: 'claridad', etiqueta: 'Claridad al explicar' },
  { campo: 'puntualidad', etiqueta: 'Puntualidad y organización' },
  { campo: 'retroalimentacion', etiqueta: 'Retroalimentación de evaluaciones' },
  { campo: 'dominio', etiqueta: 'Dominio de la materia' },
];

function colorPara(valor) {
  if (valor >= 4) return 'success';
  if (valor >= 3) return 'warning';
  return 'danger';
}

function ResultadosEncuesta({ resultado }) {
  if (!resultado) {
    return null;
  }
  return (
    <Card className="shadow-sm border-0 rounded-3">
      <Card.Body>
        <div className="d-flex justify-content-between flex-wrap gap-2 mb-3">
          <div>
            <h5 className="fw-bold text-primary mb-0">{resultado.titulo}</h5>
            <small className="text-muted">
              {resultado.cursoNombre} · {resultado.profesorNombre}
            </small>
          </div>
          <div className="text-end">
            <span className="fw-bold">
              {resultado.respuestas} de {resultado.inscritos}
            </span>{' '}
            <small className="text-muted">alumnos respondieron</small>
          </div>
        </div>

        {resultado.respuestas === 0 ? (
          <p className="text-muted m-0">Aún no hay respuestas para esta encuesta.</p>
        ) : (
          <>
            {DIMENSIONES.map(({ campo, etiqueta }) => (
              <div key={campo} className="mb-2">
                <div className="d-flex justify-content-between small fw-semibold">
                  <span>{etiqueta}</span>
                  <span>{resultado[campo]} / 5</span>
                </div>
                <ProgressBar now={(resultado[campo] / 5) * 100} variant={colorPara(resultado[campo])} />
              </div>
            ))}
            <p className="mt-3 mb-2 fw-bold">
              Promedio general: <span className="text-primary">{resultado.promedioGeneral} / 5</span>
            </p>
            {resultado.comentarios.length > 0 && (
              <>
                <h6 className="fw-bold mt-3">Comentarios (anónimos)</h6>
                <ListGroup variant="flush">
                  {resultado.comentarios.map((comentario, i) => (
                    <ListGroup.Item key={i} className="px-0 fst-italic text-secondary">
                      “{comentario}”
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
}

export default ResultadosEncuesta;
