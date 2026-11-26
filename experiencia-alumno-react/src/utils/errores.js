// src/utils/errores.js
// Convierte el error de Axios en un mensaje legible.
// El backend siempre responde con { status, error, mensaje, detalles } (GlobalExceptionHandler).

export function mensajeError(error, porDefecto = 'Ocurrió un error inesperado') {
  if (!error?.response) {
    return 'No se pudo conectar con el servidor. Verifique que el backend esté activo.';
  }
  const datos = error.response.data;
  if (datos?.detalles && Object.keys(datos.detalles).length > 0) {
    return Object.values(datos.detalles).join('. ');
  }
  return datos?.mensaje ?? porDefecto;
}
