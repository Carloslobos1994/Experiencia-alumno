package cl.duoc.experienciaalumno.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duoc.experienciaalumno.TestSeguridad;
import cl.duoc.experienciaalumno.dto.MensajeDto.MensajeRequest;
import cl.duoc.experienciaalumno.dto.MensajeDto.MensajeResponse;
import cl.duoc.experienciaalumno.dto.UsuarioDto.UsuarioResumen;
import cl.duoc.experienciaalumno.exception.ApiExceptions.AccesoDenegadoException;
import cl.duoc.experienciaalumno.model.Curso;
import cl.duoc.experienciaalumno.model.Inscripcion;
import cl.duoc.experienciaalumno.model.Mensaje;
import cl.duoc.experienciaalumno.model.Rol;
import cl.duoc.experienciaalumno.model.Usuario;
import cl.duoc.experienciaalumno.repository.CursoRepository;
import cl.duoc.experienciaalumno.repository.InscripcionRepository;
import cl.duoc.experienciaalumno.repository.MensajeRepository;
import cl.duoc.experienciaalumno.repository.UsuarioRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/** Reglas de contacto de la mensajeria: el alumno escribe a Administracion, sus profesores y sus companeros. */
@ExtendWith(MockitoExtension.class)
class MensajeServiceTest {

    @Mock
    private MensajeRepository mensajeRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private InscripcionRepository inscripcionRepository;
    @Mock
    private CursoRepository cursoRepository;

    @InjectMocks
    private MensajeService mensajeService;

    private Usuario carlos;
    private Usuario marcelo;
    private Usuario alumnoOtraCarrera;
    private Usuario mario;
    private Usuario finanzas;
    private Curso fullstack;

    @BeforeEach
    void preparar() {
        carlos = usuario(1L, "Carlos", Rol.ALUMNO);
        marcelo = usuario(2L, "Marcelo", Rol.ALUMNO);
        alumnoOtraCarrera = usuario(3L, "Alumno sin cursos en comun", Rol.ALUMNO);
        mario = usuario(10L, "Mario", Rol.PROFESOR);
        finanzas = usuario(20L, "María Finanzas", Rol.ADMIN);
        fullstack = new Curso("DSY1104", "001V", "Desarrollo Fullstack II", mario);
        fullstack.setId(100L);
        TestSeguridad.autenticarComo(1L, Rol.ALUMNO);
    }

    @AfterEach
    void limpiar() {
        TestSeguridad.limpiar();
    }

    /** Carlos y Marcelo estan inscritos en Fullstack II. */
    private void prepararContactosDeCarlos() {
        when(usuarioRepository.findByRolAndActivoTrueOrderByNombreAsc(Rol.ADMIN)).thenReturn(List.of(finanzas));
        when(inscripcionRepository.findByAlumnoId(1L)).thenReturn(List.of(new Inscripcion(carlos, fullstack)));
        when(inscripcionRepository.findByCursoIdOrderByAlumnoNombreAsc(100L))
                .thenReturn(List.of(new Inscripcion(carlos, fullstack), new Inscripcion(marcelo, fullstack)));
    }

    @Test
    @DisplayName("El alumno ve como contactos a Administración, su profesor y su compañero (no a sí mismo)")
    void contactosDelAlumno() {
        prepararContactosDeCarlos();

        List<UsuarioResumen> contactos = mensajeService.contactos();

        assertThat(contactos).extracting(UsuarioResumen::nombre)
                .containsExactly("María Finanzas", "Mario", "Marcelo");
    }

    @Test
    @DisplayName("Un alumno puede enviar un mensaje a un compañero de curso")
    void alumnoEscribeACompanero() {
        prepararContactosDeCarlos();
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(carlos));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(marcelo));
        when(mensajeRepository.save(any(Mensaje.class))).thenAnswer(inv -> inv.getArgument(0));

        MensajeResponse enviado = mensajeService.enviar(new MensajeRequest(2L, "Coordinación EP3", "¿Revisamos hoy?", null));

        assertThat(enviado.destinatarioNombre()).isEqualTo("Marcelo");
        assertThat(enviado.remitenteRol()).isEqualTo(Rol.ALUMNO);
    }

    @Test
    @DisplayName("Un alumno NO puede escribir a alumnos con los que no comparte cursos (403)")
    void alumnoNoEscribeADesconocido() {
        prepararContactosDeCarlos();
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(carlos));
        when(usuarioRepository.findById(3L)).thenReturn(Optional.of(alumnoOtraCarrera));

        assertThatThrownBy(() -> mensajeService.enviar(new MensajeRequest(3L, "Hola", "Mensaje", null)))
                .isInstanceOf(AccesoDenegadoException.class);
        verify(mensajeRepository, never()).save(any());
    }

    private Usuario usuario(Long id, String nombre, Rol rol) {
        Usuario u = new Usuario(nombre, id + "-K", "u" + id + "@duocuc.cl", "x", rol, null, null);
        u.setId(id);
        return u;
    }
}
