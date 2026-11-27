# Experiencia Alumno API

Backend REST del portal **Experiencia Alumno** — DSY1104 Desarrollo Fullstack II, Evaluación Parcial 3 (Duoc UC, sede Plaza Oeste).

El portal conecta a los tres actores de la vida académica:

- **Administración (Finanzas)** carga las mensualidades, gestiona usuarios y cursos, y crea la encuesta docente.
- **Profesor** crea evaluaciones, sube notas y ve los resultados (anónimos) de su encuesta docente.
- **Alumno** ve sus cursos, notas y próximas evaluaciones; paga sus mensualidades desde el carrito; responde la encuesta docente.
- Todos se comunican por **mensajería interna**, incluidos los alumnos entre sí (compañeros de curso).

## Equipo

| Integrante | Rol en el proyecto |
|---|---|
| Carlos Lobos | Seguridad JWT, despliegue AWS, integración |
| Angelo Olivares | Modelo de datos, servicios y reglas de negocio |
| Marcelo Pincheira | Frontend React: sesión, rutas protegidas, vistas del alumno |
| Emilio Núñez | Frontend: vistas de profesor y administración, pruebas |

## Tecnologías

Java 17 · Spring Boot 4.1.2 · Spring Web MVC · Spring Data JPA (Hibernate 7) · Spring Security · JWT (jjwt 0.12) · Bean Validation · springdoc-openapi (Swagger UI) · PostgreSQL 15 (AWS EC2) · H2 (desarrollo local) · JUnit 5 + Mockito + MockMvc · JaCoCo

## Arquitectura en capas

```
Controller (REST, /api/v1)  →  Service (reglas de negocio)  →  Repository (Spring Data JPA)  →  Entity  →  PostgreSQL
        ↑ DTOs (records)                ↑ PermisosService (dueño del recurso)
JwtAuthFilter (token) → SecurityContext → @PreAuthorize (rol)
GlobalExceptionHandler → errores JSON uniformes (400, 401, 403, 404, 409, 500)
```

## Roles

| Rol | Equivalencia rúbrica | Acceso |
|---|---|---|
| `ADMIN` (Administración / Finanzas) | Administrador | Acceso total: usuarios, cursos, inscripciones, categorías, cuotas, boletas, encuestas |
| `PROFESOR` | Vendedor (acceso parcial) | Solo sus cursos: evaluaciones, notas, alumnos inscritos, resultados de su encuesta |
| `ALUMNO` | Cliente | Solo sus datos: cursos, notas, próximas evaluaciones, carrito de mensualidades, boletas, encuestas pendientes |

## Modelo de datos

Tablas del modelo propuesto en el Anexo 1, adaptadas al portal, más el dominio académico:

| Tabla | Descripción |
|---|---|
| `usuario` | Alumnos, profesores y Administración (contraseña con BCrypt, rol, activo) |
| `categoria` | Tipo de cobro: Mensualidad, Matrícula, Certificado |
| `cuota` | Cobro asignado a un alumno (equivale a PRODUCTO): monto, vencimiento, estado PENDIENTE/PAGADA |
| `boleta` | Comprobante generado al pagar el carrito |
| `detalle_boleta` | Cada cuota pagada en una boleta (una cuota solo puede pagarse una vez) |
| `curso` | Ramo y sección, con su profesor a cargo |
| `inscripcion` | Relación N:M alumno ↔ curso |
| `evaluacion` | Creada por el profesor: tipo, fecha, sala, porcentaje y descripción (incluye los exámenes transversales) |
| `nota` | Nota 1.0–7.0 de un alumno en una evaluación |
| `mensaje` | Mensajería interna, con hilo de respuestas (`respuesta_a_id`) |
| `encuesta` | Encuesta docente que Administración crea para un curso |
| `respuesta_encuesta` | Respuesta de un alumno (escala 1–5); única por alumno y encuesta |

