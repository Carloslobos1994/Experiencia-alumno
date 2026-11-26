// src/api/servicios.js
// Capa de servicios: una funcion por endpoint del backend (/api/v1).
// Los componentes NO llaman a Axios directamente: usan estas funciones.
import api from './axiosClient';

const datos = (promesa) => promesa.then((respuesta) => respuesta.data);

// ---------- Autenticacion ----------
export const authService = {
  login: (email, password) => datos(api.post('/auth/login', { email, password })),
  me: () => datos(api.get('/auth/me')),
};

// ---------- Usuarios (ADMIN) ----------
export const usuariosService = {
  listar: (rol) => datos(api.get('/usuarios', { params: rol ? { rol } : {} })),
  crear: (usuario) => datos(api.post('/usuarios', usuario)),
  actualizar: (id, usuario) => datos(api.put(`/usuarios/${id}`, usuario)),
  desactivar: (id) => api.delete(`/usuarios/${id}`),
};

// ---------- Cursos, evaluaciones y notas ----------
export const academicoService = {
  cursos: () => datos(api.get('/cursos')),
  crearCurso: (curso) => datos(api.post('/cursos', curso)),
  actualizarCurso: (id, curso) => datos(api.put(`/cursos/${id}`, curso)),
  eliminarCurso: (id) => api.delete(`/cursos/${id}`),
  alumnosCurso: (cursoId) => datos(api.get(`/cursos/${cursoId}/alumnos`)),
  inscribir: (cursoId, alumnoId) => datos(api.post(`/cursos/${cursoId}/inscripciones`, { alumnoId })),
  desinscribir: (cursoId, alumnoId) => api.delete(`/cursos/${cursoId}/inscripciones/${alumnoId}`),

  proximasEvaluaciones: () => datos(api.get('/evaluaciones/proximas')),
  evaluacionesCurso: (cursoId) => datos(api.get(`/evaluaciones/curso/${cursoId}`)),
  crearEvaluacion: (evaluacion) => datos(api.post('/evaluaciones', evaluacion)),
  actualizarEvaluacion: (id, evaluacion) => datos(api.put(`/evaluaciones/${id}`, evaluacion)),
  eliminarEvaluacion: (id) => api.delete(`/evaluaciones/${id}`),

  misNotas: () => datos(api.get('/notas/mis-notas')),
  notasEvaluacion: (evaluacionId) => datos(api.get(`/notas/evaluacion/${evaluacionId}`)),
  registrarNota: (nota) => datos(api.put('/notas', nota)),
};

// ---------- Finanzas: categorias, cuotas y boletas ----------
export const finanzasService = {
  categorias: () => datos(api.get('/categorias')),
  misCuotas: () => datos(api.get('/cuotas/mis-cuotas')),
  cuotas: (alumnoId) => datos(api.get('/cuotas', { params: alumnoId ? { alumnoId } : {} })),
  crearCuota: (cuota) => datos(api.post('/cuotas', cuota)),
  crearLote: (lote) => datos(api.post('/cuotas/lote', lote)),
  eliminarCuota: (id) => api.delete(`/cuotas/${id}`),
  pagar: (cuotaIds, medioPago) => datos(api.post('/boletas/pagar', { cuotaIds, medioPago })),
  misBoletas: () => datos(api.get('/boletas/mis-boletas')),
  boletas: () => datos(api.get('/boletas')),
};

// ---------- Mensajeria interna ----------
export const mensajesService = {
  recibidos: () => datos(api.get('/mensajes/recibidos')),
  enviados: () => datos(api.get('/mensajes/enviados')),
  noLeidos: () => datos(api.get('/mensajes/no-leidos')),
  contactos: () => datos(api.get('/mensajes/contactos')),
  enviar: (mensaje) => datos(api.post('/mensajes', mensaje)),
  marcarLeido: (id) => datos(api.patch(`/mensajes/${id}/leido`)),
};

// ---------- Encuesta docente ----------
export const encuestasService = {
  listar: () => datos(api.get('/encuestas')),
  pendientes: () => datos(api.get('/encuestas/pendientes')),
  crear: (encuesta) => datos(api.post('/encuestas', encuesta)),
  responder: (id, respuesta) => api.post(`/encuestas/${id}/respuestas`, respuesta),
  resultados: (id) => datos(api.get(`/encuestas/${id}/resultados`)),
  cerrar: (id) => datos(api.patch(`/encuestas/${id}/cerrar`)),
  eliminar: (id) => api.delete(`/encuestas/${id}`),
};
