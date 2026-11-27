# Experiencia Alumno · Duoc UC

Aplicación full stack del portal del estudiante (DSY1104 Desarrollo Fullstack II).

| Carpeta | Contenido |
|---|---|
| [`experiencia-alumno-api/`](experiencia-alumno-api/) | Backend Spring Boot: API REST `/api/v1`, JWT con roles, PostgreSQL en AWS EC2, Swagger |
| [`experiencia-alumno-react/`](experiencia-alumno-react/) | Frontend React + Vite: Atomic Design, Axios, sesión con JWT, rutas protegidas por rol |

## Roles
- **Alumno:** perfil, cursos y notas, carrito de mensualidades, encuesta docente, portafolio y mensajes.
- **Profesor:** evaluaciones y notas de sus cursos, resultados anónimos de la encuesta, mensajes.
- **Administración (Finanzas):** usuarios, cursos e inscripciones, mensualidades y boletas, encuestas, mensajes.

## Pruebas
| Proyecto | Pruebas | Cobertura de líneas |
|---|---|---|
| Backend (JUnit 5 + Mockito + MockMvc, JaCoCo) | 75 | 93 % |
| Frontend (Vitest + Testing Library, v8) | 144 | 85,4 % |

## Equipo
| Integrante | Carrera | Aporte |
|---|---|---|
| Carlos Lobos | Analista Programador | Arquitectura, modelo de datos, seguridad JWT, documentación y despliegue |
| Angelo Olivares | Ingeniería en Informática | Lógica de negocio del backend: módulo académico, mensajería, encuesta y pruebas de integración |
| Marcelo Pincheira | Ingeniería en Informática | Frontend base (Axios, sesión, rutas protegidas) y vistas del alumno |
| Emilio Núñez | Ingeniería en Informática | Backend de finanzas y vistas de profesor y administración |

Las instrucciones para ejecutar cada proyecto están en su propio README.
