
export const perfilEstudiante = {
  nombre: "Carlos Iván Lobos Escobar",
  rut: "11.111.111-1",
  carrera: "Analista Programador",
  institucion: "Duoc UC",
  sede: "Plaza Oeste",
  semestreActual: 4,
  promedioPonderado: 5.8,
  estadoMatricula: "Regular",
  fotoPerfil: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
};


export const proyectosPortafolio = [
  {
    id: "proj-01",
    titulo: "TacticalDEV MVP",
    asignatura: "DSY1105 - Desarrollo Móvil",
    tecnologias: ["Kotlin", "Android Studio", "MVVM", "Room", "Coroutines"],
    descripcion: "Aplicación móvil nativa diseñada para la gestión táctica de equipos y tareas en tiempo real.",
    destacado: true,
    githubUrl: "https://github.com",
    demoUrl: "#",
    imagen: "https://via.placeholder.com/400x200?text=TacticalDEV+MVP",
    estado: "En Progreso"
  },
  {
    id: "proj-02",
    titulo: "Gestor de Base de Datos Académica",
    asignatura: "BDY1103 - Taller de Base de Datos",
    tecnologias: ["Oracle SQL", "PL/SQL", "Triggers", "Procedimientos Almacenados"],
    descripcion: "Arquitectura de base de datos relacional orientada a la gestión masiva de matrículas y notas.",
    destacado: true,
    githubUrl: "https://github.com",
    demoUrl: "#",
    imagen: "https://via.placeholder.com/400x200?text=Base+de+Datos",
    estado: "En Proceso"
  },
  {
    id: "proj-03",
    titulo: "Portal Experiencia Alumno React",
    asignatura: "DSY1104 - Desarrollo Fullstack II",
    tecnologias: ["React", "Vite", "Bootstrap"],
    descripcion: "Rediseño moderno e interactivo estilo portal de servicios para el estudiante Duoc.",
    destacado: true,
    githubUrl: "https://github.com",
    demoUrl: "#",
    imagen: "https://via.placeholder.com/400x200?text=Experiencia+Alumno",
    estado: "Completado"
  }
];


export const estudiantesDisponibles = [
  { 
    rut: "22.222.222-2", 
    nombre: "Marcelo Pincheira", 
    correo: "marcelo@duocuc.cl",
    carrera: "Analista Programador", 
    especialidad: "Frontend / React" 
  },
  { 
    rut: "33.333.333-3", 
    nombre: "Angelo Olivares",
    correo: "angelo@duocuc.cl", 
    carrera: "Analista Programador", 
    especialidad: "Backend / SQL" 
  },
  { 
    rut: "44.444.444-4", 
    nombre: "Emilio Núñez", 
    correo: "emilio@duocuc.cl",
    carrera: "Analista Programador", 
    especialidad: "Mobile / Kotlin" 
  }
];


export const proximasEvaluaciones = [
  {
    id: "eval-01",
    ramo: "BDY1103 - Taller de Base de Datos",
    tipo: "Entrega por Encargo",
    fecha: "2026-10-25",
    sala: "Laboratorio 203",
    docente: "Cristian Eduardo Espinoza Silva"
  },
  {
    id: "eval-02",
    ramo: "DSY1104 - Desarrollo Fullstack II",
    tipo: "Entrega y Presentación de Proyecto",
    fecha: "2026-10-24",
    sala: "Laboratorio Principal Sala 319",
    docente: "Mario Adrian Huerta Silva"
  },
  {
    id: "eval-03",
    ramo: "INU5100 - Inglés Intermedio I",
    tipo: "Examen Escrito",
    fecha: "2026-11-10",
    sala: "Sala de Clases 311",
    docente: "Nicolas Felipe Cortes Perez"
  }
];


