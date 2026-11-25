package cl.duoc.experienciaalumno.dto;

import cl.duoc.experienciaalumno.model.Mensaje;
import cl.duoc.experienciaalumno.model.Rol;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/** DTOs de la mensajeria interna. */
public final class MensajeDto {

    private MensajeDto() {
    }

    public record MensajeRequest(
            @NotNull(message = "El destinatario es obligatorio") Long destinatarioId,
            @NotBlank(message = "El asunto es obligatorio") @Size(max = 150) String asunto,
            @NotBlank(message = "El mensaje no puede estar vacío") @Size(max = 2000) String cuerpo,
            Long respuestaAId) {
    }

    public record MensajeResponse(
            Long id,
            Long remitenteId,
            String remitenteNombre,
            Rol remitenteRol,
            Long destinatarioId,
            String destinatarioNombre,
            String asunto,
            String cuerpo,
            LocalDateTime fechaEnvio,
            boolean leido,
            Long respuestaAId) {

        public static MensajeResponse from(Mensaje m) {
            Long respuestaA = m.getRespuestaA() != null ? m.getRespuestaA().getId() : null;
            return new MensajeResponse(m.getId(), m.getRemitente().getId(), m.getRemitente().getNombre(),
                    m.getRemitente().getRol(), m.getDestinatario().getId(), m.getDestinatario().getNombre(),
                    m.getAsunto(), m.getCuerpo(), m.getFechaEnvio(), m.isLeido(), respuestaA);
        }
    }

    public record NoLeidosResponse(long noLeidos) {
    }
}