```
USUARIO ──< BOLETA ──< DETALLE_BOLETA >── CUOTA >── CATEGORIA
USUARIO(alumno) ──< INSCRIPCION >── CURSO >── USUARIO(profesor)
CURSO ──< EVALUACION ──< NOTA >── USUARIO(alumno)
CURSO ──< ENCUESTA ──< RESPUESTA_ENCUESTA >── USUARIO(alumno)
USUARIO ──< MENSAJE >── USUARIO
```

## Reglas de negocio (validadas en el servidor)

1. **Pago del carrito:** solo cuotas propias y pendientes; el total lo calcula el backend; boleta + detalle + cambio de estado en una sola transacción.
2. **Notas:** solo el profesor del curso (o ADMIN) califica; el alumno debe estar inscrito; nota entre 1.0 y 7.0.
3. **Evaluaciones:** la suma de porcentajes de un curso no puede superar el 100 %. En los datos de demostración cada curso tiene 3 evaluaciones parciales (20 % c/u) y el Examen Transversal (40 %).
4. **Promedio ponderado:** suma(nota × %) / suma(% evaluados), redondeado a 1 decimal.
5. **Cuotas:** una cuota pagada no se modifica ni elimina; la carga masiva no duplica conceptos.
6. **Mensajes:** el alumno escribe a Administración, a sus profesores y a sus compañeros de curso; el profesor a Administración y a sus alumnos.
7. **Encuesta docente:** abierta hasta la fecha de cierre; una respuesta por alumno inscrito; el profesor solo ve promedios y comentarios, sin nombres.
8. **Usuarios:** correo y RUT únicos; eliminación lógica (desactivar) para conservar el historial.

## Seguridad (JWT)

1. `POST /api/v1/auth/login` valida el correo y la contraseña (BCrypt) y entrega un **accessToken** (15 min) y un **refreshToken** (7 días), firmados con HMAC-SHA256.
2. El frontend envía `Authorization: Bearer <accessToken>` en cada petición.
3. `JwtAuthFilter` verifica la firma, la expiración y el tipo de token, y registra al usuario con su rol (`ROLE_ADMIN`, `ROLE_PROFESOR`, `ROLE_ALUMNO`).
4. `@PreAuthorize` restringe cada endpoint por rol; `PermisosService` verifica que el usuario sea dueño del recurso (por ejemplo, el profesor de ese curso).
5. Cuando el accessToken expira, `POST /api/v1/auth/refresh` entrega tokens nuevos (**renovación**).
6. La API es *stateless*: no hay sesión en el servidor. La clave JWT y la contraseña de la base van en variables de entorno, nunca en el código.

