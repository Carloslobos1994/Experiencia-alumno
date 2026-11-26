// src/App.jsx
// Rutas de la aplicacion. Cada grupo de rutas esta protegido por rol (IE3.3.3).
// Base: login, redireccion segun rol y paginas de error. Las vistas de cada rol se agregan en las siguientes etapas.
import { Route, Routes } from 'react-router-dom';
import RutaProtegida from './routes/RutaProtegida';
import RedireccionInicio from './routes/RedireccionInicio';
import PlantillaPrincipal from './components/templates/PlantillaPrincipal';
import LoginView from './views/LoginView';
import NoAutorizadoView from './views/NoAutorizadoView';
import NoEncontradoView from './views/NoEncontradoView';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route path="/" element={<RedireccionInicio />} />

      {/* Todo lo que esta aqui dentro exige sesion iniciada */}
      <Route element={<RutaProtegida><PlantillaPrincipal /></RutaProtegida>}>
        <Route path="/no-autorizado" element={<NoAutorizadoView />} />
      </Route>

      <Route path="*" element={<NoEncontradoView />} />
    </Routes>
  );
}

export default App;
