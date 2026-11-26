// ORGANISMO: directorio desplegable (acordeon) de Profesores, Alumnos y Administracion,
// con buscador y boton "Mensaje" en cada contacto.
import { useState } from 'react';
import { Accordion, Badge, Button, Card, Form, ListGroup } from 'react-bootstrap';
import { agruparContactos, filtrarContactos, GRUPOS_CONTACTO } from '../../utils/contactos';
import Avatar from '../atoms/Avatar';

function DirectorioContactos({ contactos, onEscribir }) {
  const [busqueda, setBusqueda] = useState('');
  const grupos = agruparContactos(filtrarContactos(contactos, busqueda));

  return (
    <Card className="shadow-sm border-0 p-3 rounded-3">
      <h5 className="text-primary fw-bold mb-3">Mis Contactos</h5>
      <Form.Control
        type="search"
        className="mb-3"
        placeholder="Buscar profesor, compañero o Administración..."
        aria-label="Buscar en mis contactos"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <Accordion defaultActiveKey={['PROFESOR']} alwaysOpen>
        {GRUPOS_CONTACTO.map((g) => (
          <Accordion.Item eventKey={g.rol} key={g.rol}>
            <Accordion.Header>
              {g.titulo}&nbsp;<Badge bg="primary" pill>{grupos[g.rol].length}</Badge>
            </Accordion.Header>
            <Accordion.Body className="p-0">
              <ListGroup variant="flush">
                {grupos[g.rol].length === 0 && (
                  <ListGroup.Item className="text-muted small">Sin contactos.</ListGroup.Item>
                )}
                {grupos[g.rol].map((c) => (
                  <ListGroup.Item key={c.id} className="d-flex justify-content-between align-items-center gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <Avatar nombre={c.nombre} fotoUrl={c.fotoUrl} tamano={40} borde={false} />
                      <div>
                        <strong className="text-dark d-block">{c.nombre}</strong>
                        <small className="text-muted">{c.email}</small>
                      </div>
                    </div>
                    <Button variant="outline-primary" size="sm" className="fw-bold px-3" onClick={() => onEscribir(c)}>
                      Mensaje
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </Card>
  );
}

export default DirectorioContactos;
