package cl.duoc.experienciaalumno;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import cl.duoc.experienciaalumno.config.DataInitializer;
import com.jayway.jsonpath.JsonPath;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

/**
 * Pruebas de integracion por rol: peticion HTTP real -> filtro JWT -> controlador -> servicio -> repositorio -> H2.
 * Cada prueba corre en una transaccion que se revierte al terminar, asi los datos semilla quedan intactos.
 */
@SpringBootTest
@Transactional
class FlujosPorRolIntegracionTest {

    private static final String ADMIN = "mariafinanzas@adminduocuc.cl";
    private static final String MARIO = "mari.huertas@profesorduocuc.cl";
    private static final String DUSTY = "du.tessini@profesor.duocuc.cl";
    private static final String CARLOS = "carlos.lobos@duocuc.cl";
    private static final String MARCELO = "marcelo@duocuc.cl";
    private static final String ANGELO = "angelo@duocuc.cl";

    @Autowired
    private WebApplicationContext context;

    private MockMvc mvc;

    @BeforeEach
    void preparar() {
        mvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    // ===================== ADMINISTRACION =====================

    @Test
    @DisplayName("ADMIN: crea un curso, inscribe un alumno (sin duplicados), lo edita y lo elimina")
    void adminGestionaCursos() throws Exception {
        String admin = token(ADMIN);
        long mario = idUsuario(admin, "PROFESOR", MARIO);
        long carlos = idUsuario(admin, "ALUMNO", CARLOS);

        String curso = enviar(admin, post("/api/v1/cursos"), cursoJson("DSY1106", "003V", "Arquitectura de Software", mario))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.profesorNombre").value("Mario Adrián Huerta Silva"))
                .andReturn().getResponse().getContentAsString();
        long cursoId = id(curso, "$.id");

        enviar(admin, post("/api/v1/cursos/" + cursoId + "/inscripciones"), "{\"alumnoId\":" + carlos + "}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.totalAlumnos").value(1));
        enviar(admin, post("/api/v1/cursos/" + cursoId + "/inscripciones"), "{\"alumnoId\":" + carlos + "}")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensaje").value(containsString("ya está inscrito")));
        enviar(admin, post("/api/v1/cursos/" + cursoId + "/inscripciones"), "{\"alumnoId\":" + mario + "}")
                .andExpect(status().isBadRequest());

        mvc.perform(get("/api/v1/cursos/" + cursoId + "/alumnos").header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
        enviar(admin, put("/api/v1/cursos/" + cursoId), cursoJson("DSY1106", "003V", "Arquitectura de Software II", mario))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Arquitectura de Software II"));

        mvc.perform(delete("/api/v1/cursos/" + cursoId + "/inscripciones/" + carlos).header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isNoContent());
        mvc.perform(delete("/api/v1/cursos/" + cursoId).header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/cursos/" + cursoId).header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("ADMIN: no puede duplicar un curso ni asignarlo a quien no es profesor")
    void adminCursoReglas() throws Exception {
        String admin = token(ADMIN);
        long mario = idUsuario(admin, "PROFESOR", MARIO);
        long carlos = idUsuario(admin, "ALUMNO", CARLOS);

        enviar(admin, post("/api/v1/cursos"), cursoJson("DSY1104", "001V", "Duplicado", mario))
                .andExpect(status().isConflict());
        enviar(admin, post("/api/v1/cursos"), cursoJson("DSY1199", "001V", "Sin profesor real", carlos))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value(containsString("PROFESOR")));
    }

    @Test
    @DisplayName("ADMIN: carga masiva de mensualidades sin duplicar y CRUD de una cuota")
    void adminCargaMensualidades() throws Exception {
        String admin = token(ADMIN);
        long carlos = idUsuario(admin, "ALUMNO", CARLOS);
        long mensualidad = id(obtener(admin, "/api/v1/categorias"), "$[?(@.nombre=='Mensualidad')].id");
        String lote = "{\"categoriaId\":" + mensualidad + ",\"concepto\":\"Mensualidad Enero 2027\",\"monto\":319000,"
                + "\"vencimiento\":\"2027-01-25\",\"periodo\":\"2027-01\"}";

        enviar(admin, post("/api/v1/cuotas/lote"), lote)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.creadas").value(4))
                .andExpect(jsonPath("$.omitidas").value(0));
        enviar(admin, post("/api/v1/cuotas/lote"), lote)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.creadas").value(0))
                .andExpect(jsonPath("$.omitidas").value(4));
        mvc.perform(get("/api/v1/cuotas").param("alumnoId", String.valueOf(carlos)).header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(6)));

        String cuota = "{\"alumnoId\":" + carlos + ",\"categoriaId\":" + mensualidad
                + ",\"concepto\":\"Ajuste arancel\",\"monto\":%d,\"vencimiento\":\"2027-02-25\",\"periodo\":\"2027-02\"}";
        long cuotaId = id(enviar(admin, post("/api/v1/cuotas"), String.format(cuota, 5000))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString(), "$.id");
        enviar(admin, put("/api/v1/cuotas/" + cuotaId), String.format(cuota, 6000))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.monto").value(6000));
        mvc.perform(delete("/api/v1/cuotas/" + cuotaId).header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/boletas").header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)));
    }

    @Test
    @DisplayName("ADMIN: CRUD de categorías; no se elimina una categoría con cuotas")
    void adminCategorias() throws Exception {
        String admin = token(ADMIN);
        String json = "{\"nombre\":\"%s\",\"descripcion\":\"Derecho de titulación\"}";

        long id = id(enviar(admin, post("/api/v1/categorias"), String.format(json, "Titulación"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString(), "$.id");
        enviar(admin, post("/api/v1/categorias"), String.format(json, "Titulación"))
                .andExpect(status().isConflict());
        enviar(admin, put("/api/v1/categorias/" + id), String.format(json, "Titulación 2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Titulación 2026"));
        mvc.perform(get("/api/v1/categorias/" + id).header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isOk());
        mvc.perform(delete("/api/v1/categorias/" + id).header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isNoContent());

        long mensualidad = id(obtener(admin, "/api/v1/categorias"), "$[?(@.nombre=='Mensualidad')].id");
        mvc.perform(delete("/api/v1/categorias/" + mensualidad).header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value(containsString("cuotas asociadas")));
    }

    @Test
    @DisplayName("ADMIN: crea, edita y desactiva un usuario; la cuenta desactivada no puede iniciar sesión")
    void adminUsuarios() throws Exception {
        String admin = token(ADMIN);
        String json = "{\"nombre\":\"%s\",\"rut\":\"55.555.555-5\",\"email\":\"%s\",\"password\":\"Duoc2026!\","
                + "\"rol\":\"ALUMNO\",\"carrera\":\"Ingeniería en Informática\",\"sede\":\"Plaza Oeste\"}";

        long id = id(enviar(admin, post("/api/v1/usuarios"), String.format(json, "Alumno Nuevo", "Nuevo@DuocUC.cl"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("nuevo@duocuc.cl"))
                .andReturn().getResponse().getContentAsString(), "$.id");
        enviar(admin, post("/api/v1/usuarios"), String.format(json, "Duplicado", CARLOS))
                .andExpect(status().isConflict());
        enviar(admin, put("/api/v1/usuarios/" + id), String.format(json, "Alumno Editado", "nuevo@duocuc.cl"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Alumno Editado"));
        mvc.perform(get("/api/v1/usuarios/" + id).header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isOk());

        mvc.perform(delete("/api/v1/usuarios/" + id).header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isNoContent());
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(credenciales("nuevo@duocuc.cl")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensaje").value(containsString("desactivada")));
    }

    // ===================== PROFESOR =====================

    @Test
    @DisplayName("PROFESOR: la ponderación de su curso no puede superar el 100%")
    void profesorNoSuperaCienPorCiento() throws Exception {
        String mario = token(MARIO);
        long fullstack = id(obtener(mario, "/api/v1/cursos"), "$[?(@.codigo=='DSY1104')].id");

        mvc.perform(get("/api/v1/evaluaciones/curso/" + fullstack).header(HttpHeaders.AUTHORIZATION, mario))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)));
        enviar(mario, post("/api/v1/evaluaciones"), evaluacionJson(fullstack, "Control extra", 10))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value(containsString("100%")));
    }

    @Test
    @DisplayName("PROFESOR: crea y edita una evaluación, registra notas y no puede borrarla si ya tiene notas")
    void profesorEvaluacionesYNotas() throws Exception {
        String admin = token(ADMIN);
        long marioId = idUsuario(admin, "PROFESOR", MARIO);
        long carlos = idUsuario(admin, "ALUMNO", CARLOS);
        long cursoId = id(enviar(admin, post("/api/v1/cursos"), cursoJson("DSY1107", "004V", "Calidad de Software", marioId))
                .andReturn().getResponse().getContentAsString(), "$.id");
        enviar(admin, post("/api/v1/cursos/" + cursoId + "/inscripciones"), "{\"alumnoId\":" + carlos + "}");

        String mario = token(MARIO);
        long evaluacionId = id(enviar(mario, post("/api/v1/evaluaciones"), evaluacionJson(cursoId, "Prueba 1", 30))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.porcentaje").value(30))
                .andReturn().getResponse().getContentAsString(), "$.id");
        enviar(mario, put("/api/v1/evaluaciones/" + evaluacionId), evaluacionJson(cursoId, "Prueba 1", 40))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.porcentaje").value(40));

        String nota = "{\"evaluacionId\":" + evaluacionId + ",\"alumnoId\":" + carlos + ",\"valor\":%s}";
        enviar(mario, put("/api/v1/notas"), String.format(nota, "8.0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles.valor").exists());
        long notaId = id(enviar(mario, put("/api/v1/notas"), String.format(nota, "6.5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valor").value(6.5))
                .andReturn().getResponse().getContentAsString(), "$.id");
        mvc.perform(get("/api/v1/notas/evaluacion/" + evaluacionId).header(HttpHeaders.AUTHORIZATION, mario))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        mvc.perform(delete("/api/v1/evaluaciones/" + evaluacionId).header(HttpHeaders.AUTHORIZATION, mario))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value(containsString("notas registradas")));
        mvc.perform(delete("/api/v1/notas/" + notaId).header(HttpHeaders.AUTHORIZATION, mario))
                .andExpect(status().isNoContent());
        mvc.perform(delete("/api/v1/evaluaciones/" + evaluacionId).header(HttpHeaders.AUTHORIZATION, mario))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("PROFESOR: no puede registrar notas en un curso que no dicta (403)")
    void profesorDeOtroCurso() throws Exception {
        String mario = token(MARIO);
        long fullstack = id(obtener(mario, "/api/v1/cursos"), "$[?(@.codigo=='DSY1104')].id");
        long evaluacion = id(obtener(mario, "/api/v1/evaluaciones/curso/" + fullstack), "$[0].id");
        long carlos = idUsuario(token(ADMIN), "ALUMNO", CARLOS);

        enviar(token(DUSTY), put("/api/v1/notas"),
                "{\"evaluacionId\":" + evaluacion + ",\"alumnoId\":" + carlos + ",\"valor\":7.0}")
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/evaluaciones/proximas").header(HttpHeaders.AUTHORIZATION, mario))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].cursoCodigo", hasItem("DSY1104")));
    }

    // ===================== ALUMNO =====================

    @Test
    @DisplayName("ALUMNO: paga sus 2 cuotas pendientes, obtiene la boleta y no puede pagarlas dos veces")
    void alumnoPagaMensualidades() throws Exception {
        String carlos = token(CARLOS);
        List<Integer> pendientes = JsonPath.read(obtener(carlos, "/api/v1/cuotas/mis-cuotas"), "$[?(@.estado=='PENDIENTE')].id");
        String pago = "{\"cuotaIds\":" + pendientes + ",\"medioPago\":\"%s\"}";

        enviar(carlos, post("/api/v1/boletas/pagar"), String.format(pago, "BITCOIN"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles.medioPago").exists());
        long boletaId = id(enviar(carlos, post("/api/v1/boletas/pagar"), String.format(pago, "WEBPAY"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.total").value(638000))
                .andExpect(jsonPath("$.detalles", hasSize(2)))
                .andReturn().getResponse().getContentAsString(), "$.id");
        enviar(carlos, post("/api/v1/boletas/pagar"), String.format(pago, "WEBPAY"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value(containsString("ya está pagada")));

        mvc.perform(get("/api/v1/boletas/mis-boletas").header(HttpHeaders.AUTHORIZATION, carlos))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
        mvc.perform(get("/api/v1/boletas/" + boletaId).header(HttpHeaders.AUTHORIZATION, carlos))
                .andExpect(status().isOk());
        mvc.perform(get("/api/v1/boletas/" + boletaId).header(HttpHeaders.AUTHORIZATION, token(MARCELO)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ALUMNO: ve sus notas con promedio y sus próximas evaluaciones")
    void alumnoVeNotas() throws Exception {
        String carlos = token(CARLOS);
        mvc.perform(get("/api/v1/notas/mis-notas").header(HttpHeaders.AUTHORIZATION, carlos))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].promedio").exists());
        mvc.perform(get("/api/v1/evaluaciones/proximas").header(HttpHeaders.AUTHORIZATION, carlos))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThanOrEqualTo(1)));
        mvc.perform(get("/api/v1/auth/me").header(HttpHeaders.AUTHORIZATION, carlos))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(CARLOS));
    }

    // ===================== ENCUESTA DOCENTE (los 3 roles) =====================

    @Test
    @DisplayName("Encuesta: el alumno responde una vez, el profesor ve resultados anónimos y ADMIN la cierra")
    void encuestaDocenteCompleta() throws Exception {
        String carlos = token(CARLOS);
        String pendientes = obtener(carlos, "/api/v1/encuestas/pendientes");
        long encuesta = id(pendientes, "$[?(@.cursoCodigo=='DSY1104')].id");
        String respuesta = "{\"claridad\":%d,\"puntualidad\":5,\"retroalimentacion\":4,\"dominio\":5,\"comentario\":\"Muy buenas clases\"}";

        enviar(carlos, post("/api/v1/encuestas/" + encuesta + "/respuestas"), String.format(respuesta, 6))
                .andExpect(status().isBadRequest());
        enviar(carlos, post("/api/v1/encuestas/" + encuesta + "/respuestas"), String.format(respuesta, 5))
                .andExpect(status().isCreated());
        enviar(carlos, post("/api/v1/encuestas/" + encuesta + "/respuestas"), String.format(respuesta, 5))
                .andExpect(status().isConflict());

        String mario = token(MARIO);
        mvc.perform(get("/api/v1/encuestas").header(HttpHeaders.AUTHORIZATION, mario))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
        mvc.perform(get("/api/v1/encuestas/" + encuesta + "/resultados").header(HttpHeaders.AUTHORIZATION, mario))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.respuestas").value(2))
                .andExpect(jsonPath("$.comentarios", hasItem("Muy buenas clases")));
        mvc.perform(get("/api/v1/encuestas/" + encuesta + "/resultados").header(HttpHeaders.AUTHORIZATION, token(DUSTY)))
                .andExpect(status().isForbidden());

        String admin = token(ADMIN);
        mvc.perform(patch("/api/v1/encuestas/" + encuesta + "/cerrar").header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activa").value(false));
        mvc.perform(get("/api/v1/encuestas").header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    @DisplayName("Encuesta: ADMIN crea y elimina una encuesta; la fecha de cierre no puede estar en el pasado")
    void adminCreaEncuesta() throws Exception {
        String admin = token(ADMIN);
        long fullstack = id(obtener(admin, "/api/v1/cursos"), "$[?(@.codigo=='DSY1104')].id");
        String json = "{\"cursoId\":" + fullstack + ",\"titulo\":\"Encuesta de cierre\",\"fechaCierre\":\"%s\"}";

        enviar(admin, post("/api/v1/encuestas"), String.format(json, "2020-01-01"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles.fechaCierre").exists());
        long id = id(enviar(admin, post("/api/v1/encuestas"), String.format(json, "2099-12-31"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.abierta").value(true))
                .andReturn().getResponse().getContentAsString(), "$.id");
        mvc.perform(delete("/api/v1/encuestas/" + id).header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isNoContent());
    }

    // ===================== MENSAJERIA =====================

    @Test
    @DisplayName("Mensajes: un alumno escribe a un compañero; solo el destinatario lo marca como leído")
    void mensajeriaEntreCompaneros() throws Exception {
        String carlos = token(CARLOS);
        long marceloId = id(obtener(carlos, "/api/v1/mensajes/contactos"), "$[?(@.email=='" + MARCELO + "')].id");

        long mensaje = id(enviar(carlos, post("/api/v1/mensajes"),
                        "{\"destinatarioId\":" + marceloId + ",\"asunto\":\"EP3\",\"cuerpo\":\"¿Revisamos los commits?\"}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.leido").value(false))
                .andReturn().getResponse().getContentAsString(), "$.id");

        String marcelo = token(MARCELO);
        mvc.perform(get("/api/v1/mensajes/no-leidos").header(HttpHeaders.AUTHORIZATION, marcelo))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.noLeidos", greaterThanOrEqualTo(1)));
        mvc.perform(get("/api/v1/mensajes/recibidos").header(HttpHeaders.AUTHORIZATION, marcelo))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].asunto", hasItem("EP3")));
        mvc.perform(patch("/api/v1/mensajes/" + mensaje + "/leido").header(HttpHeaders.AUTHORIZATION, carlos))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/api/v1/mensajes/" + mensaje + "/leido").header(HttpHeaders.AUTHORIZATION, marcelo))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.leido").value(true));

        mvc.perform(get("/api/v1/mensajes/" + mensaje).header(HttpHeaders.AUTHORIZATION, token(ANGELO)))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/mensajes/enviados").header(HttpHeaders.AUTHORIZATION, carlos))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].asunto", hasItem("EP3")));
    }

    @Test
    @DisplayName("Mensajes: nadie puede enviarse un mensaje a sí mismo")
    void mensajeASiMismo() throws Exception {
        String carlos = token(CARLOS);
        long propio = id(obtener(carlos, "/api/v1/auth/me"), "$.id");
        enviar(carlos, post("/api/v1/mensajes"), "{\"destinatarioId\":" + propio + ",\"asunto\":\"Hola\",\"cuerpo\":\"Yo\"}")
                .andExpect(status().isBadRequest());
    }

    // ===================== FORMATO DE ERRORES =====================

    @Test
    @DisplayName("Errores: validación (400 con detalles), JSON mal formado (400) y parámetro inválido (400)")
    void formatoUniformeDeErrores() throws Exception {
        String admin = token(ADMIN);
        enviar(admin, post("/api/v1/cursos"), "{}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("Datos de entrada inválidos"))
                .andExpect(jsonPath("$.detalles.codigo").exists())
                .andExpect(jsonPath("$.detalles.profesorId").exists());
        enviar(admin, post("/api/v1/cursos"), "{ esto no es json")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value(containsString("JSON")));
        mvc.perform(get("/api/v1/cursos/abc").header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("Parámetro inválido: id"));
        mvc.perform(get("/api/v1/usuarios/999999").header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    // ===================== utilidades =====================

    private String credenciales(String email) {
        return "{\"email\":\"" + email + "\",\"password\":\"" + DataInitializer.PASSWORD_DEMO + "\"}";
    }

    private String token(String email) throws Exception {
        String json = mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(credenciales(email)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return "Bearer " + JsonPath.read(json, "$.accessToken");
    }

    private ResultActions enviar(String token, MockHttpServletRequestBuilder peticion, String cuerpo) throws Exception {
        return mvc.perform(peticion.header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON).content(cuerpo));
    }

    private String obtener(String token, String ruta) throws Exception {
        return mvc.perform(get(ruta).header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
    }

    private long idUsuario(String adminToken, String rol, String email) throws Exception {
        String json = mvc.perform(get("/api/v1/usuarios").param("rol", rol).header(HttpHeaders.AUTHORIZATION, adminToken))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return id(json, "$[?(@.email=='" + email + "')].id");
    }

    /** Lee un id del JSON (si el filtro devuelve una lista, toma el primero). */
    private static long id(String json, String ruta) {
        Object valor = JsonPath.read(json, ruta);
        if (valor instanceof List<?> lista) {
            valor = lista.get(0);
        }
        return ((Number) valor).longValue();
    }

    private static String cursoJson(String codigo, String seccion, String nombre, long profesorId) {
        return "{\"codigo\":\"" + codigo + "\",\"seccion\":\"" + seccion + "\",\"nombre\":\"" + nombre
                + "\",\"profesorId\":" + profesorId + "}";
    }

    private static String evaluacionJson(long cursoId, String titulo, int porcentaje) {
        return "{\"cursoId\":" + cursoId + ",\"titulo\":\"" + titulo + "\",\"tipo\":\"Prueba escrita\","
                + "\"fecha\":\"2026-12-20\",\"sala\":\"Sala 319\",\"porcentaje\":" + porcentaje
                + ",\"descripcion\":\"Contenidos de la unidad 3\"}";
    }
}
