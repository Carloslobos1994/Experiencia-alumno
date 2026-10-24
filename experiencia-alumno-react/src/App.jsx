import { useState, useEffect } from "react";
import Login from "./views/LoginView";
import NavbarAlumno from "./components/NavbarAlumno";
import HomeView from "./views/HomeView";
import CursosView from "./views/CursosView";
import ProyectosView from "./views/ProyectosView";
import MensualidadesView from "./views/MensualidadesView";
import Footer from "./components/Footer";

function App() {
  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const [vistaActual, setVistaActual] = useState("home");

  // Al cargar la app, revisamos si ya hay una sesión guardada en sessionStorage
  useEffect(() => {
    const usuarioGuardado = sessionStorage.getItem("usuario");
    if (usuarioGuardado) {
      setUsuarioActivo(usuarioGuardado);
    }
  }, []);

  // Función para manejar el cambio de vista o el cierre de sesión
  const handleCambiarVista = (vista) => {
    if (vista === "login") {
      sessionStorage.removeItem("usuario");
      setUsuarioActivo(null);
      setVistaActual("home"); // Resetea la vista por defecto
    } else {
      setVistaActual(vista);
    }
  };

  // Si NO hay sesión activa, muestra estrictamente la pantalla de Login
  if (!usuarioActivo) {
    return <Login onLoginSuccess={(user) => setUsuarioActivo(user)} />;
  }

  // Si SÍ hay sesión activa, muestra el NavbarAlumno y el contenido real seleccionado
  return (
    <div>
      <NavbarAlumno cambiarVista={handleCambiarVista} usuario={usuarioActivo} />

      {/* Renderizado condicional de las vistas reales */}
      {vistaActual === "home" && <HomeView />}
      {vistaActual === "cursos" && <CursosView />}
      {vistaActual === "proyectos" && <ProyectosView />}
      {vistaActual === "mensualidades" && <MensualidadesView />}
      
    <Footer />  
    </div>  
  );
}

export default App;