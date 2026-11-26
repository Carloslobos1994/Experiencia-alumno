package cl.duoc.experienciaalumno.controller;

import cl.duoc.experienciaalumno.dto.AcademicoDto.NotaRequest;
import cl.duoc.experienciaalumno.dto.AcademicoDto.NotaResponse;
import cl.duoc.experienciaalumno.dto.AcademicoDto.ResumenCursoAlumno;
import cl.duoc.experienciaalumno.service.NotaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notas")
@Tag(name = "5. Notas", description = "El profesor califica (1.0 a 7.0); el alumno consulta notas y promedio")
public class NotaController {

    private final NotaService notaService;

    public NotaController(NotaService notaService) {
        this.notaService = notaService;
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROFESOR')")
    @Operation(summary = "Registrar o actualizar nota (PROFESOR del curso o ADMIN)",
            description = "Si el alumno ya tiene nota en esa evaluación, se actualiza (upsert).")
    public NotaResponse registrar(@Valid @RequestBody NotaRequest request) {
        return notaService.registrar(request);
    }

    @GetMapping("/evaluacion/{evaluacionId}")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESOR')")
    @Operation(summary = "Notas de una evaluación (PROFESOR del curso o ADMIN)")
    public List<NotaResponse> porEvaluacion(@PathVariable("evaluacionId") Long evaluacionId) {
        return notaService.listarPorEvaluacion(evaluacionId);
    }

    @GetMapping("/mis-notas")
    @PreAuthorize("hasRole('ALUMNO')")
    @Operation(summary = "Mis notas (ALUMNO)", description = "Cursos del alumno con evaluaciones, notas y promedio ponderado.")
    public List<ResumenCursoAlumno> misNotas() {
        return notaService.misNotas();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESOR')")
    @Operation(summary = "Eliminar nota (PROFESOR del curso o ADMIN)")
    public ResponseEntity<Void> eliminar(@PathVariable("id") Long id) {
        notaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
