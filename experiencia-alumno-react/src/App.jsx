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

  
  useEffect(() => {
    const usuarioGuardado = sessionStorage.getItem("usuario");
    if (usuarioGuardado) {
      setUsuarioActivo(usuarioGuardado);
    }
  }, []);

  
  const handleCambiarVista = (vista) => {
    if (vista === "login") {
      sessionStorage.removeItem("usuario");
      setUsuarioActivo(null);
      setVistaActual("home"); 
    } else {
      setVistaActual(vista);
    }
  };

 
  if (!usuarioActivo) {
    return <Login onLoginSuccess={(user) => setUsuarioActivo(user)} />;
  }

  
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