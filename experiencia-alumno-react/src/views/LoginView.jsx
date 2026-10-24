import { useState } from "react";
import { Button, Card, Container, Form } from "react-bootstrap";
import Footer from "../components/Footer";

function LoginView({ onLoginSuccess }) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const handleIngresar = (event) => {
    event.preventDefault();

    if (!correo.trim().toLowerCase().endsWith("@duocuc.cl")) {
      window.alert(
        "Acceso restringido: Debe ingresar con su correo institucional @duocuc.cl"
      );
      return;
    }

    if (!contrasena) {
      window.alert("Debe ingresar su contraseña");
      return;
    }

    sessionStorage.setItem("usuario", correo.trim());
    onLoginSuccess?.(correo.trim());
  };

  return (
    <div className="d-flex min-vh-100 flex-column">
      <Container className="my-auto py-5" style={{ maxWidth: "460px" }}>
        <Card className="border-0 p-4 shadow-sm">
          <Card.Body>
            <h1 className="mb-4 text-center text-primary">Iniciar sesión</h1>
            <Form onSubmit={handleIngresar}>
              <Form.Group className="mb-3" controlId="correoInstitucional">
                <Form.Label>Correo institucional</Form.Label>
                <Form.Control
                  type="email"
                  autoComplete="username"
                  placeholder="nombre@duocuc.cl"
                  value={correo}
                  onChange={(event) => setCorreo(event.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-4" controlId="contrasena">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  autoComplete="current-password"
                  value={contrasena}
                  onChange={(event) => setContrasena(event.target.value)}
                />
              </Form.Group>
              <Button className="w-100" type="submit">
                Ingresar
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
      <Footer />
    </div>
  );
}

export default LoginView;
