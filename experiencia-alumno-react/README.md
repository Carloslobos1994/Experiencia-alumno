# Experiencia Alumno — Frontend React

Portal **Experiencia Alumno** (DSY1104 Desarrollo Fullstack II, Evaluación Parcial 3), integrado con la API REST Spring Boot `experiencia-alumno-api` mediante **Axios** y autenticación **JWT**.

Portal del estudiante con diseño institucional (tarjeta ejecutiva, colores Duoc UC, React-Bootstrap). Las vistas de Alumno (Inicio, Cursos, Mensualidades, Encuestas, Proyectos), Profesor y Administración consumen datos reales del backend Spring Boot mediante API REST.

## Tecnologías

React 19 · Vite 8 · React-Bootstrap 2 / Bootstrap 5 · React Router 7 · Axios · Vitest 5 + Testing Library + jsdom · @vitest/coverage-v8

## Instalación y ejecución

```bash
npm install
npm run dev          # http://localhost:5173  (requiere el backend en http://localhost:8080)
```

| Script | Uso |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila a `dist/` para producción (Nginx en AWS EC2) |
| `npm test` | Pruebas en modo observación |
| `npm run test:run` | Pruebas una sola vez |
| `npm run coverage` | Pruebas + **métricas de cobertura** (`coverage/index.html`) |

Variables de entorno:

| Archivo | `VITE_API_URL` | Uso |
|---|---|---|
| `.env.development` | `http://localhost:8080/api/v1` | Backend local en IntelliJ |
| `.env.production` | `/api/v1` | En EC2, Nginx redirige `/api` al backend (misma IP, sin CORS) |

Cuentas de demostración (contraseña `Duoc2026!`): `carlos.lobos@duocuc.cl` (alumno), `mari.huertas@profesorduocuc.cl` (profesor), `mariafinanzas@adminduocuc.cl` (Administración / Finanzas).

## Diseño Atómico (Atomic Design)

Los componentes reutilizables se clasifican en `src/components/` según su nivel:

| Nivel | Componente | Responsabilidad |
|---|---|---|
| **Átomos** (`atoms/`) | `Cargando` | Spinner de carga |
| | `AlertaMensaje` | Alerta de error o éxito |
| | `BadgeEstado` | Etiqueta de estado (Pendiente, Pagada, Abierta…) |
| | `BadgeRol` | Etiqueta del rol (Alumno, Profesor, Administración) |
| | `Avatar` | Foto de perfil circular (desde `fotoUrl` de la API); si no hay foto, muestra las iniciales |
| **Moléculas** (`molecules/`) | `EncabezadoPagina` | Título + subtítulo + botones de acción |
| | `TarjetaDato` | Indicador numérico (título, valor, detalle) |
| | `EscalaLikert` | Pregunta de encuesta con escala 1–5 |
| | `TarjetaEvaluacion` | Carta de una próxima evaluación: ramo, descripción, fecha, días restantes, sala, ponderación y docente |
| | `TarjetaProyecto` | Tarjeta de un proyecto del portafolio; al hacer clic abre su detalle |
| | `SelectorContacto` | Elegir destinatario por sección (Profesores / Alumnos / Administración) con buscador |
| **Organismos** (`organisms/`) | `NavbarPrincipal` | Menú que cambia según el rol + contador de mensajes |
| | `Footer` | Pie de página institucional |
| | `TablaCuotas` | Tabla del carrito de mensualidades (selección y estado) |
| | `ModalMensaje` | Redactar o responder un mensaje interno |
| | `DirectorioContactos` | Directorio desplegable (acordeón) de contactos con buscador y botón Mensaje |
| | `FormularioEncuesta` | Encuesta docente completa (4 preguntas + comentario) |
| | `ResultadosEncuesta` | Promedios y comentarios anónimos |
| **Templates** (`templates/`) | `PlantillaPrincipal` | Estructura de las páginas privadas: Navbar + contenido + Footer |
| **Páginas** (`views/`) | `LoginView`, `alumno/*`, `profesor/*`, `admin/*`, `MensajesView` | Templates con datos reales de la API |

## Arquitectura del frontend

