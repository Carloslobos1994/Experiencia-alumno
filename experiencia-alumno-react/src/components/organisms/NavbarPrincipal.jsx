// ORGANISMO: barra de navegacion. El menu cambia segun el rol del usuario (IE3.3.3).
import { useEffect, useState } from 'react';
import { Badge, Button, Container, Nav, Navbar } from 'react-bootstrap';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { menuPorRol, rutaInicio } from '../../utils/permisos';
import { mensajesService } from '../../api/servicios';
import BadgeRol from '../atoms/BadgeRol';
import Avatar from '../atoms/Avatar';

function NavbarPrincipal() {
  const { usuario, logout } = useAuth();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [noLeidos, setNoLeidos] = useState(0);

  // Contador de mensajes no leidos (se actualiza al cambiar de pagina)
  useEffect(() => {
    if (!usuario) {
      return undefined;
    }
    let activo = true;
    mensajesService
      .noLeidos()
      .then((r) => activo && setNoLeidos(r.noLeidos))
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, [usuario, ubicacion.pathname]);

  const cerrarSesion = () => {
    logout();
    navegar('/login', { replace: true });
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="px-3 shadow-sm">
      <Container fluid>
        <Navbar.Brand as={Link} to={rutaInicio(usuario?.rol)}>
          Experiencia Alumno
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="menu-principal" />
        <Navbar.Collapse id="menu-principal">
          <Nav className="me-auto">
            {menuPorRol(usuario?.rol).map((item) => (
              <Nav.Link key={item.ruta} as={NavLink} to={item.ruta} end={item.ruta === "/alumno"}>
                {item.texto}
                {item.ruta === '/mensajes' && noLeidos > 0 && (
                  <Badge bg="danger" pill className="ms-1" aria-label={`${noLeidos} mensajes sin leer`}>
                    {noLeidos}
                  </Badge>
                )}
              </Nav.Link>
            ))}
          </Nav>
          <div className="d-flex align-items-center gap-2">
            <Avatar nombre={usuario?.nombre} fotoUrl={usuario?.fotoUrl} tamano={34} borde={false} />
            <span className="text-light small fw-semibold">{usuario?.nombre}</span>
            <BadgeRol rol={usuario?.rol} />
            <Button variant="outline-danger" size="sm" onClick={cerrarSesion}>
              Cerrar Sesión
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarPrincipal;
