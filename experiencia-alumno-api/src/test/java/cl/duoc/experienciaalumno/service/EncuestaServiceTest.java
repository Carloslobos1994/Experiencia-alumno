package cl.duoc.experienciaalumno.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duoc.experienciaalumno.TestSeguridad;
import cl.duoc.experienciaalumno.dto.EncuestaDto.EncuestaRequest;
import cl.duoc.experienciaalumno.dto.EncuestaDto.EncuestaResponse;
import cl.duoc.experienciaalumno.dto.EncuestaDto.RespuestaRequest;
import cl.duoc.experienciaalumno.dto.EncuestaDto.ResultadoEncuestaResponse;
import cl.duoc.experienciaalumno.exception.ApiExceptions.AccesoDenegadoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.ConflictoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.RecursoNoEncontradoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.ReglaNegocioException;
import cl.duoc.experienciaalumno.model.Curso;
import cl.duoc.experienciaalumno.model.Encuesta;
import cl.duoc.experienciaalumno.model.Inscripcion;
import cl.duoc.experienciaalumno.model.RespuestaEncuesta;
import cl.duoc.experienciaalumno.model.Rol;
import cl.duoc.experienciaalumno.model.Usuario;
import cl.duoc.experienciaalumno.repository.CursoRepository;
import cl.duoc.experienciaalumno.repository.EncuestaRepository;
import cl.duoc.experienciaalumno.repository.InscripcionRepository;
import cl.duoc.experienciaalumno.repository.RespuestaEncuestaRepository;
import cl.duoc.experienciaalumno.repository.UsuarioRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/** Encuesta docente: reglas para responder (abierta, inscrito, una vez) y calculo anonimo de resultados. */
@ExtendWith(MockitoExtension.class)
class EncuestaServiceTest {

    @Mock
    private EncuestaRepository encuestaRepository;
    @Mock
    private RespuestaEncuestaRepository respuestaRepository;
    @Mock
    private CursoRepository cursoRepository;
    @Mock
    private InscripcionRepository inscripcionRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private PermisosService permisosService;

    @InjectMocks
    private EncuestaService encuestaService;

    private Usuario carlos;
    private Curso fullstack;
    private Encuesta encuesta;

    @BeforeEach
    void preparar() {
        Usuario mario = usuario(10L, "Mario Adrián Huerta Silva", Rol.PROFESOR);
        carlos = usuario(1L, "Carlos Lobos", Rol.ALUMNO);
        fullstack = new Curso("DSY1104", "001V", "Desarrollo Fullstack II", mario);
        fullstack.setId(100L);
        encuesta = encuesta(7L, LocalDate.now().plusDays(21));
    }

    @AfterEach
    void limpiar() {
        TestSeguridad.limpiar();
    }

    @Test
    @DisplayName("El alumno inscrito responde la encuesta abierta y el comentario se guarda sin espacios")
    void responderEncuestaAbierta() {
        TestSeguridad.autenticarComo(1L, Rol.ALUMNO);
        when(encuestaRepository.findById(7L)).thenReturn(Optional.of(encuesta));
        when(permisosService.estaInscrito(1L, 100L)).thenReturn(true);
        when(respuestaRepository.existsByEncuestaIdAndAlumnoId(7L, 1L)).thenReturn(false);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(carlos));

        encuestaService.responder(7L, new RespuestaRequest(5, 4, 5, 5, "  Explica muy bien  "));

