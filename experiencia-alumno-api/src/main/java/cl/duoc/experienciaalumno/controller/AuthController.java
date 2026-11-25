package cl.duoc.experienciaalumno.controller;

import cl.duoc.experienciaalumno.dto.AuthDto.LoginRequest;
import cl.duoc.experienciaalumno.dto.AuthDto.RefreshRequest;
import cl.duoc.experienciaalumno.dto.AuthDto.TokenResponse;
import cl.duoc.experienciaalumno.dto.UsuarioDto.UsuarioResponse;
import cl.duoc.experienciaalumno.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "1. Autenticación", description = "Login con JWT, renovación de token y usuario actual")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @SecurityRequirements // endpoint publico: no exige token en Swagger
    @Operation(summary = "Iniciar sesión", description = "Valida correo y contraseña. Devuelve accessToken (15 min) y refreshToken (7 días).")
    public TokenResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    @SecurityRequirements
    @Operation(summary = "Renovar token", description = "Entrega tokens nuevos a partir de un refreshToken válido.")
    public TokenResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return authService.refresh(request);
    }

    @GetMapping("/me")
    @Operation(summary = "Usuario autenticado", description = "Datos del usuario dueño del token. El frontend lo usa al recargar la página.")
    public UsuarioResponse me() {
        return authService.me();
    }
}
