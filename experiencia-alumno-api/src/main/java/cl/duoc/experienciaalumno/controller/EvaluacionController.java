package cl.duoc.experienciaalumno.controller;

import cl.duoc.experienciaalumno.dto.AcademicoDto.EvaluacionRequest;
import cl.duoc.experienciaalumno.dto.AcademicoDto.EvaluacionResponse;
import cl.duoc.experienciaalumno.service.EvaluacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/evaluaciones")
@Tag(name = "4. Evaluaciones", description = "El profesor las crea; el alumno las ve como próximas evaluaciones")
public class EvaluacionController {

    private final EvaluacionService evaluacionService;

    public EvaluacionController(EvaluacionService evaluacionService) {
        this.evaluacionService = evaluacionService;
    }

    @GetMapping("/proximas")
    @Operation(summary = "Próximas evaluaciones", description = "Desde hoy en adelante, de los cursos visibles para el usuario.")
    public List<EvaluacionResponse> proximas() {
        return evaluacionService.proximas();
    }

    @GetMapping("/curso/{cursoId}")
    @Operation(summary = "Evaluaciones de un curso", description = "ADMIN, profesor a cargo o alumno inscrito.")
    public List<EvaluacionResponse> porCurso(@PathVariable("cursoId") Long cursoId) {
        return evaluacionService.listarPorCurso(cursoId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROFESOR')")
    @Operation(summary = "Crear evaluación (PROFESOR del curso o ADMIN)",
            description = "La suma de porcentajes del curso no puede superar 100%.")
    public ResponseEntity<EvaluacionResponse> crear(@Valid @RequestBody EvaluacionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(evaluacionService.crear(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESOR')")
    @Operation(summary = "Actualizar evaluación (PROFESOR del curso o ADMIN)")
    public EvaluacionResponse actualizar(@PathVariable("id") Long id, @Valid @RequestBody EvaluacionRequest request) {
        return evaluacionService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESOR')")
    @Operation(summary = "Eliminar evaluación (PROFESOR del curso o ADMIN)", description = "No permite eliminar si ya tiene notas.")
    public ResponseEntity<Void> eliminar(@PathVariable("id") Long id) {
        evaluacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
