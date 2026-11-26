// src/hooks/useDatos.js
// Hook reutilizable para cargar datos de la API: { datos, cargando, error, recargar }.
import { useCallback, useEffect, useState } from 'react';
import { mensajeError } from '../utils/errores';

export function useDatos(cargar, dependencias = []) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let activo = true;
    cargar()
      .then((resultado) => {
        if (activo) {
          setDatos(resultado);
          setError(null);
        }
      })
      .catch((e) => {
        if (activo) {
          setError(mensajeError(e));
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false);
        }
      });
    return () => {
      activo = false;
    };
    // `cargar` se recrea en cada render; se recarga solo cuando cambian las dependencias o se llama a recargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, ...dependencias]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  return { datos, cargando, error, recargar };
}
