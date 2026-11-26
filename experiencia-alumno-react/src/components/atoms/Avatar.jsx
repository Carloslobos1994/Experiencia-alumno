// ATOMO: avatar circular. Muestra la foto de perfil (fotoUrl) y, si no existe
// o no se puede cargar, muestra las iniciales del usuario.
import { useState } from 'react';
import { iniciales } from '../../utils/formato';

function Avatar({ nombre, fotoUrl, tamano = 95, borde = true }) {
  const [fotoRota, setFotoRota] = useState(false);
  const clasesBorde = borde ? 'border border-3 border-primary shadow' : '';

  if (fotoUrl && !fotoRota) {
    return (
      <img
        src={fotoUrl}
        alt={`Foto de ${nombre}`}
        width={tamano}
        height={tamano}
        className={`rounded-circle bg-white ${clasesBorde}`}
        style={{ objectFit: 'cover', flexShrink: 0 }}
        onError={() => setFotoRota(true)}
      />
    );
  }

  return (
    <div
      className={`rounded-circle d-inline-flex align-items-center justify-content-center bg-white text-primary fw-bold ${clasesBorde}`}
      style={{ width: tamano, height: tamano, fontSize: tamano / 2.8, flexShrink: 0 }}
      aria-label={`Avatar de ${nombre}`}
    >
      {iniciales(nombre)}
    </div>
  );
}

export default Avatar;
