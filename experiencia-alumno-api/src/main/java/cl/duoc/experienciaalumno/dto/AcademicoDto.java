package cl.duoc.experienciaalumno.dto;

import cl.duoc.experienciaalumno.model.Curso;
import cl.duoc.experienciaalumno.model.Evaluacion;
import cl.duoc.experienciaalumno.model.Nota;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** DTOs del modulo academico: cursos, inscripciones, evaluaciones y notas. */
public final class AcademicoDto {

    private AcademicoDto() {
    }

    // ---------- Cursos ----------

    public record CursoRequest(
            @NotBlank(message = "El código es obligatorio") @Size(max = 20) String codigo,
            @NotBlank(message = "La sección es obligatoria") @Size(max = 10) String seccion,
            @NotBlank(message = "El nombre es obligatorio") @Size(max = 120) String nombre,
            @NotNull(message = "El profesor es obligatorio") Long profesorId) {
    }

    public record CursoResponse(
            Long id,
            String codigo,
            String seccion,
            String nombre,
            Long profesorId,
            String profesorNombre,
            String profesorEmail,
            long totalAlumnos) {

        public static CursoResponse from(Curso c, long totalAlumnos) {
            return new CursoResponse(c.getId(), c.getCodigo(), c.getSeccion(), c.getNombre(),
                    c.getProfesor().getId(), c.getProfesor().getNombre(), c.getProfesor().getEmail(), totalAlumnos);
        }
    }

    public record InscripcionRequest(@NotNull(message = "El alumno es obligatorio") Long alumnoId) {
    }

    // ---------- Evaluaciones ----------

    public record EvaluacionRequest(
            @NotNull(message = "El curso es obligatorio") Long cursoId,
            @NotBlank(message = "El título es obligatorio") @Size(max = 120) String titulo,
            @NotBlank(message = "El tipo es obligatorio") @Size(max = 60) String tipo,
            @NotNull(message = "La fecha es obligatoria") LocalDate fecha,
            @Size(max = 60) String sala,
            @NotNull(message = "El porcentaje es obligatorio")
            @Min(value = 1, message = "El porcentaje mínimo es 1")
            @Max(value = 100, message = "El porcentaje máximo es 100")
            Integer porcentaje,
            @Size(max = 300, message = "La descripción admite hasta 300 caracteres")
            String descripcion) {
    }

    public record EvaluacionResponse(
            Long id,
            Long cursoId,
            String cursoCodigo,
            String cursoNombre,
            String profesorNombre,
            String titulo,
            String tipo,
            LocalDate fecha,
            String sala,
            Integer porcentaje,
            String descripcion) {

        public static EvaluacionResponse from(Evaluacion e) {
            Curso c = e.getCurso();
            return new EvaluacionResponse(e.getId(), c.getId(), c.getCodigo(), c.getNombre(),
                    c.getProfesor().getNombre(), e.getTitulo(), e.getTipo(), e.getFecha(), e.getSala(), e.getPorcentaje(),
                    e.getDescripcion());
        }
    }

    // ---------- Notas ----------

    public record NotaRequest(
            @NotNull(message = "La evaluación es obligatoria") Long evaluacionId,
            @NotNull(message = "El alumno es obligatorio") Long alumnoId,
            @NotNull(message = "La nota es obligatoria")
            @DecimalMin(value = "1.0", message = "La nota mínima es 1.0")
            @DecimalMax(value = "7.0", message = "La nota máxima es 7.0")
            BigDecimal valor) {
    }

    public record NotaResponse(
            Long id,
            Long evaluacionId,
            String evaluacionTitulo,
            Long alumnoId,
            String alumnoNombre,
            BigDecimal valor) {

        public static NotaResponse from(Nota n) {
            return new NotaResponse(n.getId(), n.getEvaluacion().getId(), n.getEvaluacion().getTitulo(),
                    n.getAlumno().getId(), n.getAlumno().getNombre(), n.getValor());
        }
    }

    /** Una evaluacion del curso vista por el alumno, con su nota (null si aun no tiene). */
    public record NotaAlumnoItem(
            Long evaluacionId,
            String titulo,
            String tipo,
            LocalDate fecha,
            Integer porcentaje,
            BigDecimal nota) {
    }

    /** Resumen de un curso para el alumno: evaluaciones, notas y promedio ponderado. */
    public record ResumenCursoAlumno(
            Long cursoId,
            String codigo,
            String seccion,
            String nombre,
            String profesorNombre,
            List<NotaAlumnoItem> evaluaciones,
            BigDecimal promedio,
            Integer porcentajeEvaluado) {
    }
}
