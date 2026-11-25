package cl.duoc.experienciaalumno.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duoc.experienciaalumno.TestSeguridad;
import cl.duoc.experienciaalumno.dto.UsuarioDto.UsuarioRequest;
import cl.duoc.experienciaalumno.dto.UsuarioDto.UsuarioResponse;
import cl.duoc.experienciaalumno.exception.ApiExceptions.ConflictoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.RecursoNoEncontradoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.ReglaNegocioException;
import cl.duoc.experienciaalumno.model.Rol;
import cl.duoc.experienciaalumno.model.Usuario;
import cl.duoc.experienciaalumno.repository.UsuarioRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

/** Gestion de usuarios (ADMIN): correo normalizado, contrasena encriptada, sin duplicados y eliminacion logica. */
@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService usuarioService;

    @AfterEach
    void limpiar() {
        TestSeguridad.limpiar();
    }

    @Test
    @DisplayName("Crear: normaliza el correo, encripta la contraseña con BCrypt y la foto vacía queda en null")
    void crearUsuario() {
        when(usuarioRepository.existsByEmailIgnoreCase("angelo@duocuc.cl")).thenReturn(false);
        when(usuarioRepository.existsByRut("20.123.456-7")).thenReturn(false);
        when(passwordEncoder.encode("Duoc2026!")).thenReturn("$2a$10$hashDePrueba");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        UsuarioResponse creado = usuarioService.crear(request("  Angelo@DUOCUC.cl ", "Duoc2026!", null, "   "));

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());
        assertThat(captor.getValue().getPassword()).isEqualTo("$2a$10$hashDePrueba");
        assertThat(creado.email()).isEqualTo("angelo@duocuc.cl");
        assertThat(creado.activo()).isTrue();
        assertThat(creado.fotoUrl()).isNull();
    }

    @Test
    @DisplayName("Crear sin contraseña no está permitido")
    void crearSinPassword() {
        assertThatThrownBy(() -> usuarioService.crear(request("angelo@duocuc.cl", "  ", null, null)))
                .isInstanceOf(ReglaNegocioException.class);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("No se pueden repetir correos (409)")
    void crearCorreoDuplicado() {
        when(usuarioRepository.existsByEmailIgnoreCase("carlos.lobos@duocuc.cl")).thenReturn(true);

        assertThatThrownBy(() -> usuarioService.crear(request("Carlos.Lobos@duocuc.cl", "Duoc2026!", null, null)))
                .isInstanceOf(ConflictoException.class)
                .hasMessageContaining("carlos.lobos@duocuc.cl");
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    @DisplayName("Editar sin contraseña conserva la contraseña actual")
    void actualizarSinCambiarPassword() {
        Usuario carlos = existente();
        when(usuarioRepository.findById(4L)).thenReturn(Optional.of(carlos));

        UsuarioResponse actualizado = usuarioService.actualizar(4L,
                request("carlos.lobos@duocuc.cl", null, true, "/avatars/carlos.jpg"));

        assertThat(carlos.getPassword()).isEqualTo("hashActual");
        assertThat(actualizado.fotoUrl()).isEqualTo("/avatars/carlos.jpg");
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    @DisplayName("El administrador no puede desactivar su propia cuenta")
    void noDesactivaSuPropiaCuenta() {
        TestSeguridad.autenticarComo(20L, Rol.ADMIN);

        assertThatThrownBy(() -> usuarioService.desactivar(20L))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessage("No puede desactivar su propia cuenta");
    }

    @Test
    @DisplayName("Desactivar es una eliminación lógica: la cuenta queda inactiva, no se borra")
    void desactivarEsLogico() {
        TestSeguridad.autenticarComo(20L, Rol.ADMIN);
        Usuario carlos = existente();
        when(usuarioRepository.findById(4L)).thenReturn(Optional.of(carlos));

        usuarioService.desactivar(4L);

        assertThat(carlos.isActivo()).isFalse();
        verify(usuarioRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Filtrar por rol consulta solo los usuarios activos de ese rol")
    void listarPorRol() {
        when(usuarioRepository.findByRolAndActivoTrueOrderByNombreAsc(Rol.PROFESOR)).thenReturn(List.of());

        assertThat(usuarioService.listar(Rol.PROFESOR)).isEmpty();
        verify(usuarioRepository, never()).findAllByOrderByRolAscNombreAsc();
    }

    @Test
    @DisplayName("Obtener un usuario inexistente responde 404")
    void obtenerInexistente() {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> usuarioService.obtener(99L)).isInstanceOf(RecursoNoEncontradoException.class);
    }

    private Usuario existente() {
        Usuario u = new Usuario("Carlos Lobos", "12.345.678-9", "carlos.lobos@duocuc.cl", "hashActual",
                Rol.ALUMNO, "Analista Programador", "Plaza Oeste");
        u.setId(4L);
        return u;
    }

    private UsuarioRequest request(String email, String password, Boolean activo, String fotoUrl) {
        boolean esCarlos = email.trim().equalsIgnoreCase("carlos.lobos@duocuc.cl");
        return new UsuarioRequest(esCarlos ? "Carlos Lobos" : "Angelo Olivares",
                esCarlos ? "12.345.678-9" : "20.123.456-7", email, password, Rol.ALUMNO,
                esCarlos ? "Analista Programador" : "Ingeniería en Informática", "Plaza Oeste", activo, fotoUrl);
    }
}
