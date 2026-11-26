// src/data/datosAlumnos.js
// Portafolio de proyectos realizados (contenido estatico).
// En la Evaluacion 3 los datos academicos (perfil, cursos, notas, evaluaciones y cuotas)
// se obtienen desde la API; aqui solo queda el portafolio de proyectos ya terminados.

export const proyectosPortafolio = [
  {
    id: 'proj-01',
    titulo: 'TacticalDEV MVP',
    asignatura: 'DSY1105 - Desarrollo de Aplicaciones Móviles',
    profesorEvaluador: 'Dusty César Tessini Panes',
    tecnologias: ['Kotlin', 'Android Studio', 'MVVM', 'Room', 'Coroutines'],
    descripcion: 'Aplicación móvil nativa diseñada para la gestión táctica de equipos y tareas en tiempo real.',
    detalle:
      'Aplicación Android nativa desarrollada en Kotlin que permite organizar equipos de trabajo, asignar tareas ' +
      'y seguir su avance. Se construyó con la arquitectura MVVM para separar la interfaz de la lógica, y guarda ' +
      'la información localmente con Room.',
    funcionalidades: [
      'Gestión de equipos y asignación de tareas',
      'Seguimiento del estado de cada tarea',
      'Persistencia local con Room y operaciones asíncronas con Coroutines',
      'Arquitectura MVVM (ViewModel + repositorio)',
    ],
    estado: 'Completado',
  },
  {
    id: 'proj-02',
    titulo: 'Gestor de Base de Datos Académica',
    asignatura: 'BDY1103 - Taller de Base de Datos',
    profesorEvaluador: 'Cristian Eduardo Espinoza Silva',
    tecnologias: ['Oracle SQL', 'PL/SQL', 'Triggers', 'Procedimientos Almacenados'],
    descripcion: 'Arquitectura de base de datos relacional orientada a la gestión masiva de matrículas y notas.',
    detalle:
      'Diseño e implementación de una base de datos relacional en Oracle para administrar matrículas, ' +
      'asignaturas y calificaciones. La lógica de negocio se implementó en PL/SQL con procedimientos ' +
      'almacenados y triggers que validan la integridad de los datos.',
    funcionalidades: [
      'Modelo relacional normalizado (alumnos, asignaturas, matrículas y notas)',
      'Procedimientos almacenados para cargas masivas',
      'Triggers de validación y auditoría',
      'Consultas de reportes académicos',
    ],
    estado: 'Completado',
  },
  {
    id: 'proj-03',
    titulo: 'Portal Experiencia Alumno React',
    asignatura: 'DSY1104 - Desarrollo Fullstack II',
    profesorEvaluador: 'Mario Adrián Huerta Silva',
    tecnologias: ['React', 'Vite', 'Bootstrap', 'Vitest'],
    descripcion: 'Rediseño moderno e interactivo estilo portal de servicios para el estudiante Duoc.',
    detalle:
      'Portal web en React y Vite que reúne los servicios del estudiante: perfil, cursos, mensualidades y ' +
      'proyectos. Se desarrolló en la Evaluación Parcial 2 con componentes React-Bootstrap y pruebas ' +
      'unitarias, y es la base que en la Evaluación Parcial 3 se integró con el backend en AWS.',
    funcionalidades: [
      'Componentes reutilizables con React-Bootstrap',
      'Navegación entre vistas y gestión de estado',
      'Carrito de pago de mensualidades',
      'Pruebas unitarias con Vitest y Testing Library',
    ],
    estado: 'Completado',
  },
];

export function buscarProyecto(id) {
  return proyectosPortafolio.find((proyecto) => proyecto.id === id) ?? null;
}
