// ATOMO: etiqueta de estado con color segun su significado.
import { Badge } from 'react-bootstrap';

const ESTILOS = {
  PENDIENTE: { bg: 'warning', text: 'dark', etiqueta: 'Pendiente' },
  PAGADA: { bg: 'success', text: 'white', etiqueta: 'Pagada' },
  ABIERTA: { bg: 'success', text: 'white', etiqueta: 'Abierta' },
  CERRADA: { bg: 'secondary', text: 'white', etiqueta: 'Cerrada' },
  ACTIVO: { bg: 'success', text: 'white', etiqueta: 'Activo' },
  INACTIVO: { bg: 'secondary', text: 'white', etiqueta: 'Inactivo' },
  NUEVO: { bg: 'primary', text: 'white', etiqueta: 'Nuevo' },
};

function BadgeEstado({ estado }) {
  const estilo = ESTILOS[estado] ?? { bg: 'light', text: 'dark', etiqueta: estado };
  return (
    <Badge bg={estilo.bg} text={estilo.text} className="px-2 py-1">
      {estilo.etiqueta}
    </Badge>
  );
}

export default BadgeEstado;