```
src/
├── api/            axiosClient.js (instancia + interceptores JWT) · servicios.js (una función por endpoint)
├── context/        AuthContext.js · AuthProvider.jsx (estado global de sesión)
├── hooks/          useAuth.js · useDatos.js (carga de datos con estado cargando/error)
├── routes/         RutaProtegida.jsx · RedireccionInicio.jsx
├── components/     atoms · molecules · organisms · templates
├── views/          LoginView · MensajesView · alumno/ · profesor/ · admin/
└── utils/          sesion.js · permisos.js · validaciones.js · formato.js · errores.js
```

**Flujo de datos:** componente → `servicios.js` → `axiosClient` (agrega `Authorization: Bearer <token>`) → API `/api/v1` → Controller → Service → Repository → PostgreSQL → JSON → estado de React → interfaz.

## Gestión de sesión (IE3.3.2)

1. **Login:** `POST /auth/login` devuelve `accessToken` (15 min), `refreshToken` (7 días) y los datos del usuario. Se guardan en `sessionStorage`.
2. **Recarga de página (F5):** `AuthProvider` restaura la sesión guardada, verifica que el `refreshToken` no haya expirado y la confirma con `GET /auth/me`. Mientras tanto muestra "Verificando sesión…".
3. **Token expirado:** el interceptor de Axios recibe el 401, pide tokens nuevos con `POST /auth/refresh` y **reintenta la petición original** sin que el usuario lo note. Si el refresh falla, se cierra la sesión.
4. **Cerrar sesión:** borra la sesión del navegador.
5. **¿Por qué `sessionStorage`?** Sobrevive a F5, pero se borra al cerrar la pestaña (más seguro en computadores compartidos). Los tokens van firmados por el backend: si se modifican, el backend los rechaza.

## Restricciones de acceso (IE3.3.3)

| Rol | Rutas | Ejemplos de interfaces restringidas |
|---|---|---|
| ALUMNO | `/alumno`, `/alumno/cursos`, `/alumno/mensualidades`, `/alumno/encuestas`, `/alumno/proyectos`, `/alumno/proyectos/:id` | Carrito de pago, responder encuesta |
| PROFESOR | `/profesor/cursos`, `/profesor/encuestas` | Crear evaluaciones, subir notas, ver resultados de su encuesta |
| ADMIN | `/admin/usuarios`, `/admin/cursos`, `/admin/finanzas`, `/admin/encuestas` | CRUD de usuarios, carga de mensualidades, crear encuestas |
| Todos | `/mensajes` | Mensajería interna (los alumnos también se escriben entre compañeros de curso) |

- `RutaProtegida` redirige a `/login` sin sesión y a `/no-autorizado` si el rol no corresponde (por ejemplo, un alumno que escribe `/admin/finanzas` en la barra de direcciones).
- `NavbarPrincipal` muestra solo las opciones del rol.
- La seguridad definitiva está en el backend: aunque alguien manipule el frontend, la API responde **403**.

## Pruebas y cobertura

```bash
npm run coverage
```

**Resultado: 29 archivos · 144 pruebas · 0 fallos.** Reporte HTML en `coverage/index.html`.

| Métrica (v8) | Cobertura |
|---|---|
| Sentencias (% Stmts) | **85,9 %** |
| Ramas (% Branch) | **86,5 %** |
| Funciones (% Funcs) | **75,7 %** |
| Líneas (% Lines) | **85,4 %** |

Cobertura de líneas por capa de Atomic Design y lógica:

| Capa | % Líneas |
|---|---|
| `utils/`, `routes/`, `context/`, `hooks/` | 100 % |
| `components/atoms`, `components/molecules` | 100 % |
| `components/organisms` | 97,4 % |
| `views/` (alumno, profesor, admin, comunes) | 88–94 % |

Umbrales obligatorios en `vite.config.js`: `src/utils` y `src/routes` con 90 % de sentencias, funciones y líneas y 75 % de ramas (si no se cumplen, `npm run coverage` falla).

