package cl.duoc.experienciaalumno.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import cl.duoc.experienciaalumno.model.Rol;
import cl.duoc.experienciaalumno.model.Usuario;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    private static final String SECRETO = "clave-de-prueba-experiencia-alumno-con-mas-de-32-caracteres";

    private JwtService jwtService;
    private Usuario usuario;

    @BeforeEach
    void preparar() {
        jwtService = new JwtService(SECRETO, 900000, 604800000);
        usuario = new Usuario("Carlos", "11-1", "carlos.lobos@duocuc.cl", "x", Rol.ALUMNO, null, null);
        usuario.setId(4L);
    }

    @Test
    @DisplayName("Genera un access token y lo valida recuperando id, correo y rol")
    void generarYValidarAccess() {
        String token = jwtService.generarAccessToken(usuario);

        var resultado = jwtService.validar(token, JwtService.TIPO_ACCESS);

        assertThat(resultado).isPresent();
        assertThat(resultado.get().id()).isEqualTo(4L);
        assertThat(resultado.get().email()).isEqualTo("carlos.lobos@duocuc.cl");
        assertThat(resultado.get().rol()).isEqualTo(Rol.ALUMNO);
    }

    @Test
    @DisplayName("Un refresh token no sirve como access token (y viceversa)")
    void tiposNoIntercambiables() {
        String refresh = jwtService.generarRefreshToken(usuario);
        String access = jwtService.generarAccessToken(usuario);

        assertThat(jwtService.validar(refresh, JwtService.TIPO_ACCESS)).isEmpty();
        assertThat(jwtService.validar(access, JwtService.TIPO_REFRESH)).isEmpty();
        assertThat(jwtService.validar(refresh, JwtService.TIPO_REFRESH)).isPresent();
    }

    @Test
    @DisplayName("Si un alumno cambia su rol a ADMIN dentro del token, la firma no coincide y se rechaza")
    void tokenFalsificadoRechazado() {
        String[] partes = jwtService.generarAccessToken(usuario).split("\\.");
        String contenidoFalso = "{\"sub\":\"carlos.lobos@duocuc.cl\",\"id\":\"4\",\"rol\":\"ADMIN\","
                + "\"tipo\":\"access\",\"exp\":9999999999}";
        String payloadFalso = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(contenidoFalso.getBytes(StandardCharsets.UTF_8));

        // Encabezado y firma originales, pero con el contenido modificado
        String tokenFalso = partes[0] + "." + payloadFalso + "." + partes[2];

        assertThat(jwtService.validar(tokenFalso, JwtService.TIPO_ACCESS)).isEmpty();
    }

    @Test
    @DisplayName("Un token firmado con otra clave o mal formado es rechazado")
    void tokenDeOtroServidorRechazado() {
        String token = jwtService.generarAccessToken(usuario);
        JwtService otroServidor = new JwtService("otra-clave-distinta-de-al-menos-32-caracteres!!", 900000, 604800000);

        assertThat(otroServidor.validar(token, JwtService.TIPO_ACCESS)).isEmpty();
        assertThat(jwtService.validar("no-es-un-jwt", JwtService.TIPO_ACCESS)).isEmpty();
    }

    @Test
    @DisplayName("Un token expirado es rechazado")
    void tokenExpirado() {
        JwtService expiraAlInstante = new JwtService(SECRETO, -1000, -1000);
        String token = expiraAlInstante.generarAccessToken(usuario);

        assertThat(jwtService.validar(token, JwtService.TIPO_ACCESS)).isEmpty();
    }

    @Test
    @DisplayName("Rechaza claves secretas de menos de 32 caracteres")
    void claveCorta() {
        assertThatThrownBy(() -> new JwtService("corta", 1000, 1000)).isInstanceOf(IllegalStateException.class);
    }
}