export const cursosInscritos = [
  {
    id: "curso-01",
    codigo: "INU5100",
    seccion: "002V",
    nombre: "Inglés Intermedio I",
    docente: "Nicolas Felipe Cortes Perez",
    notas: [
      { nombre: "Examen Oral 1", nota: 4.0, porcentaje: "30%" },
      { nombre: "Examen Escrito 1 (Proximo)", nota: 1.0, porcentaje: "35%" },
      { nombre: "Examen Oral 2", nota: 4.5, porcentaje: "35%" }
    ]
  },
  {
    id: "curso-02",
    codigo: "DSY1105",
    seccion: "002V",
    nombre: "Desarrollo de Aplicaciones Moviles",
    docente: "Dusty Cesar Tessini Panes",
    notas: [
      { nombre: "Evaluacion Formativa MVP", nota: 6.7, porcentaje: "30%" },
      { nombre: "Solemne 1 - Architecture MVVM", nota: 6.7, porcentaje: "35%" },
      { nombre: "Avance Proyecto Kotlin", nota: 6.8, porcentaje: "35%" }
    ]
  },
  {
    id: "curso-03",
    codigo: "DSY1104",
    seccion: "001V",
    nombre: "Desarrollo Fullstack II",
    docente: "Mario Adrian Huerta Silva",
    notas: [
      { nombre: "Evaluacion 1 - Frontend React", nota: 6.5, porcentaje: "30%" },
      { nombre: "Evaluacion 2 - Backend API", nota: 6.2, porcentaje: "35%" },
      { nombre: "Proyecto Integrado Fullstack", nota: 6.8, porcentaje: "35%" }
    ]
  },
  {
    id: "curso-04",
    codigo: "BDY1103",
    seccion: "002V",
    nombre: "Taller de Base de Datos",
    docente: "Cristian Eduardo Espinoza Silva",
    notas: [
      { nombre: "Caso PL/SQL Procedimientos", nota: 5.5, porcentaje: "40%" },
      { nombre: "Prueba Parcial Triggers", nota: 5.0, porcentaje: "60%" }
    ]
  },
  {
    id: "curso-05",
    codigo: "MAT4141",
    seccion: "001V",
    nombre: "Estadistica Descriptiva",
    docente: "Juan Octavio Elgueda Flores",
    notas: [
      { nombre: "Control 1 - Python & NumPy", nota: 5.8, porcentaje: "40%" },
      { nombre: "Solemne Medidas de Tendencia", nota: 5.5, porcentaje: "60%" }
    ]
  },
  {
    id: "curso-06",
    codigo: "EAY4730",
    seccion: "001V",
    nombre: "Etica para el Trabajo",
    docente: "Javier Felipe Cares Jimenez",
    notas: [
      { nombre: "Analisis de Casos Eticos", nota: 6.0, porcentaje: "50%" },
      { nombre: "Debate Profesional", nota: 6.2, porcentaje: "50%" }
    ]
  },
  {
    id: "curso-07",
    codigo: "CCG0022",
    seccion: "007D",
    nombre: "Autoestima Academica para tu Aprendizaje",
    docente: "Marco Antonio Perelli Henriquez",
    notas: [
      { nombre: "Autoevaluacion Inicial", nota: 6.5, porcentaje: "50%" },
      { nombre: "Taller de Liderazgo", nota: 6.8, porcentaje: "50%" }
    ]
  }
];


export const cuotasEcommerce = [
  {
    id: "cuota-01",
    concepto: "Mensualidad Agosto 2026",
    vencimiento: "2026-08-25",
    monto: 319000,
    estado: "Pagado",
    periodo: "2026-2"
  },
  {
    id: "cuota-02",
    concepto: "Mensualidad Septiembre 2026",
    vencimiento: "2026-09-25",
    monto: 319000,
    estado: "Pagado",
    periodo: "2026-2"
  },
  {
    id: "cuota-03",
    concepto: "Mensualidad Octubre 2026",
    vencimiento: "2026-10-25",
    monto: 319000,
    estado: "Pagado",
    periodo: "2026-2"
  },
  {
    id: "cuota-04",
    concepto: "Mensualidad Noviembre 2026",
    vencimiento: "2026-11-25",
    monto: 319000,
    estado: "Pendiente",
    periodo: "2026-2"
  },
  {
    id: "cuota-05",
    concepto: "Mensualidad Diciembre 2026",
    vencimiento: "2026-12-25",
    monto: 319000,
    estado: "Pendiente",
    periodo: "2026-2"
  }
];


export const proyectosIniciales = proyectosPortafolio;
export const cursosIniciales = cursosInscritos;
export const mensualidadesIniciales = cuotasEcommerce;
export const informacionAlumno = perfilEstudiante;


export const obtenerProyectos = () => proyectosPortafolio;

export const agregarProyecto = (listaActual, nuevoProyecto) => {
  const nuevo = { ...nuevoProyecto, id: `proj-${Date.now()}` };
  return [...listaActual, nuevo];
};

export const eliminarProyecto = (listaActual, id) => {
  return listaActual.filter((item) => item.id !== id);
};