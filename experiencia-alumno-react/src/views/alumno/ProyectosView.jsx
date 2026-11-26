// src/views/alumno/ProyectosView.jsx
// Portafolio de proyectos realizados. Cada tarjeta abre su detalle.
import { Col, Container, Row } from 'react-bootstrap';
import { proyectosPortafolio } from '../../data/datosAlumnos';
import EncabezadoPagina from '../../components/molecules/EncabezadoPagina';
import TarjetaProyecto from '../../components/molecules/TarjetaProyecto';

function ProyectosView() {
  return (
    <Container className="my-4">
      <EncabezadoPagina titulo="Portafolio de Proyectos Académicos" subtitulo="Selecciona un proyecto para ver su detalle" />
      <Row className="g-4">
        {proyectosPortafolio.map((proyecto) => (
          <Col key={proyecto.id} xs={12} md={4}>
            <TarjetaProyecto proyecto={proyecto} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default ProyectosView;
