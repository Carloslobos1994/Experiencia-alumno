// ORGANISMO: formulario de la encuesta docente (4 preguntas en escala 1-5 + comentario).
import { useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import EscalaLikert from '../molecules/EscalaLikert';

export const PREGUNTAS = [
  { campo: 'claridad', texto: 'El docente explica los contenidos con claridad.' },
  { campo: 'puntualidad', texto: 'El docente es puntual y organiza bien las clases.' },
  { campo: 'retroalimentacion', texto: 'El docente entrega retroalimentación útil de las evaluaciones.' },
  { campo: 'dominio', texto: 'El docente demuestra dominio de la materia.' },
];

function FormularioEncuesta({ encuesta, onEnviar, enviando = false }) {
  const [respuestas, setRespuestas] = useState({});
  const [comentario, setComentario] = useState('');

  const completa = PREGUNTAS.every((p) => respuestas[p.campo]);

  const enviar = (evento) => {
    evento.preventDefault();
    if (completa) {
      onEnviar({ ...respuestas, comentario: comentario.trim() || null });
    }
  };

  return (
    <Card className="shadow-sm border-0 rounded-3">
      <Card.Body>
        <h5 className="fw-bold text-primary mb-1">{encuesta.titulo}</h5>
        <p className="text-muted small mb-4">
          {encuesta.cursoCodigo} - {encuesta.cursoNombre} · Docente: <strong>{encuesta.profesorNombre}</strong>.
          Tus respuestas son anónimas para el profesor.
        </p>
        <Form onSubmit={enviar}>
          {PREGUNTAS.map((p) => (
            <EscalaLikert
              key={p.campo}
              id={`encuesta-${encuesta.id}-${p.campo}`}
              pregunta={p.texto}
              valor={respuestas[p.campo]}
              onChange={(valor) => setRespuestas((actual) => ({ ...actual, [p.campo]: valor }))}
            />
          ))}
          <Form.Group className="mb-3" controlId={`encuesta-${encuesta.id}-comentario`}>
            <Form.Label className="fw-semibold">Comentario (opcional)</Form.Label>
            <Form.Control as="textarea" rows={3} maxLength={500} value={comentario}
              onChange={(e) => setComentario(e.target.value)} />
          </Form.Group>
          <Button type="submit" variant="success" className="fw-bold" disabled={!completa || enviando}>
            {enviando ? 'Enviando...' : 'Enviar encuesta'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default FormularioEncuesta;
