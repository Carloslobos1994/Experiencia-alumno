import { Container, Table, Card } from 'react-bootstrap';
import { cursosIniciales, informacionAlumno } from '../data/datosAlumnos';

function CursosView() {
  return (
    <Container className="my-4">
      <h2 className="mb-4 text-primary">Asignaturas Inscritas</h2>
      
      <Card className="shadow-sm border-0 p-3 mb-4 bg-light">
        <h5 className="text-secondary mb-1">Estudiante: {informacionAlumno.nombre}</h5>
        <p className="text-muted m-0">Carrera: {informacionAlumno.carrera} | Institución: {informacionAlumno.institucion}</p>
      </Card>

      <Card className="shadow-sm border-0 p-3">
        <Table responsive hover className="align-middle">
          <thead className="table-light">
            <tr>
              <th>Código</th>
              <th>Nombre de la Asignatura</th>
              <th>Sección</th>
              <th>Docente</th>
            </tr>
          </thead>
          <tbody>
            {cursosIniciales.map((curso) => (
              <tr key={curso.id}>
                <td className="fw-bold">{curso.codigo}</td>
                <td>{curso.nombre}</td>
                <td>{curso.seccion}</td>
                <td>{curso.docente}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
}

export default CursosView;