package cl.duoc.experienciaalumno.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duoc.experienciaalumno.TestSeguridad;
import cl.duoc.experienciaalumno.dto.FinanzasDto.CuotaLoteRequest;
import cl.duoc.experienciaalumno.dto.FinanzasDto.CuotaRequest;
import cl.duoc.experienciaalumno.dto.FinanzasDto.CuotaResponse;
import cl.duoc.experienciaalumno.dto.FinanzasDto.LoteResponse;
import cl.duoc.experienciaalumno.exception.ApiExceptions.RecursoNoEncontradoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.ReglaNegocioException;
import cl.duoc.experienciaalumno.model.Categoria;
import cl.duoc.experienciaalumno.model.Cuota;
import cl.duoc.experienciaalumno.model.EstadoCuota;
import cl.duoc.experienciaalumno.model.Rol;
import cl.duoc.experienciaalumno.model.Usuario;
import cl.duoc.experienciaalumno.repository.CategoriaRepository;
import cl.duoc.experienciaalumno.repository.CuotaRepository;
import cl.duoc.experienciaalumno.repository.UsuarioRepository;
import java.time.LocalDate;
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

/** Mensualidades: carga masiva sin duplicados, cuotas pagadas inalterables y solo para alumnos activos. */
@ExtendWith(MockitoExtension.class)
class CuotaServiceTest {

    private static final LocalDate VENCIMIENTO = LocalDate.of(2027, 1, 25);

    @Mock
    private CuotaRepository cuotaRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private CategoriaRepository categoriaRepository;

    @InjectMocks
    private CuotaService cuotaService;

    private Usuario carlos;
    private Usuario marcelo;
    private Categoria mensualidad;

    @BeforeEach
    void preparar() {
        carlos = usuario(1L, "Carlos Lobos", Rol.ALUMNO);
        marcelo = usuario(2L, "Marcelo Pincheira", Rol.ALUMNO);
        mensualidad = new Categoria("Mensualidad", "Arancel mensual");
        mensualidad.setId(1L);
    }

    @AfterEach
    void limpiar() {
        TestSeguridad.limpiar();
    }

    @Test
    @DisplayName("Carga masiva: crea la cuota a cada alumno activo y omite a quien ya la tiene")
    void crearLoteSinDuplicados() {
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(mensualidad));
        when(usuarioRepository.findByRolAndActivoTrueOrderByNombreAsc(Rol.ALUMNO)).thenReturn(List.of(carlos, marcelo));
        when(cuotaRepository.existsByAlumnoIdAndConceptoIgnoreCase(1L, "Mensualidad Enero 2027")).thenReturn(true);
        when(cuotaRepository.existsByAlumnoIdAndConceptoIgnoreCase(2L, "Mensualidad Enero 2027")).thenReturn(false);
        when(cuotaRepository.save(any(Cuota.class))).thenAnswer(inv -> inv.getArgument(0));

        LoteResponse lote = cuotaService.crearLote(
                new CuotaLoteRequest(1L, "  Mensualidad Enero 2027 ", 319000, VENCIMIENTO, "2027-01"));

        assertThat(lote.creadas()).isEqualTo(1);
        assertThat(lote.omitidas()).isEqualTo(1);
        CuotaResponse creada = lote.cuotas().get(0);
        assertThat(creada.alumnoNombre()).isEqualTo("Marcelo Pincheira");
        assertThat(creada.concepto()).isEqualTo("Mensualidad Enero 2027");
        assertThat(creada.monto()).isEqualTo(319000);
        assertThat(creada.estado()).isEqualTo(EstadoCuota.PENDIENTE);
    }

    @Test
    @DisplayName("El alumno solo obtiene sus propias cuotas (el id sale del token)")
    void misCuotasDesdeElToken() {
        TestSeguridad.autenticarComo(1L, Rol.ALUMNO);
        when(cuotaRepository.findByAlumnoIdOrderByVencimientoAsc(1L)).thenReturn(List.of(cuota(carlos)));

        List<CuotaResponse> cuotas = cuotaService.misCuotas();

        assertThat(cuotas).hasSize(1);
        assertThat(cuotas.get(0).alumnoId()).isEqualTo(1L);
        verify(cuotaRepository).findByAlumnoIdOrderByVencimientoAsc(1L);
    }

    @Test
    @DisplayName("No se asignan cuotas a un profesor")
    void crearCuotaAProfesor() {
        Usuario mario = usuario(10L, "Mario Adrián Huerta Silva", Rol.PROFESOR);
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(mario));

        assertThatThrownBy(() -> cuotaService.crear(
                new CuotaRequest(10L, 1L, "Mensualidad Enero 2027", 319000, VENCIMIENTO, "2027-01")))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("alumnos activos");
        verify(cuotaRepository, never()).save(any());
    }

    @Test
    @DisplayName("No se asignan cuotas a un alumno desactivado")
    void crearCuotaAAlumnoInactivo() {
        marcelo.setActivo(false);
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(marcelo));

        assertThatThrownBy(() -> cuotaService.crear(
                new CuotaRequest(2L, 1L, "Mensualidad Enero 2027", 319000, VENCIMIENTO, "2027-01")))
                .isInstanceOf(ReglaNegocioException.class);
    }

    @Test
    @DisplayName("Una cuota pagada no se puede eliminar")
    void eliminarCuotaPagada() {
        Cuota pagada = cuota(carlos);
        pagada.setEstado(EstadoCuota.PAGADA);
        when(cuotaRepository.findById(5L)).thenReturn(Optional.of(pagada));

        assertThatThrownBy(() -> cuotaService.eliminar(5L))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessage("No se puede eliminar una cuota que ya fue pagada");
        verify(cuotaRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Una cuota pagada no se puede modificar")
    void actualizarCuotaPagada() {
        Cuota pagada = cuota(carlos);
        pagada.setEstado(EstadoCuota.PAGADA);
        when(cuotaRepository.findById(5L)).thenReturn(Optional.of(pagada));

        assertThatThrownBy(() -> cuotaService.actualizar(5L,
                new CuotaRequest(1L, 1L, "Otro concepto", 1000, VENCIMIENTO, null)))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("modificar");
    }

    @Test
    @DisplayName("Una cuota pendiente sí se puede eliminar")
    void eliminarCuotaPendiente() {
        Cuota pendiente = cuota(carlos);
        when(cuotaRepository.findById(5L)).thenReturn(Optional.of(pendiente));

        cuotaService.eliminar(5L);

        verify(cuotaRepository).delete(pendiente);
    }

    @Test
    @DisplayName("Eliminar una cuota inexistente responde 404")
    void eliminarCuotaInexistente() {
        when(cuotaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cuotaService.eliminar(99L)).isInstanceOf(RecursoNoEncontradoException.class);
    }

    private Cuota cuota(Usuario alumno) {
        Cuota c = new Cuota(alumno, mensualidad, "Mensualidad Diciembre 2026", 319000, LocalDate.of(2026, 12, 25), "2026-12");
        c.setId(5L);
        return c;
    }

    private Usuario usuario(Long id, String nombre, Rol rol) {
        Usuario u = new Usuario(nombre, id + "-K", "u" + id + "@duocuc.cl", "x", rol, null, null);
        u.setId(id);
        return u;
    }
}
