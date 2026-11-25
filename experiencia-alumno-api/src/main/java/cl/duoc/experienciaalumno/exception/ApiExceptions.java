package cl.duoc.experienciaalumno.exception;

/** Excepciones de negocio. Cada una se traduce a un codigo HTTP en GlobalExceptionHandler. */
public final class ApiExceptions {

    private ApiExceptions() {
    }

    /** 404: el recurso solicitado no existe. */
    public static class RecursoNoEncontradoException extends RuntimeException {
        public RecursoNoEncontradoException(String mensaje) {
            super(mensaje);
        }
    }

    /** 400: los datos son validos en formato, pero rompen una regla de negocio. */
    public static class ReglaNegocioException extends RuntimeException {
        public ReglaNegocioException(String mensaje) {
            super(mensaje);
        }
    }

    /** 409: el recurso ya existe (correo, RUT, inscripcion o respuesta duplicada). */
    public static class ConflictoException extends RuntimeException {
        public ConflictoException(String mensaje) {
            super(mensaje);
        }
    }

    /** 403: el usuario esta autenticado, pero no es dueno del recurso o no tiene permiso. */
    public static class AccesoDenegadoException extends RuntimeException {
        public AccesoDenegadoException(String mensaje) {
            super(mensaje);
        }
    }

    /** 401: credenciales o token invalidos. */
    public static class CredencialesInvalidasException extends RuntimeException {
        public CredencialesInvalidasException(String mensaje) {
            super(mensaje);
        }
    }
}
