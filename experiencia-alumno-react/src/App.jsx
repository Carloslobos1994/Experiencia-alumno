import { useState } from "react";
import Login from "./views/LoginView";
import NavbarAlumno from "./components/NavbarAlumno";
import HomeView from "./views/HomeView";
import CursosView from "./views/CursosView";
import ProyectosView from "./views/ProyectosView";
import MensualidadesView from "./views/MensualidadesView";
import Footer from "./components/Footer";

function App() {
  const [usuarioActivo, setUsuarioActivo] = useState(
    () => sessionStorage.getItem("usuario")
  );
  const [vistaActual, setVistaActual] = useState("home");

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
      <NavbarAlumno cambiarVista={handleCambiarVista} />

      {vistaActual === "home" && <HomeView />}
      {vistaActual === "cursos" && <CursosView />}
      {vistaActual === "proyectos" && <ProyectosView />}
      {vistaActual === "mensualidades" && <MensualidadesView />}
      <Footer />
    </div>
  );
}

export default App;