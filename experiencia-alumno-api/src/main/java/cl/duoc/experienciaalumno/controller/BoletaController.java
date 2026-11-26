package cl.duoc.experienciaalumno.controller;

import cl.duoc.experienciaalumno.dto.FinanzasDto.BoletaResponse;
import cl.duoc.experienciaalumno.dto.FinanzasDto.PagoRequest;
import cl.duoc.experienciaalumno.service.BoletaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/boletas")
@Tag(name = "8. Boletas", description = "Pago del carrito de mensualidades y comprobantes")
public class BoletaController {

    private final BoletaService boletaService;

    public BoletaController(BoletaService boletaService) {
        this.boletaService = boletaService;
    }

    @PostMapping("/pagar")
    @PreAuthorize("hasRole('ALUMNO')")
    @Operation(summary = "Pagar cuotas del carrito (ALUMNO)",
            description = "Valida que las cuotas sean del alumno y estén pendientes; el total lo calcula el servidor.")
    public ResponseEntity<BoletaResponse> pagar(@Valid @RequestBody PagoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(boletaService.pagar(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar todas las boletas (ADMIN)")
    public List<BoletaResponse> listar() {
        return boletaService.listar();
    }

    @GetMapping("/mis-boletas")
    @PreAuthorize("hasRole('ALUMNO')")
    @Operation(summary = "Mis boletas (ALUMNO)")
    public List<BoletaResponse> misBoletas() {
        return boletaService.misBoletas();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ALUMNO')")
    @Operation(summary = "Detalle de boleta", description = "ADMIN o el alumno dueño de la boleta.")
    public BoletaResponse obtener(@PathVariable("id") Long id) {
        return boletaService.obtener(id);
    }
}
