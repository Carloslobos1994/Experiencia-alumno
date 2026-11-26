package cl.duoc.experienciaalumno.controller;

import cl.duoc.experienciaalumno.dto.EncuestaDto.EncuestaRequest;
import cl.duoc.experienciaalumno.dto.EncuestaDto.EncuestaResponse;
import cl.duoc.experienciaalumno.dto.EncuestaDto.RespuestaRequest;
import cl.duoc.experienciaalumno.dto.EncuestaDto.ResultadoEncuestaResponse;
import cl.duoc.experienciaalumno.service.EncuestaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/encuestas")
@Tag(name = "10. Encuesta docente", description = "ADMIN la crea, ALUMNO la responde, PROFESOR ve resultados anónimos")
public class EncuestaController {

    private final EncuestaService encuestaService;

    public EncuestaController(EncuestaService encuestaService) {
        this.encuestaService = encuestaService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROFESOR')")
    @Operation(summary = "Listar encuestas", description = "ADMIN: todas. PROFESOR: las de sus cursos.")
    public List<EncuestaResponse> listar() {
        return encuestaService.listar();
    }

    @GetMapping("/pendientes")
    @PreAuthorize("hasRole('ALUMNO')")
    @Operation(summary = "Encuestas pendientes (ALUMNO)", description = "Abiertas, de sus cursos y aún sin responder.")
    public List<EncuestaResponse> pendientes() {
        return encuestaService.pendientes();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear encuesta docente para un curso (ADMIN)")
    public ResponseEntity<EncuestaResponse> crear(@Valid @RequestBody EncuestaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(encuestaService.crear(request));
    }

    @PostMapping("/{id}/respuestas")
    @PreAuthorize("hasRole('ALUMNO')")
    @Operation(summary = "Responder encuesta (ALUMNO)", description = "Una sola respuesta por alumno. Escala 1 a 5.")
    public ResponseEntity<Void> responder(@PathVariable("id") Long id, @Valid @RequestBody RespuestaRequest request) {
        encuestaService.responder(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/{id}/resultados")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESOR')")
    @Operation(summary = "Resultados anónimos", description = "ADMIN o el profesor del curso. Solo promedios y comentarios, sin nombres.")
    public ResultadoEncuestaResponse resultados(@PathVariable("id") Long id) {
        return encuestaService.resultados(id);
    }

    @PatchMapping("/{id}/cerrar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cerrar encuesta (ADMIN)")
    public EncuestaResponse cerrar(@PathVariable("id") Long id) {
        return encuestaService.cerrar(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar encuesta y sus respuestas (ADMIN)")
    public ResponseEntity<Void> eliminar(@PathVariable("id") Long id) {
        encuestaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
