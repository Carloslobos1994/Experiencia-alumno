// src/test/setup.js
// Configuracion comun de todas las pruebas.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Despues de cada prueba: desmontar los componentes y limpiar la sesion guardada,
// para que ninguna prueba vea lo que dejo la anterior.
afterEach(() => {
  cleanup();
  sessionStorage.clear();
});
