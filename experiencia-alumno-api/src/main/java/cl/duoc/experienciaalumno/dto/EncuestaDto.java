package cl.duoc.experienciaalumno.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

/** DTOs de la encuesta docente. */
public final class EncuestaDto {

    private EncuestaDto() {
    }

    public record EncuestaRequest(
            @NotNull(message = "El curso es obligatorio") Long cursoId,
            @NotBlank(message = "El título es obligatorio") @Size(max = 150) String titulo,
            @NotNull(message = "La fecha de cierre es obligatoria")
            @FutureOrPresent(message = "La fecha de cierre no puede estar en el pasado")
            LocalDate fechaCierre) {
    }

    public record EncuestaResponse(
            Long id,
            Long cursoId,
            String cursoCodigo,
            String cursoNombre,
            String profesorNombre,
            String titulo,
            LocalDate fechaCierre,
            boolean activa,
            boolean abierta,
            long respuestas,
            long inscritos) {
    }

    /** Cada pregunta se responde en escala 1 (muy en desacuerdo) a 5 (muy de acuerdo). */
    public record RespuestaRequest(
            @NotNull @Min(value = 1, message = "Valor mínimo 1") @Max(value = 5, message = "Valor máximo 5") Integer claridad,
            @NotNull @Min(value = 1, message = "Valor mínimo 1") @Max(value = 5, message = "Valor máximo 5") Integer puntualidad,
            @NotNull @Min(value = 1, message = "Valor mínimo 1") @Max(value = 5, message = "Valor máximo 5") Integer retroalimentacion,
            @NotNull @Min(value = 1, message = "Valor mínimo 1") @Max(value = 5, message = "Valor máximo 5") Integer dominio,
            @Size(max = 500) String comentario) {
    }

    /** Resultados agregados y anonimos (no incluye nombres de alumnos). */
    public record ResultadoEncuestaResponse(
            Long encuestaId,
            String titulo,
            String cursoNombre,
            String profesorNombre,
            long respuestas,
            long inscritos,
            Double claridad,
            Double puntualidad,
            Double retroalimentacion,
            Double dominio,
            Double promedioGeneral,
            List<String> comentarios) {
    }
}
