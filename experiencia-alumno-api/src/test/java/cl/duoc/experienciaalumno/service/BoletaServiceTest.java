package cl.duoc.experienciaalumno.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.duoc.experienciaalumno.TestSeguridad;
import cl.duoc.experienciaalumno.dto.FinanzasDto.BoletaResponse;
import cl.duoc.experienciaalumno.dto.FinanzasDto.PagoRequest;
import cl.duoc.experienciaalumno.exception.ApiExceptions.AccesoDenegadoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.RecursoNoEncontradoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.ReglaNegocioException;
import cl.duoc.experienciaalumno.model.Boleta;
import cl.duoc.experienciaalumno.model.Categoria;
import cl.duoc.experienciaalumno.model.Cuota;
import cl.duoc.experienciaalumno.model.EstadoCuota;
import cl.duoc.experienciaalumno.model.Rol;
import cl.duoc.experienciaalumno.model.Usuario;
import cl.duoc.experienciaalumno.repository.BoletaRepository;
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

/** Pruebas de la regla de negocio principal del carrito: pagar cuotas y generar la boleta. */
@ExtendWith(MockitoExtension.class)
class BoletaServiceTest {

    @Mock
    private BoletaRepository boletaRepository;
    @Mock
    private CuotaRepository cuotaRepository;
    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private BoletaService boletaService;

    private Usuario alumno;
    private Usuario otroAlumno;
    private Categoria mensualidad;

    @BeforeEach
    void preparar() {
        alumno = usuario(1L, "Carlos");
        otroAlumno = usuario(2L, "Angelo");
        mensualidad = new Categoria("Mensualidad", null);
        mensualidad.setId(1L);
        TestSeguridad.autenticarComo(1L, Rol.ALUMNO);
    }

    @AfterEach
    void limpiar() {
        TestSeguridad.limpiar();
    }

    @Test
    @DisplayName("Pagar dos cuotas propias genera boleta con total calculado por el servidor y marca las cuotas como PAGADAS")
    void pagarCuotasPropias() {
        Cuota nov = cuota(10L, alumno, "Mensualidad Noviembre", 319000, 11);
        Cuota dic = cuota(11L, alumno, "Mensualidad Diciembre", 319000, 12);
        when(cuotaRepository.findAllById(anyList())).thenReturn(List.of(dic, nov));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(alumno));
        when(boletaRepository.save(any(Boleta.class))).thenAnswer(inv -> {
            Boleta b = inv.getArgument(0);
            b.setId(7L);
            return b;
        });

        BoletaResponse boleta = boletaService.pagar(new PagoRequest(List.of(10L, 11L), "WEBPAY"));

        assertThat(boleta.total()).isEqualTo(638000);
        assertThat(boleta.numero()).isEqualTo("B-000007");
        assertThat(boleta.detalles()).hasSize(2);
        // El detalle queda ordenado por vencimiento (noviembre antes que diciembre)
        assertThat(boleta.detalles().get(0).concepto()).isEqualTo("Mensualidad Noviembre");
        assertThat(nov.getEstado()).isEqualTo(EstadoCuota.PAGADA);
        assertThat(dic.getEstado()).isEqualTo(EstadoCuota.PAGADA);
    }

    @Test
    @DisplayName("No se pueden pagar cuotas de otro alumno (403)")
    void noPagarCuotaAjena() {
        Cuota ajena = cuota(20L, otroAlumno, "Mensualidad Noviembre", 319000, 11);
        when(cuotaRepository.findAllById(anyList())).thenReturn(List.of(ajena));

        assertThatThrownBy(() -> boletaService.pagar(new PagoRequest(List.of(20L), "WEBPAY")))
                .isInstanceOf(AccesoDenegadoException.class);
        verify(boletaRepository, never()).save(any());
    }

    @Test
    @DisplayName("No se puede pagar dos veces la misma cuota (400)")
    void noPagarCuotaYaPagada() {
        Cuota pagada = cuota(10L, alumno, "Mensualidad Octubre", 319000, 10);
        pagada.setEstado(EstadoCuota.PAGADA);
        when(cuotaRepository.findAllById(anyList())).thenReturn(List.of(pagada));

        assertThatThrownBy(() -> boletaService.pagar(new PagoRequest(List.of(10L), "WEBPAY")))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("ya está pagada");
    }

    @Test
    @DisplayName("Si una cuota no existe, se rechaza el pago completo (404)")
    void cuotaInexistente() {
        when(cuotaRepository.findAllById(anyList())).thenReturn(List.of());

        assertThatThrownBy(() -> boletaService.pagar(new PagoRequest(List.of(99L), "WEBPAY")))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    @DisplayName("Un profesor no puede pagar cuotas (403)")
    void profesorNoPaga() {
        TestSeguridad.autenticarComo(5L, Rol.PROFESOR);

        assertThatThrownBy(() -> boletaService.pagar(new PagoRequest(List.of(10L), "WEBPAY")))
                .isInstanceOf(AccesoDenegadoException.class);
    }

    private Usuario usuario(Long id, String nombre) {
        Usuario u = new Usuario(nombre, id + "-K", nombre.toLowerCase() + "@duocuc.cl", "x", Rol.ALUMNO, null, null);
        u.setId(id);
        return u;
    }

    private Cuota cuota(Long id, Usuario dueno, String concepto, int monto, int mes) {
        Cuota c = new Cuota(dueno, mensualidad, concepto, monto, LocalDate.of(2026, mes, 25), "2026-2");
        c.setId(id);
        return c;
    }
}
