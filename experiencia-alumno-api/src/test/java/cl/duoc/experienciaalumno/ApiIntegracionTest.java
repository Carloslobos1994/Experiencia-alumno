package cl.duoc.experienciaalumno;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import cl.duoc.experienciaalumno.config.DataInitializer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

/**
 * Prueba de integracion de punta a punta (con H2 y los datos semilla):
 * login real -> token JWT -> acceso permitido o denegado segun el rol.
 */
@SpringBootTest
class ApiIntegracionTest {

    private static final String ADMIN = "mariafinanzas@adminduocuc.cl";
    private static final String PROFESOR = "mari.huertas@profesorduocuc.cl";
    private static final String ALUMNO = "carlos.lobos@duocuc.cl";

    @Autowired
    private WebApplicationContext context;

    private MockMvc mvc;

    @BeforeEach
    void preparar() {
        mvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    @Test
    @DisplayName("Login correcto devuelve accessToken, refreshToken y rol")
    void loginCorrecto() throws Exception {
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(credenciales(ALUMNO, DataInitializer.PASSWORD_DEMO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.usuario.rol").value("ALUMNO"));
    }

    @Test
    @DisplayName("Login con contrasena incorrecta responde 401")
    void loginIncorrecto() throws Exception {
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(credenciales(ALUMNO, "incorrecta")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Sin token, un endpoint protegido responde 401")
    void sinToken() throws Exception {
        mvc.perform(get("/api/v1/cursos")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Un ALUMNO no puede listar usuarios (403); ADMIN si puede (200)")
    void permisosPorRol() throws Exception {
        mvc.perform(get("/api/v1/usuarios").header(HttpHeaders.AUTHORIZATION, bearer(ALUMNO)))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/usuarios").header(HttpHeaders.AUTHORIZATION, bearer(ADMIN)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Un PROFESOR no puede cargar mensualidades (403)")
    void profesorNoCargaCuotas() throws Exception {
        mvc.perform(get("/api/v1/cuotas").header(HttpHeaders.AUTHORIZATION, bearer(PROFESOR)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("El ALUMNO ve sus 5 mensualidades y sus 2 cursos")
    void alumnoVeSusDatos() throws Exception {
        String token = bearer(ALUMNO);
        mvc.perform(get("/api/v1/cuotas/mis-cuotas").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(5));
        mvc.perform(get("/api/v1/cursos").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @DisplayName("El refresh token entrega un access token nuevo")
    void refresh() throws Exception {
        String respuesta = login(ALUMNO);
        String refresh = extraer(respuesta, "refreshToken");

        mvc.perform(post("/api/v1/auth/refresh").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"" + refresh + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty());
    }

    @Test
    @DisplayName("Swagger / OpenAPI es publico")
    void swaggerPublico() throws Exception {
        mvc.perform(get("/v3/api-docs")).andExpect(status().isOk());
    }

    // ---------- utilidades ----------

    private String credenciales(String email, String password) {
        return "{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}";
    }

    private String login(String email) throws Exception {
        return mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(credenciales(email, DataInitializer.PASSWORD_DEMO)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
    }

    private String bearer(String email) throws Exception {
        return "Bearer " + extraer(login(email), "accessToken");
    }

    private static String extraer(String json, String campo) {
        Matcher m = Pattern.compile("\"" + campo + "\"\\s*:\\s*\"([^\"]+)\"").matcher(json);
        if (!m.find()) {
            throw new IllegalStateException("No se encontro " + campo + " en: " + json);
        }
        return m.group(1);
    }
}
