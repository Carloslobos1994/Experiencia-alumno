package cl.duoc.experienciaalumno.service;

import cl.duoc.experienciaalumno.dto.AuthDto.LoginRequest;
import cl.duoc.experienciaalumno.dto.AuthDto.RefreshRequest;
import cl.duoc.experienciaalumno.dto.AuthDto.TokenResponse;
import cl.duoc.experienciaalumno.dto.UsuarioDto.UsuarioResponse;
import cl.duoc.experienciaalumno.exception.ApiExceptions.CredencialesInvalidasException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.RecursoNoEncontradoException;
import cl.duoc.experienciaalumno.model.Usuario;
import cl.duoc.experienciaalumno.repository.UsuarioRepository;
import cl.duoc.experienciaalumno.security.JwtService;
import cl.duoc.experienciaalumno.security.SecurityUtils;
import cl.duoc.experienciaalumno.security.UsuarioAutenticado;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Autenticacion:
 * - login: valida correo + contrasena (BCrypt) y entrega accessToken + refreshToken.
 * - refresh: con un refreshToken valido entrega tokens nuevos (renovacion).
 * - me: devuelve los datos del usuario del token (lo usa el frontend al recargar la pagina).
 */
@Service
@Transactional(readOnly = true)
public class AuthService {

    private static final String CREDENCIALES_INVALIDAS = "Correo o contraseña incorrectos";

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public TokenResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new CredencialesInvalidasException(CREDENCIALES_INVALIDAS));

        // Mismo mensaje para "no existe" y "contrasena incorrecta": no revelamos que correos existen.
        if (!passwordEncoder.matches(request.password(), usuario.getPassword())) {
            throw new CredencialesInvalidasException(CREDENCIALES_INVALIDAS);
        }
        if (!usuario.isActivo()) {
            throw new CredencialesInvalidasException("La cuenta está desactivada. Contacte a Administración");
        }
        return emitirTokens(usuario);
    }

    public TokenResponse refresh(RefreshRequest request) {
        UsuarioAutenticado datos = jwtService.validar(request.refreshToken(), JwtService.TIPO_REFRESH)
                .orElseThrow(() -> new CredencialesInvalidasException("La sesión expiró. Inicie sesión nuevamente"));

        // Se vuelve a consultar la base: si el usuario fue desactivado, no se renueva.
        Usuario usuario = usuarioRepository.findById(datos.id())
                .filter(Usuario::isActivo)
                .orElseThrow(() -> new CredencialesInvalidasException("La cuenta ya no está disponible"));
        return emitirTokens(usuario);
    }

    public UsuarioResponse me() {
        UsuarioAutenticado actual = SecurityUtils.usuarioActual();
        return usuarioRepository.findById(actual.id())
                .map(UsuarioResponse::from)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
    }

    private TokenResponse emitirTokens(Usuario usuario) {
        return new TokenResponse(
                jwtService.generarAccessToken(usuario),
                jwtService.generarRefreshToken(usuario),
                "Bearer",
                jwtService.getAccessExpiracionSegundos(),
                UsuarioResponse.from(usuario));
    }
}
