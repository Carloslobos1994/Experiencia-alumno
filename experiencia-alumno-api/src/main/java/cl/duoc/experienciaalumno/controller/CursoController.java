package cl.duoc.experienciaalumno.controller;

import cl.duoc.experienciaalumno.dto.AcademicoDto.CursoRequest;
import cl.duoc.experienciaalumno.dto.AcademicoDto.CursoResponse;
import cl.duoc.experienciaalumno.dto.AcademicoDto.InscripcionRequest;
import cl.duoc.experienciaalumno.dto.UsuarioDto.UsuarioResumen;
import cl.duoc.experienciaalumno.service.CursoService;
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
@RequestMapping("/api/v1/cursos")
@Tag(name = "3. Cursos", description = "Cursos e inscripciones")
public class CursoController {

    private final CursoService cursoService;

    public CursoController(CursoService cursoService) {
        this.cursoService = cursoService;
    }

    @GetMapping
    @Operation(summary = "Listar cursos según rol",
            description = "ADMIN: todos. PROFESOR: los que dicta. ALUMNO: en los que está inscrito.")
    public List<CursoResponse> listar() {
        return cursoService.listar();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener curso", description = "ADMIN, profesor a cargo o alumno inscrito.")
    public CursoResponse obtener(@PathVariable("id") Long id) {
        return cursoService.obtener(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear curso (ADMIN)")
    public ResponseEntity<CursoResponse> crear(@Valid @RequestBody CursoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cursoService.crear(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar curso (ADMIN)")
    public CursoResponse actualizar(@PathVariable("id") Long id, @Valid @RequestBody CursoRequest request) {
        return cursoService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar curso (ADMIN)", description = "No permite eliminar si tiene evaluaciones o encuestas.")
    public ResponseEntity<Void> eliminar(@PathVariable("id") Long id) {
        cursoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/alumnos")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESOR')")
    @Operation(summary = "Alumnos inscritos", description = "ADMIN o el profesor a cargo del curso.")
    public List<UsuarioResumen> alumnos(@PathVariable("id") Long id) {
        return cursoService.alumnos(id);
    }

    @PostMapping("/{id}/inscripciones")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Inscribir alumno en el curso (ADMIN)")
    public ResponseEntity<CursoResponse> inscribir(@PathVariable("id") Long id, @Valid @RequestBody InscripcionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cursoService.inscribir(id, request.alumnoId()));
    }

    @DeleteMapping("/{id}/inscripciones/{alumnoId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Quitar alumno del curso (ADMIN)")
    public ResponseEntity<Void> desinscribir(@PathVariable("id") Long id, @PathVariable("alumnoId") Long alumnoId) {
        cursoService.desinscribir(id, alumnoId);
        return ResponseEntity.noContent().build();
    }
}
