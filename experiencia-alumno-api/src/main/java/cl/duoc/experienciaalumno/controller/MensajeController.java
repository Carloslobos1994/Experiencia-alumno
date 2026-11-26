package cl.duoc.experienciaalumno.controller;

import cl.duoc.experienciaalumno.dto.MensajeDto.MensajeRequest;
import cl.duoc.experienciaalumno.dto.MensajeDto.MensajeResponse;
import cl.duoc.experienciaalumno.dto.MensajeDto.NoLeidosResponse;
import cl.duoc.experienciaalumno.dto.UsuarioDto.UsuarioResumen;
import cl.duoc.experienciaalumno.service.MensajeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/mensajes")
@Tag(name = "9. Mensajes", description = "Mensajería interna entre alumnos, profesores y Administración")
public class MensajeController {

    private final MensajeService mensajeService;

    public MensajeController(MensajeService mensajeService) {
        this.mensajeService = mensajeService;
    }

    @GetMapping("/recibidos")
    @Operation(summary = "Bandeja de entrada")
    public List<MensajeResponse> recibidos() {
        return mensajeService.recibidos();
    }

    @GetMapping("/enviados")
    @Operation(summary = "Mensajes enviados")
    public List<MensajeResponse> enviados() {
        return mensajeService.enviados();
    }

    @GetMapping("/no-leidos")
    @Operation(summary = "Cantidad de mensajes no leídos")
    public NoLeidosResponse noLeidos() {
        return mensajeService.noLeidos();
    }

    @GetMapping("/contactos")
    @Operation(summary = "Contactos permitidos",
            description = "ALUMNO: Administración, sus profesores y sus compañeros de curso. "
                    + "PROFESOR: Administración y sus alumnos. ADMIN: todos.")
    public List<UsuarioResumen> contactos() {
        return mensajeService.contactos();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Ver mensaje", description = "Solo el remitente o el destinatario.")
    public MensajeResponse obtener(@PathVariable("id") Long id) {
        return mensajeService.obtener(id);
    }

    @PostMapping
    @Operation(summary = "Enviar mensaje o responder", description = "Para responder, informar respuestaAId.")
    public ResponseEntity<MensajeResponse> enviar(@Valid @RequestBody MensajeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mensajeService.enviar(request));
    }

    @PatchMapping("/{id}/leido")
    @Operation(summary = "Marcar como leído", description = "Solo el destinatario.")
    public MensajeResponse marcarLeido(@PathVariable("id") Long id) {
        return mensajeService.marcarLeido(id);
    }
}
