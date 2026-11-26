// src/utils/formato.js
// Formatos chilenos para montos, fechas y notas.

export function formatearPesos(valor) {
  const numero = Number(valor ?? 0);
  return '$' + numero.toLocaleString('es-CL');
}

/** "2026-11-26" -> "26-11-2026" (sin pasar por Date para evitar desfases de zona horaria). */
export function formatearFecha(fechaIso) {
  if (!fechaIso) {
    return '—';
  }
  const [anio, mes, dia] = fechaIso.slice(0, 10).split('-');
  return `${dia}-${mes}-${anio}`;
}

/** "2026-11-24T12:47:37.5" -> "24-11-2026 12:47" */
export function formatearFechaHora(fechaHoraIso) {
  if (!fechaHoraIso) {
    return '—';
  }
  return `${formatearFecha(fechaHoraIso)} ${fechaHoraIso.slice(11, 16)}`;
}

export function formatearNota(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return '—';
  }
  return Number(valor).toFixed(1);
}

/** En Chile la nota aprobatoria es 4.0: azul si aprueba, rojo si reprueba. */
export function claseNota(valor) {
  if (valor === null || valor === undefined) {
    return 'text-muted';
  }
  return Number(valor) >= 4 ? 'text-primary fw-bold' : 'text-danger fw-bold';
}

/** Dias que faltan desde hoy hasta la fecha (negativo si ya paso). */
export function diasRestantes(fechaIso, hoy = new Date()) {
  const [anio, mes, dia] = fechaIso.slice(0, 10).split('-').map(Number);
  const objetivo = Date.UTC(anio, mes - 1, dia);
  const base = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.round((objetivo - base) / 86400000);
}

export function iniciales(nombre) {
  if (!nombre) {
    return '?';
  }
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('');
}
