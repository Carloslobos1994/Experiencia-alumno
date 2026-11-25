package cl.duoc.experienciaalumno.security;

import cl.duoc.experienciaalumno.exception.ApiExceptions.CredencialesInvalidasException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/** Acceso rapido al usuario autenticado de la peticion actual. */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static UsuarioAutenticado usuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UsuarioAutenticado usuario)) {
            throw new CredencialesInvalidasException("No hay un usuario autenticado");
        }
        return usuario;
    }
}
