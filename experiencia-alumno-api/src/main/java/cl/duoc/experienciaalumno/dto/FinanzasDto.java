package cl.duoc.experienciaalumno.dto;

import cl.duoc.experienciaalumno.model.Boleta;
import cl.duoc.experienciaalumno.model.Categoria;
import cl.duoc.experienciaalumno.model.Cuota;
import cl.duoc.experienciaalumno.model.DetalleBoleta;
import cl.duoc.experienciaalumno.model.EstadoCuota;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/** DTOs del modulo de finanzas: categorias, cuotas (mensualidades) y boletas. */
public final class FinanzasDto {

    private FinanzasDto() {
    }

    // ---------- Categorias ----------

    public record CategoriaRequest(
            @NotBlank(message = "El nombre es obligatorio") @Size(max = 60) String nombre,
            @Size(max = 255) String descripcion) {
    }

    public record CategoriaResponse(Long id, String nombre, String descripcion) {

        public static CategoriaResponse from(Categoria c) {
            return new CategoriaResponse(c.getId(), c.getNombre(), c.getDescripcion());
        }
    }

    // ---------- Cuotas ----------

    public record CuotaRequest(
            @NotNull(message = "El alumno es obligatorio") Long alumnoId,
            @NotNull(message = "La categoría es obligatoria") Long categoriaId,
            @NotBlank(message = "El concepto es obligatorio") @Size(max = 120) String concepto,
            @NotNull(message = "El monto es obligatorio") @Positive(message = "El monto debe ser mayor a 0") Integer monto,
            @NotNull(message = "El vencimiento es obligatorio") LocalDate vencimiento,
            @Size(max = 20) String periodo) {
    }

    /** Carga masiva: crea la misma cuota para todos los alumnos activos. */
    public record CuotaLoteRequest(
            @NotNull(message = "La categoría es obligatoria") Long categoriaId,
            @NotBlank(message = "El concepto es obligatorio") @Size(max = 120) String concepto,
            @NotNull(message = "El monto es obligatorio") @Positive(message = "El monto debe ser mayor a 0") Integer monto,
            @NotNull(message = "El vencimiento es obligatorio") LocalDate vencimiento,
            @Size(max = 20) String periodo) {
    }

    public record CuotaResponse(
            Long id,
            Long alumnoId,
            String alumnoNombre,
            Long categoriaId,
            String categoriaNombre,
            String concepto,
            Integer monto,
            LocalDate vencimiento,
            String periodo,
            EstadoCuota estado) {

        public static CuotaResponse from(Cuota c) {
            return new CuotaResponse(c.getId(), c.getAlumno().getId(), c.getAlumno().getNombre(),
                    c.getCategoria().getId(), c.getCategoria().getNombre(), c.getConcepto(), c.getMonto(),
                    c.getVencimiento(), c.getPeriodo(), c.getEstado());
        }
    }

    public record LoteResponse(int creadas, int omitidas, List<CuotaResponse> cuotas) {
    }

    // ---------- Pago y boletas ----------

    public record PagoRequest(
            @NotEmpty(message = "Debe seleccionar al menos una cuota") List<Long> cuotaIds,
            @NotBlank(message = "El medio de pago es obligatorio")
            @Pattern(regexp = "WEBPAY|DEBITO|CREDITO|TRANSFERENCIA",
                    message = "Medio de pago inválido (WEBPAY, DEBITO, CREDITO o TRANSFERENCIA)")
            String medioPago) {
    }

    public record DetalleBoletaResponse(Long cuotaId, String concepto, String categoria, Integer monto) {

        public static DetalleBoletaResponse from(DetalleBoleta d) {
            return new DetalleBoletaResponse(d.getCuota().getId(), d.getCuota().getConcepto(),
                    d.getCuota().getCategoria().getNombre(), d.getMonto());
        }
    }

    public record BoletaResponse(
            Long id,
            String numero,
            Long alumnoId,
            String alumnoNombre,
            String alumnoRut,
            LocalDateTime fecha,
            Integer total,
            String medioPago,
            List<DetalleBoletaResponse> detalles) {

        public static BoletaResponse from(Boleta b) {
            List<DetalleBoletaResponse> detalles = b.getDetalles().stream().map(DetalleBoletaResponse::from).toList();
            return new BoletaResponse(b.getId(), b.getNumero(), b.getAlumno().getId(), b.getAlumno().getNombre(),
                    b.getAlumno().getRut(), b.getFecha(), b.getTotal(), b.getMedioPago(), detalles);
        }
    }
}
