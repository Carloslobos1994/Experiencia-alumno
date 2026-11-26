package cl.duoc.experienciaalumno.controller;

import cl.duoc.experienciaalumno.dto.FinanzasDto.CuotaLoteRequest;
import cl.duoc.experienciaalumno.dto.FinanzasDto.CuotaRequest;
import cl.duoc.experienciaalumno.dto.FinanzasDto.CuotaResponse;
import cl.duoc.experienciaalumno.dto.FinanzasDto.LoteResponse;
import cl.duoc.experienciaalumno.service.CuotaService;
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
@RequestMapping("/api/v1/cuotas")
@Tag(name = "7. Cuotas (mensualidades)", description = "Finanzas carga las cuotas; el alumno las ve en su carrito")
public class CuotaController {

    private final CuotaService cuotaService;

    public CuotaController(CuotaService cuotaService) {
        this.cuotaService = cuotaService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar cuotas (ADMIN)", description = "Opcional: filtrar por alumnoId.")
    public List<CuotaResponse> listar(@RequestParam(name = "alumnoId", required = false) Long alumnoId) {
        return cuotaService.listar(alumnoId);
    }

    @GetMapping("/mis-cuotas")
    @PreAuthorize("hasRole('ALUMNO')")
    @Operation(summary = "Mis cuotas (ALUMNO)", description = "El alumno se identifica por su token, no por la URL.")
    public List<CuotaResponse> misCuotas() {
        return cuotaService.misCuotas();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Asignar cuota a un alumno (ADMIN)")
    public ResponseEntity<CuotaResponse> crear(@Valid @RequestBody CuotaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cuotaService.crear(request));
    }

    @PostMapping("/lote")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Carga masiva de mensualidad (ADMIN)",
            description = "Crea la cuota para todos los alumnos activos; omite a quienes ya la tienen.")
    public ResponseEntity<LoteResponse> crearLote(@Valid @RequestBody CuotaLoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cuotaService.crearLote(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar cuota (ADMIN)", description = "Solo cuotas PENDIENTES.")
    public CuotaResponse actualizar(@PathVariable("id") Long id, @Valid @RequestBody CuotaRequest request) {
        return cuotaService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar cuota (ADMIN)", description = "Solo cuotas PENDIENTES.")
    public ResponseEntity<Void> eliminar(@PathVariable("id") Long id) {
        cuotaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
