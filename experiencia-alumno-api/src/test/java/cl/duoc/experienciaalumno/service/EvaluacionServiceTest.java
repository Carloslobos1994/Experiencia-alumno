package cl.duoc.experienciaalumno.service;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import cl.duoc.experienciaalumno.exception.ApiExceptions.ReglaNegocioException;
import cl.duoc.experienciaalumno.repository.CursoRepository;
import cl.duoc.experienciaalumno.repository.EvaluacionRepository;
import cl.duoc.experienciaalumno.repository.InscripcionRepository;
import cl.duoc.experienciaalumno.repository.NotaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/** Regla: la suma de ponderaciones de un curso no puede superar el 100%. */
@ExtendWith(MockitoExtension.class)
class EvaluacionServiceTest {

    @Mock
    private EvaluacionRepository evaluacionRepository;
    @Mock
    private CursoRepository cursoRepository;
    @Mock
    private InscripcionRepository inscripcionRepository;
    @Mock
    private NotaRepository notaRepository;

    private EvaluacionService service;

    @BeforeEach
    void preparar() {
        service = new EvaluacionService(evaluacionRepository, cursoRepository, inscripcionRepository,
                notaRepository, new PermisosService(inscripcionRepository));
    }

    @Test
    @DisplayName("Permite agregar una evaluacion si el total queda en 100%")
    void permiteHasta100() {
        when(evaluacionRepository.sumarPorcentajes(1L)).thenReturn(60L);
        assertThatCode(() -> service.validarPorcentaje(1L, 40, 0)).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Rechaza una evaluacion que haria superar el 100%")
    void rechazaSobre100() {
        when(evaluacionRepository.sumarPorcentajes(1L)).thenReturn(80L);
        assertThatThrownBy(() -> service.validarPorcentaje(1L, 30, 0))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("110%");
    }

    @Test
    @DisplayName("Al editar, descuenta el porcentaje anterior de la misma evaluacion")
    void editarDescuentaAnterior() {
        // Curso con 100%: una evaluacion de 40% pasa a 40% (sin cambio) -> valido
        when(evaluacionRepository.sumarPorcentajes(1L)).thenReturn(100L);
        assertThatCode(() -> service.validarPorcentaje(1L, 40, 40)).doesNotThrowAnyException();
    }
}
