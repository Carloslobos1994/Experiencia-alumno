// MOLECULA: elegir destinatario por seccion (Profesores / Alumnos / Administracion) con buscador.
import { useState } from 'react';
import { Badge, Form, ListGroup, Nav } from 'react-bootstrap';
import { agruparContactos, filtrarContactos, GRUPOS_CONTACTO } from '../../utils/contactos';
import Avatar from '../atoms/Avatar';

function SelectorContacto({ contactos, seleccionadoId, onSeleccionar }) {
  const grupos = agruparContactos(contactos);
  const primerGrupoConContactos = GRUPOS_CONTACTO.find((g) => grupos[g.rol].length > 0)?.rol ?? 'PROFESOR';
  const [grupo, setGrupo] = useState(primerGrupoConContactos);
  const [busqueda, setBusqueda] = useState('');

  const visibles = filtrarContactos(grupos[grupo], busqueda);

  return (
    <div>
      <Nav variant="pills" fill className="mb-2" activeKey={grupo} onSelect={(clave) => setGrupo(clave)}>
        {GRUPOS_CONTACTO.map((g) => (
          <Nav.Item key={g.rol}>
            <Nav.Link eventKey={g.rol} className="py-1">
              {g.titulo}{' '}
              <Badge bg="light" text="dark" pill>{grupos[g.rol].length}</Badge>
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      <Form.Control
        type="search"
        size="sm"
        className="mb-2"
        placeholder="Buscar por nombre o correo..."
        aria-label="Buscar contacto"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <ListGroup style={{ maxHeight: '180px', overflowY: 'auto' }}>
        {visibles.length === 0 && (
          <ListGroup.Item className="text-muted small">Sin resultados en esta sección.</ListGroup.Item>
        )}
        {visibles.map((c) => (
          <ListGroup.Item
            key={c.id}
            action
            type="button"
            active={c.id === seleccionadoId}
            onClick={() => onSeleccionar(c)}
            className="py-2 d-flex align-items-center gap-2"
          >
            <Avatar nombre={c.nombre} fotoUrl={c.fotoUrl} tamano={32} borde={false} />
            <span>
              <span className="fw-semibold d-block">{c.nombre}</span>
              <small className={c.id === seleccionadoId ? '' : 'text-muted'}>{c.email}</small>
            </span>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

export default SelectorContacto;
