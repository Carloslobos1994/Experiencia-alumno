import { describe, expect, it } from 'vitest';
import { mensajeError } from './errores';

describe('utils/errores - mensajes del backend', () => {
  it('sin respuesta del servidor indica problema de conexión', () => {
    expect(mensajeError(new Error('Network Error'))).toMatch(/no se pudo conectar/i);
  });

  it('usa el mensaje del GlobalExceptionHandler', () => {
    const error = { response: { status: 403, data: { mensaje: 'No tiene permisos para realizar esta acción' } } };
    expect(mensajeError(error)).toBe('No tiene permisos para realizar esta acción');
  });

  it('une los errores de validación por campo', () => {
    const error = { response: { status: 400, data: { mensaje: 'Datos inválidos', detalles: { email: 'Correo inválido', password: 'Obligatoria' } } } };
    expect(mensajeError(error)).toBe('Correo inválido. Obligatoria');
  });

  it('usa el texto por defecto si no hay mensaje', () => {
    expect(mensajeError({ response: { status: 500, data: {} } }, 'Falló')).toBe('Falló');
  });
});