| Archivo de prueba | Qué valida |
|---|---|
| `utils/sesion.test.js` | Guardar, leer y limpiar la sesión; lectura y expiración del JWT |
| `utils/permisos.test.js` | Menú y página de inicio por rol, `tieneRol` |
| `utils/validaciones.test.js` | Correos institucionales, contraseña, nota 1.0–7.0 |
| `utils/formato.test.js` | Pesos chilenos, fechas, notas, días restantes |
| `utils/errores.test.js` | Mensajes del `GlobalExceptionHandler` |
| `utils/contactos.test.js` | Agrupar contactos por rol y buscar sin importar tildes |
| `api/axiosClient.test.js` | Interceptor que agrega el token, rutas públicas |
| `context/AuthProvider.test.jsx` | Login, logout, restaurar sesión con F5, token rechazado, refresh vencido, evento `sesion-expirada` |
| `routes/RutaProtegida.test.jsx` | Redirección sin sesión, rol no autorizado, acceso permitido |
| `components/atoms/Avatar.test.jsx` | Foto de perfil, iniciales y respaldo si la imagen no carga |
| `components/molecules/EscalaLikert.test.jsx` | Escala 1–5 y resultados de encuesta |
| `components/molecules/SelectorContacto.test.jsx` | Secciones Profesores/Alumnos/Administración, búsqueda y selección |
| `components/molecules/TarjetaEvaluacion.test.jsx` | Carta de evaluación y urgencia (Hoy, Mañana, En N días) |
| `components/organisms/NavbarPrincipal.test.jsx` | Menú según rol y cierre de sesión |
| `components/organisms/ModalMensaje.test.jsx` | Envío habilitado solo con datos completos, responder con `RE:`, error 403 |
| `views/LoginView.test.jsx` | Validación de dominio, login exitoso y error 401 |
| `views/MensajesView.test.jsx` | Bandeja, marcar como leído, responder, enviados |
| `views/PaginasError.test.jsx` | Páginas 403 y 404 |
| `views/alumno/HomeView.test.jsx` | Perfil, cartas de evaluaciones, **privacidad (no muestra deuda)**, mensaje al profesor |
| `views/alumno/CursosView.test.jsx` | Notas por asignatura, promedio y color aprobado/reprobado |
| `views/alumno/MensualidadesView.test.jsx` | Carrito: carga desde API, suma del total, pago y error 400 |
| `views/alumno/EncuestasView.test.jsx` | Encuesta: 4 preguntas obligatorias, envío y error 409 |
| `views/alumno/ProyectoDetalleView.test.jsx` | Proyectos completados y detalle con profesor evaluador |
| `views/profesor/ProfesorCursosView.test.jsx` | CRUD de evaluaciones, rechazo sobre 100 %, notas 1.0–7.0 |
| `views/profesor/ProfesorEncuestasView.test.jsx` | Resultados anónimos de la encuesta docente |
| `views/admin/AdminUsuariosView.test.jsx` | CRUD de usuarios, filtro por rol, correo duplicado (409) |
| `views/admin/AdminCursosView.test.jsx` | CRUD de cursos e inscripción de alumnos |
| `views/admin/AdminFinanzasView.test.jsx` | Recaudación, carga masiva, cuota individual, filtro y eliminación |
| `views/admin/AdminEncuestasView.test.jsx` | Crear, cerrar, eliminar y ver resultados de encuestas |

Los componentes se prueban de forma aislada con **mocks** (`vi.mock`) de la capa `api/servicios.js` y de `useAuth`; `src/test/setup.js` limpia el DOM y la sesión después de cada prueba (`cleanup` + `sessionStorage.clear()`) para que sean independientes.

## Despliegue en AWS EC2

```bash
npm run build
# Copiar dist/ a la EC2 y publicarlo con Nginx (ver deploy/ en el repositorio del backend)
sudo cp -r dist/* /var/www/experiencia-alumno/
```

## Privacidad

El monto adeudado de mensualidades **no se muestra en el Inicio**: solo aparece en la sección *Mensualidades*, a la que el alumno entra si lo desea.

## Fotos de perfil

Los avatares están en `public/avatars/` (Carlos, Marcelo, Angelo, Emilio y los profesores Mario y Dusty). La ruta de cada foto se guarda en el campo `fotoUrl` del usuario en la base de datos; Administración puede cambiarla desde *Usuarios*.
