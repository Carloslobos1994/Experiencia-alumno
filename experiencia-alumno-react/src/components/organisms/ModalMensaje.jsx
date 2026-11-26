// ORGANISMO: modal para escribir o responder un mensaje interno (POST /mensajes).
// El componente padre lo monta solo cuando se abre, asi el formulario parte limpio.
import { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { mensajesService } from '../../api/servicios';
import { mensajeError } from '../../utils/errores';
import { NOMBRE_ROL } from '../../utils/permisos';
import AlertaMensaje from '../atoms/AlertaMensaje';
import SelectorContacto from '../molecules/SelectorContacto';

function ModalMensaje({ onCerrar, onEnviado, contactos = [], destinatario = null, asuntoInicial = '', respuestaAId = null }) {
  const [destinatarioId, setDestinatarioId] = useState(destinatario?.id ?? '');
  const [asunto, setAsunto] = useState(asuntoInicial);
  const [cuerpo, setCuerpo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const valido = Boolean(destinatarioId) && asunto.trim() !== '' && cuerpo.trim() !== '';

  const enviar = async (evento) => {
    evento.preventDefault();
    if (!valido) {
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const mensaje = await mensajesService.enviar({
        destinatarioId: Number(destinatarioId),
        asunto: asunto.trim(),
        cuerpo: cuerpo.trim(),
        respuestaAId,
      });
      onEnviado?.(mensaje);
      onCerrar();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setEnviando(false);
    }
  };

  let titulo = 'Nuevo mensaje';
  if (respuestaAId) {
    titulo = 'Responder mensaje';
  } else if (destinatario) {
    titulo = `Nuevo mensaje para ${destinatario.nombre}`;
  }

  return (
    <Modal show onHide={onCerrar} centered>
      <Modal.Header closeButton>
        <Modal.Title className="h5 fw-bold text-primary">{titulo}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={enviar}>
        <Modal.Body>
          <AlertaMensaje mensaje={error} />
          <Form.Group className="mb-3" controlId="mensajeDestinatario">
            <Form.Label className="fw-semibold">Para:</Form.Label>
            {destinatario ? (
              <Form.Control value={`${destinatario.nombre} (${destinatario.email ?? NOMBRE_ROL[destinatario.rol] ?? ''})`}
                disabled readOnly className="bg-light" />
            ) : (
              <SelectorContacto contactos={contactos} seleccionadoId={Number(destinatarioId) || null}
                onSeleccionar={(c) => setDestinatarioId(c.id)} />
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="mensajeAsunto">
            <Form.Label className="fw-semibold">Asunto *</Form.Label>
            <Form.Control type="text" maxLength={150} value={asunto} placeholder="Ej: Consulta sobre la evaluación"
              onChange={(e) => setAsunto(e.target.value)} required />
          </Form.Group>

          <Form.Group className="mb-3" controlId="mensajeCuerpo">
            <Form.Label className="fw-semibold">Mensaje *</Form.Label>
            <Form.Control as="textarea" rows={4} maxLength={2000} value={cuerpo}
              placeholder="Escribe el contenido de tu mensaje..." onChange={(e) => setCuerpo(e.target.value)} required />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={!valido || enviando}>
            {enviando ? 'Enviando...' : 'Enviar Mensaje'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ModalMensaje;
