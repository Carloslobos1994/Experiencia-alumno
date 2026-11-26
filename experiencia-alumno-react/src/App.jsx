// src/App.jsx
// Rutas de la aplicacion. Cada grupo de rutas esta protegido por rol (IE3.3.3):
//   ALUMNO -> /alumno/*      /mensajes es comun a todos los usuarios autenticados.
import { Route, Routes } from 'react-router-dom';
import RutaProtegida from './routes/RutaProtegida';
import RedireccionInicio from './routes/RedireccionInicio';
import PlantillaPrincipal from './components/templates/PlantillaPrincipal';
import LoginView from './views/LoginView';
import MensajesView from './views/MensajesView';
import NoAutorizadoView from './views/NoAutorizadoView';
import NoEncontradoView from './views/NoEncontradoView';
import HomeView from './views/alumno/HomeView';
import CursosView from './views/alumno/CursosView';
import MensualidadesView from './views/alumno/MensualidadesView';
import EncuestasView from './views/alumno/EncuestasView';
import ProyectosView from './views/alumno/ProyectosView';
import ProyectoDetalleView from './views/alumno/ProyectoDetalleView';
import { ROLES } from './utils/permisos';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route path="/" element={<RedireccionInicio />} />

      {/* Todo lo que esta aqui dentro exige sesion iniciada */}
      <Route element={<RutaProtegida><PlantillaPrincipal /></RutaProtegida>}>
        <Route element={<RutaProtegida roles={[ROLES.ALUMNO]} />}>
          <Route path="/alumno" element={<HomeView />} />
          <Route path="/alumno/cursos" element={<CursosView />} />
          <Route path="/alumno/mensualidades" element={<MensualidadesView />} />
          <Route path="/alumno/encuestas" element={<EncuestasView />} />
          <Route path="/alumno/proyectos" element={<ProyectosView />} />
          <Route path="/alumno/proyectos/:id" element={<ProyectoDetalleView />} />
        </Route>

        <Route path="/mensajes" element={<MensajesView />} />
        <Route path="/no-autorizado" element={<NoAutorizadoView />} />
      </Route>

      <Route path="*" element={<NoEncontradoView />} />
    </Routes>
  );
}

export default App;
