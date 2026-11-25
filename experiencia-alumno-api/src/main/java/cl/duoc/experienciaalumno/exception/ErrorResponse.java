package cl.duoc.experienciaalumno.exception;

import java.time.LocalDateTime;
import java.util.Map;

/** Formato unico de error que recibe el frontend en cualquier fallo de la API. */
public record ErrorResponse(
        int status,
        String error,
        String mensaje,
        Map<String, String> detalles,
        LocalDateTime timestamp) {

    public static ErrorResponse of(int status, String error, String mensaje) {
        return new ErrorResponse(status, error, mensaje, Map.of(), LocalDateTime.now());
    }
}
