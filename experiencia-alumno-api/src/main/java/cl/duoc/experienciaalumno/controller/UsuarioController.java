package cl.duoc.experienciaalumno.controller;

import cl.duoc.experienciaalumno.dto.UsuarioDto.UsuarioRequest;
import cl.duoc.experienciaalumno.dto.UsuarioDto.UsuarioResponse;
import cl.duoc.experienciaalumno.model.Rol;
import cl.duoc.experienciaalumno.service.UsuarioService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/usuarios")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "2. Usuarios", description = "CRUD de usuarios (solo Administración)")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    @Operation(summary = "Listar usuarios", description = "Opcional: filtrar por rol (ADMIN, PROFESOR, ALUMNO).")
    public List<UsuarioResponse> listar(@RequestParam(name = "rol", required = false) Rol rol) {
        return usuarioService.listar(rol);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID")
    public UsuarioResponse obtener(@PathVariable("id") Long id) {
        return usuarioService.obtener(id);
    }

    @PostMapping
    @Operation(summary = "Crear usuario", description = "La contraseña se guarda cifrada con BCrypt.")
    public ResponseEntity<UsuarioResponse> crear(@Valid @RequestBody UsuarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.crear(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar usuario", description = "Si password viene vacío, se mantiene la contraseña actual.")
    public UsuarioResponse actualizar(@PathVariable("id") Long id, @Valid @RequestBody UsuarioRequest request) {
        return usuarioService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desactivar usuario", description = "Eliminación lógica: la cuenta queda inactiva y conserva su historial.")
    public ResponseEntity<Void> desactivar(@PathVariable("id") Long id) {
        usuarioService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