## Endpoints (`/api/v1`)

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| POST | `/auth/login` | Público | Iniciar sesión |
| POST | `/auth/refresh` | Público | Renovar tokens |
| GET | `/auth/me` | Autenticado | Usuario actual |
| GET | `/usuarios?rol=` | ADMIN | Listar usuarios |
| GET | `/usuarios/{id}` | ADMIN | Obtener usuario |
| POST | `/usuarios` | ADMIN | Crear usuario |
| PUT | `/usuarios/{id}` | ADMIN | Actualizar usuario |
| DELETE | `/usuarios/{id}` | ADMIN | Desactivar usuario |
| GET | `/cursos` | Autenticado | Cursos según rol |
| GET | `/cursos/{id}` | ADMIN, profesor del curso, alumno inscrito | Obtener curso |
| POST | `/cursos` | ADMIN | Crear curso |
| PUT | `/cursos/{id}` | ADMIN | Actualizar curso |
| DELETE | `/cursos/{id}` | ADMIN | Eliminar curso |
| GET | `/cursos/{id}/alumnos` | ADMIN, profesor del curso | Alumnos inscritos |
| POST | `/cursos/{id}/inscripciones` | ADMIN | Inscribir alumno |
| DELETE | `/cursos/{id}/inscripciones/{alumnoId}` | ADMIN | Quitar alumno |
| GET | `/evaluaciones/proximas` | Autenticado | Próximas evaluaciones |
| GET | `/evaluaciones/curso/{cursoId}` | ADMIN, profesor, alumno inscrito | Evaluaciones de un curso |
| POST | `/evaluaciones` | ADMIN, PROFESOR del curso | Crear evaluación |
| PUT | `/evaluaciones/{id}` | ADMIN, PROFESOR del curso | Actualizar evaluación |
| DELETE | `/evaluaciones/{id}` | ADMIN, PROFESOR del curso | Eliminar evaluación |
| PUT | `/notas` | ADMIN, PROFESOR del curso | Registrar o actualizar nota |
| GET | `/notas/evaluacion/{id}` | ADMIN, PROFESOR del curso | Notas de una evaluación |
| GET | `/notas/mis-notas` | ALUMNO | Notas y promedio por curso |
| DELETE | `/notas/{id}` | ADMIN, PROFESOR del curso | Eliminar nota |
| GET | `/categorias` | Autenticado | Listar categorías |
| GET | `/categorias/{id}` | Autenticado | Obtener categoría |
| POST | `/categorias` | ADMIN | Crear categoría |
| PUT | `/categorias/{id}` | ADMIN | Actualizar categoría |
| DELETE | `/categorias/{id}` | ADMIN | Eliminar categoría |
| GET | `/cuotas?alumnoId=` | ADMIN | Listar cuotas |
| GET | `/cuotas/mis-cuotas` | ALUMNO | Mis cuotas (carrito) |
| POST | `/cuotas` | ADMIN | Asignar cuota |
| POST | `/cuotas/lote` | ADMIN | Mensualidad para todos los alumnos |
| PUT | `/cuotas/{id}` | ADMIN | Actualizar cuota pendiente |
| DELETE | `/cuotas/{id}` | ADMIN | Eliminar cuota pendiente |
| POST | `/boletas/pagar` | ALUMNO | Pagar cuotas del carrito |
| GET | `/boletas` | ADMIN | Todas las boletas |
| GET | `/boletas/mis-boletas` | ALUMNO | Mis boletas |
| GET | `/boletas/{id}` | ADMIN, ALUMNO dueño | Detalle de boleta |
| GET | `/mensajes/recibidos` | Autenticado | Bandeja de entrada |
| GET | `/mensajes/enviados` | Autenticado | Enviados |
| GET | `/mensajes/no-leidos` | Autenticado | Contador de no leídos |
| GET | `/mensajes/contactos` | Autenticado | A quién puedo escribir |
| GET | `/mensajes/{id}` | Remitente o destinatario | Ver mensaje |
| POST | `/mensajes` | Autenticado | Enviar o responder |
| PATCH | `/mensajes/{id}/leido` | Destinatario | Marcar como leído |
| GET | `/encuestas` | ADMIN, PROFESOR | Listar encuestas |
| GET | `/encuestas/pendientes` | ALUMNO | Encuestas por responder |
| POST | `/encuestas` | ADMIN | Crear encuesta docente |
| POST | `/encuestas/{id}/respuestas` | ALUMNO inscrito | Responder encuesta |
| GET | `/encuestas/{id}/resultados` | ADMIN, PROFESOR del curso | Resultados anónimos |
| PATCH | `/encuestas/{id}/cerrar` | ADMIN | Cerrar encuesta |
| DELETE | `/encuestas/{id}` | ADMIN | Eliminar encuesta |

Swagger: `http://localhost:8080/swagger-ui/index.html`. Ejecute el login, copie el `accessToken` y péguelo en **Authorize**.

## Usuarios de demostración

Se cargan automáticamente si la base está vacía. Contraseña de todos: **`Duoc2026!`**

| Rol | Correo |
|---|---|
| ADMIN | `mariafinanzas@adminduocuc.cl` |
| PROFESOR (Fullstack II) | `mari.huertas@profesorduocuc.cl` |
| PROFESOR (Aplicaciones Móviles) | `du.tessini@profesor.duocuc.cl` |
| ALUMNO | `carlos.lobos@duocuc.cl` |
| ALUMNO | `marcelo@duocuc.cl` |
| ALUMNO | `angelo@duocuc.cl` |
| ALUMNO | `emilio@duocuc.cl` |

