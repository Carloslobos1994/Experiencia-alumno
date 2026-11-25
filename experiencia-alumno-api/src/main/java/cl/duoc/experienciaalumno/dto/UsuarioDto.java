package cl.duoc.experienciaalumno.dto;

import cl.duoc.experienciaalumno.model.Rol;
import cl.duoc.experienciaalumno.model.Usuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** DTOs de usuarios. La contrasena nunca se devuelve en las respuestas. */
public final class UsuarioDto {

    private UsuarioDto() {
    }

    public record UsuarioRequest(
            @NotBlank(message = "El nombre es obligatorio") @Size(max = 120)
            String nombre,
            @NotBlank(message = "El RUT es obligatorio") @Size(max = 15)
            String rut,
            @NotBlank(message = "El correo es obligatorio") @Email(message = "El correo no tiene un formato válido")
            String email,
            @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
            String password,
            @NotNull(message = "El rol es obligatorio")
            Rol rol,
            String carrera,
            String sede,
            Boolean activo,
            @Size(max = 255) String fotoUrl) {
    }

    public record UsuarioResponse(
            Long id,
            String nombre,
            String rut,
            String email,
            Rol rol,
            String carrera,
            String sede,
            boolean activo,
            String fotoUrl) {

        public static UsuarioResponse from(Usuario u) {
            return new UsuarioResponse(u.getId(), u.getNombre(), u.getRut(), u.getEmail(),
                    u.getRol(), u.getCarrera(), u.getSede(), u.isActivo(), u.getFotoUrl());
        }
    }

    /** Version reducida para listas de contactos (mensajeria) y selects del frontend. */
    public record UsuarioResumen(Long id, String nombre, String email, Rol rol, String fotoUrl) {

        public static UsuarioResumen from(Usuario u) {
            return new UsuarioResumen(u.getId(), u.getNombre(), u.getEmail(), u.getRol(), u.getFotoUrl());
        }
    }
}
