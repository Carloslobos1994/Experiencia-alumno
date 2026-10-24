import { Navbar, Container, Nav, Button } from 'react-bootstrap';

function NavbarAlumno({ cambiarVista }) {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="px-3 shadow-sm">
      <Container fluid>
        <Navbar.Brand href="#home" onClick={() => cambiarVista('home')} style={{ cursor: 'pointer' }}>
          Experiencia Alumno
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link onClick={() => cambiarVista('home')} style={{ cursor: 'pointer' }}>Inicio</Nav.Link>
            <Nav.Link onClick={() => cambiarVista('cursos')} style={{ cursor: 'pointer' }}>Cursos</Nav.Link>
            <Nav.Link onClick={() => cambiarVista('proyectos')} style={{ cursor: 'pointer' }}>Proyectos</Nav.Link>
            <Nav.Link onClick={() => cambiarVista('mensualidades')} style={{ cursor: 'pointer' }}>Mensualidades</Nav.Link>
          </Nav>
          <Button 
            variant="outline-danger" 
            size="sm" 
            onClick={() => cambiarVista('login')}
          >
            Cerrar Sesión
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarAlumno;