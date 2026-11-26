// ATOMO: etiqueta del rol del usuario.
import { Badge } from 'react-bootstrap';
import { NOMBRE_ROL } from '../../utils/permisos';

const COLOR_ROL = { ADMIN: 'danger', PROFESOR: 'info', ALUMNO: 'primary' };

function BadgeRol({ rol }) {
  return (
    <Badge bg={COLOR_ROL[rol] ?? 'secondary'} className="px-2 py-1">
      {NOMBRE_ROL[rol] ?? rol}
    </Badge>
  );
}

export default BadgeRol;
