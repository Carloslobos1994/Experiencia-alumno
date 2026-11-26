// TEMPLATE: estructura comun de todas las paginas privadas (navbar + contenido + footer).
import { Outlet } from 'react-router-dom';
import NavbarPrincipal from '../organisms/NavbarPrincipal';
import Footer from '../organisms/Footer';

function PlantillaPrincipal() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavbarPrincipal />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PlantillaPrincipal;
