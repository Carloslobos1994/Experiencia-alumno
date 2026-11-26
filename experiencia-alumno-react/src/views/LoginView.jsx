// src/views/LoginView.jsx
// Inicio de sesion real contra el backend (POST /api/v1/auth/login con JWT).
import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validarCorreoInstitucional } from '../utils/validaciones';
import { mensajeError } from '../utils/errores';
import { rutaInicio } from '../utils/permisos';
import AlertaMensaje from '../components/atoms/AlertaMensaje';
import Footer from '../components/organisms/Footer';
import logoDuoc from '../assets/logoduoc.png';

// Cuentas de demostracion (contrasena: Duoc2026!)
const CUENTAS_DEMO = [
  { rol: 'Alumno', email: 'carlos.lobos@duocuc.cl' },
  { rol: 'Profesor', email: 'mari.huertas@profesorduocuc.cl' },
  { rol: 'Finanzas', email: 'mariafinanzas@adminduocuc.cl' },
];

function LoginView() {
  const { login, usuario } = useAuth();
  const navegar = useNavigate();
  const ubicacion = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Si ya hay sesion activa (por ejemplo, tras recargar), no se muestra el login
  if (usuario) {
    return <Navigate to={rutaInicio(usuario.rol)} replace />;
  }

  const iniciarSesion = async (evento) => {
    evento.preventDefault();
    setError(null);

    if (!validarCorreoInstitucional(email)) {
      setError('Acceso restringido: debe ingresar con su correo institucional Duoc UC');
      return;
    }
    if (!password) {
      setError('Debe ingresar su contraseña');
      return;
    }

    setEnviando(true);
    try {
      const usuarioLogueado = await login(email, password);
      const destino = ubicacion.state?.desde ?? rutaInicio(usuarioLogueado.rol);
      navegar(destino, { replace: true });
    } catch (e) {
      setError(mensajeError(e, 'No fue posible iniciar sesión'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="container mt-5 flex-grow-1" style={{ maxWidth: '420px' }}>
        <div className="card shadow-sm border-0 p-4 rounded-3 text-center">
          <h3 className="text-primary fw-bold mb-4">Iniciar sesión</h3>

          <AlertaMensaje mensaje={error} />

          <Form onSubmit={iniciarSesion} noValidate>
            <Form.Group className="mb-3 text-start" controlId="usuario">
              <Form.Label className="fw-semibold">Correo Institucional</Form.Label>
              <Form.Control type="email" placeholder="nombre.apellido@duocuc.cl" value={email}
                autoComplete="username" onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3 text-start" controlId="password">
              <Form.Label className="fw-semibold">Contraseña</Form.Label>
              <Form.Control type="password" value={password} autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100 fw-bold mt-2" disabled={enviando}>
              {enviando ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </Form>

          <div className="mt-4 pt-2">
            <img src={logoDuoc} alt="Logo Duoc UC" className="img-fluid" style={{ maxHeight: '38px', objectFit: 'contain' }} />
          </div>
        </div>

        <details className="mt-3 small text-muted">
          <summary>Cuentas de demostración</summary>
          <p className="mb-1 mt-2">Contraseña: <code>Duoc2026!</code></p>
          {CUENTAS_DEMO.map((cuenta) => (
            <Button key={cuenta.email} variant="link" size="sm" className="p-0 d-block"
              onClick={() => setEmail(cuenta.email)}>
              {cuenta.rol}: {cuenta.email}
            </Button>
          ))}
        </details>
      </div>
      <Footer />
    </div>
  );
}

export default LoginView;