        ArgumentCaptor<RespuestaEncuesta> captor = ArgumentCaptor.forClass(RespuestaEncuesta.class);
        verify(respuestaRepository).save(captor.capture());
        RespuestaEncuesta guardada = captor.getValue();
        assertThat(guardada.getAlumno()).isEqualTo(carlos);
        assertThat(guardada.getEncuesta()).isEqualTo(encuesta);
        assertThat(guardada.getClaridad()).isEqualTo(5);
        assertThat(guardada.getPuntualidad()).isEqualTo(4);
        assertThat(guardada.getComentario()).isEqualTo("Explica muy bien");
    }

    @Test
    @DisplayName("No se puede responder una encuesta cuya fecha de cierre ya pasó")
    void responderEncuestaCerrada() {
        TestSeguridad.autenticarComo(1L, Rol.ALUMNO);
        Encuesta vencida = encuesta(8L, LocalDate.now().minusDays(1));
        when(encuestaRepository.findById(8L)).thenReturn(Optional.of(vencida));

        assertThatThrownBy(() -> encuestaService.responder(8L, new RespuestaRequest(5, 5, 5, 5, null)))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("cerrada");
        verify(respuestaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Un alumno que no está inscrito en el curso no puede responder (403)")
    void responderSinInscripcion() {
        TestSeguridad.autenticarComo(1L, Rol.ALUMNO);
        when(encuestaRepository.findById(7L)).thenReturn(Optional.of(encuesta));
        when(permisosService.estaInscrito(1L, 100L)).thenReturn(false);

        assertThatThrownBy(() -> encuestaService.responder(7L, new RespuestaRequest(5, 5, 5, 5, null)))
                .isInstanceOf(AccesoDenegadoException.class);
        verify(respuestaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Cada alumno responde una sola vez (409)")
    void responderDosVeces() {
        TestSeguridad.autenticarComo(1L, Rol.ALUMNO);
        when(encuestaRepository.findById(7L)).thenReturn(Optional.of(encuesta));
        when(permisosService.estaInscrito(1L, 100L)).thenReturn(true);
        when(respuestaRepository.existsByEncuestaIdAndAlumnoId(7L, 1L)).thenReturn(true);

        assertThatThrownBy(() -> encuestaService.responder(7L, new RespuestaRequest(5, 5, 5, 5, null)))
                .isInstanceOf(ConflictoException.class)
                .hasMessage("Ya respondiste esta encuesta");
        verify(respuestaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Pendientes: solo las encuestas abiertas de sus cursos que aún no responde")
    void pendientesDelAlumno() {
        TestSeguridad.autenticarComo(1L, Rol.ALUMNO);
        Encuesta yaRespondida = encuesta(8L, LocalDate.now().plusDays(5));
        Encuesta vencida = encuesta(9L, LocalDate.now().minusDays(2));
        when(inscripcionRepository.findByAlumnoId(1L)).thenReturn(List.of(new Inscripcion(carlos, fullstack)));
        when(encuestaRepository.findByActivaTrueAndCursoIdIn(List.of(100L)))
                .thenReturn(List.of(encuesta, yaRespondida, vencida));
        when(respuestaRepository.existsByEncuestaIdAndAlumnoId(7L, 1L)).thenReturn(false);
        when(respuestaRepository.existsByEncuestaIdAndAlumnoId(8L, 1L)).thenReturn(true);

        List<EncuestaResponse> pendientes = encuestaService.pendientes();

        assertThat(pendientes).extracting(EncuestaResponse::id).containsExactly(7L);
        assertThat(pendientes.get(0).profesorNombre()).isEqualTo("Mario Adrián Huerta Silva");
        assertThat(pendientes.get(0).abierta()).isTrue();
    }

    @Test
    @DisplayName("Un alumno sin cursos no tiene encuestas pendientes (no consulta encuestas)")
    void pendientesSinCursos() {
        TestSeguridad.autenticarComo(1L, Rol.ALUMNO);
        when(inscripcionRepository.findByAlumnoId(1L)).thenReturn(List.of());

        assertThat(encuestaService.pendientes()).isEmpty();
        verify(encuestaRepository, never()).findByActivaTrueAndCursoIdIn(any());
    }

    @Test
    @DisplayName("Resultados: promedios por pregunta redondeados a 2 decimales y comentarios sin nombres")
    void calcularResultados() {
        RespuestaEncuesta r1 = respuesta(5, 4, 3, 5, "Excelente docente");
        RespuestaEncuesta r2 = respuesta(4, 4, 4, 4, "   ");

        ResultadoEncuestaResponse resultado = EncuestaService.calcularResultados(encuesta, List.of(r1, r2), 4);

        assertThat(resultado.respuestas()).isEqualTo(2);
        assertThat(resultado.inscritos()).isEqualTo(4);
        assertThat(resultado.claridad()).isEqualTo(4.5);
        assertThat(resultado.puntualidad()).isEqualTo(4.0);
        assertThat(resultado.retroalimentacion()).isEqualTo(3.5);
        assertThat(resultado.dominio()).isEqualTo(4.5);
        assertThat(resultado.promedioGeneral()).isEqualTo(4.13);
        assertThat(resultado.comentarios()).containsExactly("Excelente docente");
    }

    @Test
    @DisplayName("Resultados sin respuestas: los promedios quedan vacíos (null), no en cero")
    void calcularResultadosSinRespuestas() {
        ResultadoEncuestaResponse resultado = EncuestaService.calcularResultados(encuesta, List.of(), 4);

        assertThat(resultado.respuestas()).isZero();
        assertThat(resultado.claridad()).isNull();
        assertThat(resultado.promedioGeneral()).isNull();
        assertThat(resultado.comentarios()).isEmpty();
    }

    @Test
    @DisplayName("Un profesor que no dicta el curso no puede ver los resultados (403)")
    void resultadosDeOtroProfesor() {
        TestSeguridad.autenticarComo(11L, Rol.PROFESOR);
        when(encuestaRepository.findById(7L)).thenReturn(Optional.of(encuesta));

        assertThatThrownBy(() -> encuestaService.resultados(7L)).isInstanceOf(AccesoDenegadoException.class);
    }

    @Test
    @DisplayName("Los alumnos no pueden listar todas las encuestas (403)")
    void alumnoNoListaEncuestas() {
        TestSeguridad.autenticarComo(1L, Rol.ALUMNO);

        assertThatThrownBy(() -> encuestaService.listar()).isInstanceOf(AccesoDenegadoException.class);
    }

    @Test
    @DisplayName("Cerrar una encuesta la deja inactiva")
    void cerrarEncuesta() {
        when(encuestaRepository.findById(7L)).thenReturn(Optional.of(encuesta));

        EncuestaResponse cerrada = encuestaService.cerrar(7L);

        assertThat(cerrada.activa()).isFalse();
        assertThat(cerrada.abierta()).isFalse();
    }

    @Test
    @DisplayName("Crear una encuesta para un curso inexistente responde 404")
    void crearConCursoInexistente() {
        when(cursoRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> encuestaService.crear(new EncuestaRequest(999L, "Encuesta", LocalDate.now().plusDays(7))))
                .isInstanceOf(RecursoNoEncontradoException.class);
        verify(encuestaRepository, never()).save(any());
    }

    private Encuesta encuesta(Long id, LocalDate cierre) {
        Encuesta e = new Encuesta(fullstack, "Encuesta Docente 2026-2", cierre);
        e.setId(id);
        return e;
    }

    private RespuestaEncuesta respuesta(int claridad, int puntualidad, int retro, int dominio, String comentario) {
        RespuestaEncuesta r = new RespuestaEncuesta();
        r.setClaridad(claridad);
        r.setPuntualidad(puntualidad);
        r.setRetroalimentacion(retro);
        r.setDominio(dominio);
        r.setComentario(comentario);
        return r;
    }

    private Usuario usuario(Long id, String nombre, Rol rol) {
        Usuario u = new Usuario(nombre, id + "-K", "u" + id + "@duocuc.cl", "x", rol, null, null);
        u.setId(id);
        return u;
    }
}
