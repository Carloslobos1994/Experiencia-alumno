// src/views/alumno/CursosView.jsx
// Asignaturas inscritas con evaluaciones, notas y promedio ponderado (GET /notas/mis-notas).
import { Badge, Card, Container, Table } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { useDatos } from '../../hooks/useDatos';
import { academicoService } from '../../api/servicios';
import { claseNota, formatearFecha, formatearNota } from '../../utils/formato';
import Cargando from '../../components/atoms/Cargando';
import AlertaMensaje from '../../components/atoms/AlertaMensaje';
import EncabezadoPagina from '../../components/molecules/EncabezadoPagina';

function CursosView() {
  const { usuario } = useAuth();
  const { datos: cursos, cargando, error } = useDatos(academicoService.misNotas);

  if (cargando) {
    return <Cargando />;
  }

  return (
    <Container className="my-4">
      <EncabezadoPagina titulo="Asignaturas Inscritas" subtitulo={`Estudiante: ${usuario.nombre} | Carrera: ${usuario.carrera}`} />
      <AlertaMensaje mensaje={error} />

      {cursos?.length === 0 && <p className="text-muted">No tienes asignaturas inscritas.</p>}

      {cursos?.map((curso) => (
        <Card key={curso.cursoId} className="shadow-sm border-0 p-3 mb-4 rounded-3">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <div>
              <h5 className="fw-bold text-dark mb-0">
                {curso.codigo} - {curso.nombre}
              </h5>
              <small className="text-muted">
                Sección {curso.seccion} · Docente: {curso.profesorNombre}
              </small>
            </div>
            <div className="text-end">
              <small className="text-muted d-block">Promedio ({curso.porcentajeEvaluado}% evaluado)</small>
              <Badge bg={curso.promedio === null ? 'secondary' : Number(curso.promedio) >= 4 ? 'primary' : 'danger'}
                className="fs-6 px-3 py-2">
                {formatearNota(curso.promedio)}
              </Badge>
            </div>
          </div>

          <Table responsive hover className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Evaluación</th>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Ponderación</th>
                <th>Nota</th>
              </tr>
            </thead>
            <tbody>
              {curso.evaluaciones.map((ev) => (
                <tr key={ev.evaluacionId}>
                  <td className="fw-semibold">{ev.titulo}</td>
                  <td className="text-muted">{ev.tipo}</td>
                  <td>{formatearFecha(ev.fecha)}</td>
                  <td>{ev.porcentaje}%</td>
                  <td className={claseNota(ev.nota)}>{formatearNota(ev.nota)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ))}
    </Container>
  );
}

export default CursosView;
