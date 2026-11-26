package cl.duoc.experienciaalumno.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import cl.duoc.experienciaalumno.TestSeguridad;
import cl.duoc.experienciaalumno.dto.AcademicoDto.NotaAlumnoItem;
import cl.duoc.experienciaalumno.dto.AcademicoDto.NotaRequest;
import cl.duoc.experienciaalumno.dto.AcademicoDto.NotaResponse;
import cl.duoc.experienciaalumno.exception.ApiExceptions.AccesoDenegadoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.ReglaNegocioException;
import cl.duoc.experienciaalumno.model.Curso;
import cl.duoc.experienciaalumno.model.Evaluacion;
import cl.duoc.experienciaalumno.model.Nota;
import cl.duoc.experienciaalumno.model.Rol;
import cl.duoc.experienciaalumno.model.Usuario;
import cl.duoc.experienciaalumno.repository.EvaluacionRepository;
import cl.duoc.experienciaalumno.repository.InscripcionRepository;
import cl.duoc.experienciaalumno.repository.NotaRepository;
import cl.duoc.experienciaalumno.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class NotaServiceTest {

    @Mock
    private NotaRepository notaRepository;
    @Mock
    private EvaluacionRepository evaluacionRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private InscripcionRepository inscripcionRepository;

    private NotaService notaService;
    private Evaluacion evaluacion;
    private Usuario alumno;

    @BeforeEach
    void preparar() {
        PermisosService permisos = new PermisosService(inscripcionRepository);
        notaService = new NotaService(notaRepository, evaluacionRepository, usuarioRepository, inscripcionRepository, permisos);

        Usuario mario = new Usuario("Mario", "1-9", "mario@profesor.cl", "x", Rol.PROFESOR, null, null);
        mario.setId(10L);
        Curso fullstack = new Curso("DSY1104", "001V", "Desarrollo Fullstack II", mario);
        fullstack.setId(100L);
        evaluacion = new Evaluacion(fullstack, "EP3", "Presentación", LocalDate.of(2026, 11, 26), "319", 40);
        evaluacion.setId(1000L);
        alumno = new Usuario("Carlos", "11-1", "carlos@duocuc.cl", "x", Rol.ALUMNO, null, null);
        alumno.setId(1L);
    }

    @AfterEach
    void limpiar() {
        TestSeguridad.limpiar();
    }

    @Test
    @DisplayName("El profesor del curso registra una nota valida")
    void profesorRegistraNota() {
        TestSeguridad.autenticarComo(10L, Rol.PROFESOR);
        when(evaluacionRepository.findById(1000L)).thenReturn(Optional.of(evaluacion));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(alumno));
        when(inscripcionRepository.existsByAlumnoIdAndCursoId(1L, 100L)).thenReturn(true);
        when(notaRepository.findByEvaluacionIdAndAlumnoId(1000L, 1L)).thenReturn(Optional.empty());
        when(notaRepository.save(any(Nota.class))).thenAnswer(inv -> inv.getArgument(0));

        NotaResponse nota = notaService.registrar(new NotaRequest(1000L, 1L, new BigDecimal("6.75")));

        // Se redondea a un decimal
        assertThat(nota.valor()).isEqualByComparingTo("6.8");
    }

    @Test
    @DisplayName("Un profesor que no dicta el curso no puede calificar (403)")
    void otroProfesorNoCalifica() {
        TestSeguridad.autenticarComo(99L, Rol.PROFESOR);
        when(evaluacionRepository.findById(1000L)).thenReturn(Optional.of(evaluacion));

        assertThatThrownBy(() -> notaService.registrar(new NotaRequest(1000L, 1L, new BigDecimal("6.0"))))
                .isInstanceOf(AccesoDenegadoException.class);
    }

    @Test
    @DisplayName("No se califica a un alumno que no esta inscrito en el curso (400)")
    void alumnoNoInscrito() {
        TestSeguridad.autenticarComo(10L, Rol.PROFESOR);
        when(evaluacionRepository.findById(1000L)).thenReturn(Optional.of(evaluacion));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(alumno));
        when(inscripcionRepository.existsByAlumnoIdAndCursoId(1L, 100L)).thenReturn(false);

        assertThatThrownBy(() -> notaService.registrar(new NotaRequest(1000L, 1L, new BigDecimal("6.0"))))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("no está inscrito");
    }

    @Test
    @DisplayName("La nota debe estar entre 1.0 y 7.0")
    void validarRangoNota() {
        assertThatThrownBy(() -> NotaService.validarValor(new BigDecimal("7.5"))).isInstanceOf(ReglaNegocioException.class);
        assertThatThrownBy(() -> NotaService.validarValor(new BigDecimal("0.9"))).isInstanceOf(ReglaNegocioException.class);
        assertThatThrownBy(() -> NotaService.validarValor(null)).isInstanceOf(ReglaNegocioException.class);
        assertThat(NotaService.validarValor(new BigDecimal("4"))).isEqualByComparingTo("4.0");
    }

    @Test
    @DisplayName("Promedio ponderado solo considera evaluaciones con nota")
    void promedioPonderado() {
        List<NotaAlumnoItem> items = List.of(
                new NotaAlumnoItem(1L, "EP1", "", null, 30, new BigDecimal("6.5")),
                new NotaAlumnoItem(2L, "EP2", "", null, 30, new BigDecimal("6.2")),
                new NotaAlumnoItem(3L, "EP3", "", null, 40, null));

        // (6.5*30 + 6.2*30) / 60 = 6.35 -> 6.4
        assertThat(NotaService.calcularPromedio(items)).isEqualByComparingTo("6.4");
    }

    @Test
    @DisplayName("Sin notas no hay promedio")
    void promedioSinNotas() {
        List<NotaAlumnoItem> items = List.of(new NotaAlumnoItem(1L, "EP1", "", null, 30, null));
        assertThat(NotaService.calcularPromedio(items)).isNull();
    }
}
