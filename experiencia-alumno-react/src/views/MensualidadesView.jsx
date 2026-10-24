import { useMemo, useState } from "react";
import { Button, Card, Container, Form, Table } from "react-bootstrap";
import { mensualidadesIniciales } from "../data/datosAlumnos";

const formatoPesos = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

function MensualidadesView() {
  const [mensualidades, setMensualidades] = useState(mensualidadesIniciales);
  const [seleccionadas, setSeleccionadas] = useState([]);

  const totalSeleccionado = useMemo(
    () =>
      mensualidades
        .filter((cuota) => seleccionadas.includes(cuota.id))
        .reduce((total, cuota) => total + cuota.monto, 0),
    [mensualidades, seleccionadas]
  );

  const cambiarSeleccion = (id) => {
    setSeleccionadas((actuales) =>
      actuales.includes(id)
        ? actuales.filter((seleccionada) => seleccionada !== id)
        : [...actuales, id]
    );
  };

  const pagarSeleccion = () => {
    if (!seleccionadas.length) return;

    setMensualidades((actuales) =>
      actuales.map((cuota) =>
        seleccionadas.includes(cuota.id)
          ? { ...cuota, estado: "Pagado" }
          : cuota
      )
    );
    setSeleccionadas([]);
    window.alert("Pago registrado correctamente");
  };

  return (
    <Container className="my-4">
      <h1 className="mb-4 text-primary">Mensualidades</h1>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Table responsive hover className="align-middle">
            <thead>
              <tr>
                <th scope="col">Seleccionar</th>
                <th scope="col">Concepto</th>
                <th scope="col">Vencimiento</th>
                <th scope="col">Periodo</th>
                <th scope="col">Monto</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {mensualidades.map((cuota) => (
                <tr key={cuota.id}>
                  <td>
                    <Form.Check
                      aria-label={`Seleccionar ${cuota.concepto}`}
                      checked={seleccionadas.includes(cuota.id)}
                      disabled={cuota.estado === "Pagado"}
                      onChange={() => cambiarSeleccion(cuota.id)}
                    />
                  </td>
                  <td>{cuota.concepto}</td>
                  <td>{cuota.vencimiento}</td>
                  <td>{cuota.periodo}</td>
                  <td>{formatoPesos.format(cuota.monto)}</td>
                  <td>{cuota.estado}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <strong>Total seleccionado: {formatoPesos.format(totalSeleccionado)}</strong>
            <Button
              disabled={!seleccionadas.length}
              onClick={pagarSeleccion}
            >
              Pagar selección
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default MensualidadesView;