## Ejecutar en local (perfil `dev`, base H2)

**IntelliJ IDEA:** abrir la carpeta del proyecto → esperar que Maven descargue las dependencias → ejecutar `ExperienciaAlumnoApiApplication`.

**Terminal:**

```bash
./mvnw spring-boot:run
```

> Si falta el Maven Wrapper (`mvnw`), cópielo desde otro proyecto Spring Boot (`mvnw`, `mvnw.cmd` y la carpeta `.mvn/`) o ejecute con el Maven de IntelliJ.

## Pruebas y cobertura

```bash
./mvnw clean test
open target/site/jacoco/index.html
```

**Resultado: 75 pruebas · 0 fallos · BUILD SUCCESS.**

| Métrica (JaCoCo) | Cobertura |
|---|---|
| Instrucciones | **91 %** |
| Ramas | **76 %** |
| Líneas | **93 %** (1.143 de 1.229) |

| Paquete | % Líneas |
|---|---|
| `controller` | 98 % |
| `security` | 98 % |
| `dto` | 100 % |
| `config` | 95 % |
| `service` | 94 % |
| `exception` | 88 % |
| `model` | 87 % |

| Clase de prueba | Tipo | Qué valida |
|---|---|---|
| `JwtServiceTest` | Unitaria | Generar y leer tokens; rechaza token alterado (rol falsificado) o firmado con otra clave |
| `UsuarioServiceTest` | Unitaria (Mockito) | Correo normalizado, BCrypt, duplicados 409, eliminación lógica |
| `CuotaServiceTest` | Unitaria (Mockito) | Carga masiva sin duplicados, cuota pagada inalterable, solo alumnos activos |
| `BoletaServiceTest` | Unitaria (Mockito) | Pago transaccional, cuota ajena (403), cuota ya pagada (400) |
| `NotaServiceTest` | Unitaria | Promedio ponderado y rango 1.0–7.0 |
| `EvaluacionServiceTest` | Unitaria (Mockito) | Suma de ponderaciones ≤ 100 % |
| `MensajeServiceTest` | Unitaria (Mockito) | Contactos permitidos por rol, alumno ↔ compañero |
| `EncuestaServiceTest` | Unitaria (Mockito) | Encuesta abierta, alumno inscrito, una respuesta, promedios anónimos |
| `ApiIntegracionTest` | Integración (MockMvc + H2) | Login, 401 sin token, 403 por rol, refresh y Swagger |
| `FlujosPorRolIntegracionTest` | Integración (MockMvc + H2) | Flujos completos de ADMIN, PROFESOR y ALUMNO vía HTTP con JWT y formato uniforme de errores (400/404/409) |

Las pruebas de integración recorren todas las capas (filtro JWT → Controller → Service → Repository → H2) y se ejecutan dentro de una transacción que se revierte al terminar, así cada prueba parte con los mismos datos semilla.

## Despliegue en AWS EC2 (perfil `prod`, PostgreSQL)

Archivos en `deploy/`:

| Archivo | Uso |
|---|---|
| `crear-base-datos.sql` | Crea la base `experiencia_alumno` y el usuario `experiencia_user` |
| `experiencia-alumno.env.ejemplo` | Variables de entorno (sin secretos reales) → `/etc/experiencia-alumno.env` |
| `experiencia-alumno-api.service` | Servicio systemd: arranque automático y reinicio |
| `nginx-experiencia-alumno.conf` | Nginx: frontend en `/` y proxy a la API en `/api/` |

```bash
git clone https://github.com/<usuario>/experiencia-alumno-api.git
cd experiencia-alumno-api
./mvnw clean package -DskipTests
sudo cp deploy/experiencia-alumno-api.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now experiencia-alumno-api
```
