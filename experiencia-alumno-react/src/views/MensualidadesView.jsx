import { useState } from 'react';
import { Container, Card, Table, Badge, Button, Form } from 'react-bootstrap';
import { mensualidadesIniciales, informacionAlumno } from '../data/datosAlumnos';

function MensualidadesView() {
  const [mensualidades, setMensualidades] = useState(mensualidadesIniciales);
  // Guardamos las IDs de las cuotas seleccionadas para pagar
  const [seleccionadas, setSeleccionadas] = useState([]);

  // Manejar el toggle de los checkboxes
  const handleToggleCuota = (id) => {
    if (seleccionadas.includes(id)) {
      setSeleccionadas(seleccionadas.filter(item => item !== id));
    } else {
      setSeleccionadas([...seleccionadas, id]);
    }
  };

  // Calcular el total a pagar según las cuotas seleccionadas
  const totalAPagar = mensualidades
    .filter(item => seleccionadas.includes(item.id))
    .reduce((acc, item) => acc + item.monto, 0);

  const handlePagar = () => {
    if (seleccionadas.length === 0) {
      alert("Por favor, selecciona al menos una mensualidad para pagar.");
      return;
    }

    // Cambiamos a 'Pagado' solo las cuotas cuyas IDs fueron seleccionadas
    const actualizadas = mensualidades.map(item =>
      seleccionadas.includes(item.id) ? { ...item, estado: 'Pagado' } : item
    );

    setMensualidades(actualizadas);
    setSeleccionadas([]); // Limpiamos la selección
    alert("¡Pago realizado con éxito! Las mensualidades seleccionadas han sido pagadas.");
  };

  return (
    <Container className="my-4">
      <div className="mb-4">
        <h2 className="text-primary fw-bold mb-1">Estado de Mensualidades y Aranceles</h2>
        <p className="text-muted fw-semibold m-0">Carrera: {informacionAlumno.carrera}</p>
      </div>

      <Card className="shadow-sm border-0 p-4 rounded-3">
        <Table responsive hover className="align-middle mb-4">
          <thead className="table-light">
            <tr>
              <th style={{ width: "50px" }}>Pagar</th>
              <th>Concepto</th>
              <th>Vencimiento</th>
              <th>Monto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {mensualidades.map((cuota) => (
              <tr key={cuota.id}>
                <td>
                  {cuota.estado === 'Pendiente' && (
                    <Form.Check
                      type="checkbox"
                      id={`check-${cuota.id}`}
                      checked={seleccionadas.includes(cuota.id)}
                      onChange={() => handleToggleCuota(cuota.id)}
                    />
                  )}
                </td>
                <td className="fw-semibold text-dark">{cuota.concepto}</td>
                <td className="text-muted">{cuota.vencimiento}</td>
                <td className="fw-bold">${cuota.monto.toLocaleString('es-CL')}</td>
                <td>
                  <Badge
                    bg={cuota.estado === 'Pagado' ? 'success' : 'warning'}
                    text={cuota.estado === 'Pagado' ? 'white' : 'dark'}
                    className="px-2 py-1"
                  >
                    {cuota.estado}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="d-flex flex-wrap justify-content-between align-items-center pt-3 border-top gap-3">
          <div>
            <h5 className="text-secondary mb-0">
              Total a Pagar: <span className="text-dark fw-bold">${totalAPagar.toLocaleString('es-CL')}</span>
            </h5>
          </div>
          <Button
            variant="success"
            size="lg"
            className="fw-bold px-4"
            disabled={seleccionadas.length === 0}
            onClick={handlePagar}
          >
            Pagar Selección (${totalAPagar.toLocaleString('es-CL')})
          </Button>
        </div>
      </Card>
    </Container>
  );
}

export default MensualidadesView;