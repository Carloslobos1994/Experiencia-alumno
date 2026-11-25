package cl.duoc.experienciaalumno.dto;

import cl.duoc.experienciaalumno.dto.UsuarioDto.UsuarioResponse;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** DTOs de autenticacion (login, refresh y respuesta con tokens). */
public final class AuthDto {

    private AuthDto() {
    }

    public record LoginRequest(
            @NotBlank(message = "El correo es obligatorio")
            @Email(message = "El correo no tiene un formato válido")
            String email,
            @NotBlank(message = "La contraseña es obligatoria")
            String password) {
    }

    public record RefreshRequest(
            @NotBlank(message = "El refresh token es obligatorio")
            String refreshToken) {
    }

    public record TokenResponse(
            String accessToken,
            String refreshToken,
            String tipo,
            long expiraEnSegundos,
            UsuarioResponse usuario) {
    }
}
