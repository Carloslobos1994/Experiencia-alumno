import { useState } from "react";
// Importamos la validación desde tu capa externa
import { validarCorreoAlumno, validarCredenciales } from "../utils/validaciones";
// Importamos tu logo institucional
import logoDuoc from "../assets/logoduoc.png";
import Footer from "../components/Footer";



function Login({ onLoginSuccess }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  function iniciarSesion() {
    console.log("Usuario:", usuario);
    console.log("Password:", password);

    // 1. Validar que el correo sea estrictamente de alumno (@duocuc.cl)
    if (!validarCorreoAlumno(usuario)) {
      alert("Acceso restringido: Debe ingresar con su correo institucional @duocuc.cl");
      return;
    }

    // 2. Validar credenciales usando la función externa
    if (validarCredenciales(usuario, password)) {
      console.log("Login correcto");

      sessionStorage.setItem("usuario", usuario);
      
      // Llamamos a la función que nos pasó App.jsx para actualizar el estado
      if (onLoginSuccess) {
        onLoginSuccess(usuario);
      }
      
      console.log("Usuario de sesión:", usuario);
    } else {
      alert("Usuario o contraseña incorrectos");
      console.log("Usuario o contraseña incorrectos");
    }
  }

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <div className="card shadow-sm border-0 p-4 rounded-3 text-center">
        <h3 className="text-primary fw-bold mb-4">Iniciar sesión</h3>

        <div className="mb-3 text-start">
          <label htmlFor="usuario" className="form-label fw-semibold">
            Correo Institucional
          </label>
          <input
            id="usuario"
            className="form-control"
            type="email"
            placeholder="carlos.lobos@duocuc.cl"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
        </div>

        <div className="mb-3 text-start">
          <label htmlFor="password" className="form-label fw-semibold">
            Contraseña
          </label>
          <input
            id="password"
            className="form-control"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary w-100 fw-bold mt-2"
          onClick={iniciarSesion}
        >
          Ingresar
        </button>

        {/* Logo integrado abajo, separado del botón con margen superior */}
        <div className="mt-4 pt-2">
          <img 
            src={logoDuoc} 
            alt="Logo Duoc UC" 
            className="img-fluid" 
            style={{ maxHeight: "38px", objectFit: "contain" }} 
            
          />
        </div>
      </div> 
      <Footer /> 
    </div>
    
  );
}

export default Login;