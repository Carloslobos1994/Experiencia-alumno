package cl.duoc.experienciaalumno.security;

import cl.duoc.experienciaalumno.model.Rol;
import cl.duoc.experienciaalumno.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Genera y valida los tokens JWT.
 *
 * - Access token (15 min): se envia en cada peticion en el header "Authorization: Bearer ...".
 * - Refresh token (7 dias): solo sirve para pedir un access token nuevo en /api/v1/auth/refresh.
 *
 * Ambos van firmados con HMAC-SHA256 usando la clave secreta app.jwt.secret (variable JWT_SECRET).
 * Si alguien modifica el token (por ejemplo, cambia el rol), la firma deja de coincidir y se rechaza.
 */
@Service
public class JwtService {

    public static final String TIPO_ACCESS = "access";
    public static final String TIPO_REFRESH = "refresh";

    private final SecretKey clave;
    private final long accessExpiracionMs;
    private final long refreshExpiracionMs;

    public JwtService(@Value("${app.jwt.secret}") String secreto,
                      @Value("${app.jwt.access-expiration-ms}") long accessExpiracionMs,
                      @Value("${app.jwt.refresh-expiration-ms}") long refreshExpiracionMs) {
        if (secreto == null || secreto.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("app.jwt.secret debe tener al menos 32 caracteres");
        }
        this.clave = Keys.hmacShaKeyFor(secreto.getBytes(StandardCharsets.UTF_8));
        this.accessExpiracionMs = accessExpiracionMs;
        this.refreshExpiracionMs = refreshExpiracionMs;
    }

    public String generarAccessToken(Usuario usuario) {
        return generar(usuario, TIPO_ACCESS, accessExpiracionMs);
    }

    public String generarRefreshToken(Usuario usuario) {
        return generar(usuario, TIPO_REFRESH, refreshExpiracionMs);
    }

    public long getAccessExpiracionSegundos() {
        return accessExpiracionMs / 1000;
    }

    private String generar(Usuario usuario, String tipo, long expiracionMs) {
        Date ahora = new Date();
        return Jwts.builder()
                .subject(usuario.getEmail())
                .claim("id", String.valueOf(usuario.getId()))
                .claim("rol", usuario.getRol().name())
                .claim("nombre", usuario.getNombre())
                .claim("tipo", tipo)
                .issuedAt(ahora)
                .expiration(new Date(ahora.getTime() + expiracionMs))
                .signWith(clave)
                .compact();
    }

    /**
     * Verifica firma, expiracion y tipo de token.
     * Devuelve el usuario contenido en el token, o vacio si el token no es valido.
     */
    public Optional<UsuarioAutenticado> validar(String token, String tipoEsperado) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(clave)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            if (!tipoEsperado.equals(claims.get("tipo", String.class))) {
                return Optional.empty();
            }
            Long id = Long.valueOf(claims.get("id", String.class));
            Rol rol = Rol.valueOf(claims.get("rol", String.class));
            return Optional.of(new UsuarioAutenticado(id, claims.getSubject(), rol));
        } catch (JwtException | IllegalArgumentException ex) {
            // Firma invalida, token expirado, mal formado o con datos inconsistentes
            return Optional.empty();
        }
    }
}
