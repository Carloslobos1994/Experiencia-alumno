package cl.duoc.experienciaalumno.controller;

import cl.duoc.experienciaalumno.dto.FinanzasDto.CategoriaRequest;
import cl.duoc.experienciaalumno.dto.FinanzasDto.CategoriaResponse;
import cl.duoc.experienciaalumno.service.CategoriaService;
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
@RequestMapping("/api/v1/categorias")
@Tag(name = "6. Categorías", description = "Tipos de cobro: Mensualidad, Matrícula, Certificado")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    @Operation(summary = "Listar categorías", description = "Cualquier usuario autenticado.")
    public List<CategoriaResponse> listar() {
        return categoriaService.listar();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener categoría por ID")
    public CategoriaResponse obtener(@PathVariable("id") Long id) {
        return categoriaService.obtener(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear categoría (ADMIN)")
    public ResponseEntity<CategoriaResponse> crear(@Valid @RequestBody CategoriaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoriaService.crear(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar categoría (ADMIN)")
    public CategoriaResponse actualizar(@PathVariable("id") Long id, @Valid @RequestBody CategoriaRequest request) {
        return categoriaService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar categoría (ADMIN)", description = "No permite eliminar si tiene cuotas asociadas.")
    public ResponseEntity<Void> eliminar(@PathVariable("id") Long id) {
        categoriaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
