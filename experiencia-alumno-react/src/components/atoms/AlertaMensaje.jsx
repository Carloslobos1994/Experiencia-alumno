// ATOMO: alerta de error o exito. No se muestra si no hay mensaje.
import { Alert } from 'react-bootstrap';

function AlertaMensaje({ mensaje, variante = 'danger', onCerrar }) {
  if (!mensaje) {
    return null;
  }
  return (
    <Alert variant={variante} dismissible={Boolean(onCerrar)} onClose={onCerrar} className="py-2">
      {mensaje}
    </Alert>
  );
}

export default AlertaMensaje;
