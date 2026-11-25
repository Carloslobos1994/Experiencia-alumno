package cl.duoc.experienciaalumno;

import cl.duoc.experienciaalumno.model.Rol;
import cl.duoc.experienciaalumno.security.UsuarioAutenticado;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

/** Utilidad para simular un usuario autenticado en las pruebas unitarias de servicios. */
public final class TestSeguridad {

    private TestSeguridad() {
    }

    public static void autenticarComo(Long id, Rol rol) {
        UsuarioAutenticado usuario = new UsuarioAutenticado(id, "test" + id + "@duocuc.cl", rol);
        var auth = new UsernamePasswordAuthenticationToken(usuario, null,
                List.of(new SimpleGrantedAuthority("ROLE_" + rol.name())));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    public static void limpiar() {
        SecurityContextHolder.clearContext();
    }
}
