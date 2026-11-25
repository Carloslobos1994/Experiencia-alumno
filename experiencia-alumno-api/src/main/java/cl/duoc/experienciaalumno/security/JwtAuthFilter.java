package cl.duoc.experienciaalumno.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Filtro que se ejecuta una vez por peticion:
 * 1. Lee el header "Authorization: Bearer <token>".
 * 2. Valida el token con JwtService.
 * 3. Si es valido, registra al usuario y su rol (ROLE_ADMIN, ROLE_PROFESOR o ROLE_ALUMNO)
 *    en el SecurityContext, para que @PreAuthorize pueda decidir.
 * Si no hay token o es invalido, la peticion sigue sin autenticacion y Spring Security responde 401
 * en las rutas protegidas.
 *
 * Nota: NO se anota con @Component a proposito. Se crea dentro de SecurityConfig para que
 * solo exista dentro de la cadena de Spring Security (si fuera @Component, Spring Boot lo
 * registraria ademas como filtro global y se ejecutaria fuera de esa cadena).
 */
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String PREFIJO = "Bearer ";

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (header != null && header.startsWith(PREFIJO)
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            String token = header.substring(PREFIJO.length());
            jwtService.validar(token, JwtService.TIPO_ACCESS).ifPresent(usuario -> {
                var autoridades = List.of(new SimpleGrantedAuthority("ROLE_" + usuario.rol().name()));
                var autenticacion = new UsernamePasswordAuthenticationToken(usuario, null, autoridades);
                SecurityContextHolder.getContext().setAuthentication(autenticacion);
            });
        }

        chain.doFilter(request, response);
    }
}
