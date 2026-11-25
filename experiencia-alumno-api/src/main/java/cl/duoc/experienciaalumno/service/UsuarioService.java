package cl.duoc.experienciaalumno.service;

import cl.duoc.experienciaalumno.dto.UsuarioDto.UsuarioRequest;
import cl.duoc.experienciaalumno.dto.UsuarioDto.UsuarioResponse;
import cl.duoc.experienciaalumno.exception.ApiExceptions.ConflictoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.RecursoNoEncontradoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.ReglaNegocioException;
import cl.duoc.experienciaalumno.model.Rol;
import cl.duoc.experienciaalumno.model.Usuario;
import cl.duoc.experienciaalumno.repository.UsuarioRepository;
import cl.duoc.experienciaalumno.security.SecurityUtils;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Gestion de usuarios (solo Administracion). */
@Service
@Transactional(readOnly = true)
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UsuarioResponse> listar(Rol rol) {
        List<Usuario> usuarios = (rol == null)
                ? usuarioRepository.findAllByOrderByRolAscNombreAsc()
                : usuarioRepository.findByRolAndActivoTrueOrderByNombreAsc(rol);
        return usuarios.stream().map(UsuarioResponse::from).toList();
    }

    public UsuarioResponse obtener(Long id) {
        return UsuarioResponse.from(buscar(id));
    }

    @Transactional
    public UsuarioResponse crear(UsuarioRequest req) {
        if (req.password() == null || req.password().isBlank()) {
            throw new ReglaNegocioException("La contraseña es obligatoria al crear un usuario");
        }
        String email = req.email().trim().toLowerCase();
        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictoException("Ya existe un usuario con el correo " + email);
        }
        if (usuarioRepository.existsByRut(req.rut().trim())) {
            throw new ConflictoException("Ya existe un usuario con el RUT " + req.rut());
        }
        Usuario usuario = new Usuario(req.nombre().trim(), req.rut().trim(), email,
                passwordEncoder.encode(req.password()), req.rol(), req.carrera(), req.sede());
        usuario.setActivo(req.activo() == null || req.activo());
        usuario.setFotoUrl(vacioANull(req.fotoUrl()));
        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponse actualizar(Long id, UsuarioRequest req) {
        Usuario usuario = buscar(id);
        String email = req.email().trim().toLowerCase();

        if (!usuario.getEmail().equalsIgnoreCase(email) && usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictoException("Ya existe un usuario con el correo " + email);
        }
        if (!usuario.getRut().equals(req.rut().trim()) && usuarioRepository.existsByRut(req.rut().trim())) {
            throw new ConflictoException("Ya existe un usuario con el RUT " + req.rut());
        }
        boolean desactivar = req.activo() != null && !req.activo();
        if (desactivar && id.equals(SecurityUtils.usuarioActual().id())) {
            throw new ReglaNegocioException("No puede desactivar su propia cuenta");
        }

        usuario.setNombre(req.nombre().trim());
        usuario.setRut(req.rut().trim());
        usuario.setEmail(email);
        usuario.setRol(req.rol());
        usuario.setCarrera(req.carrera());
        usuario.setSede(req.sede());
        usuario.setFotoUrl(vacioANull(req.fotoUrl()));
        if (req.activo() != null) {
            usuario.setActivo(req.activo());
        }
        // La contrasena solo se cambia si viene informada
        if (req.password() != null && !req.password().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(req.password()));
        }
        return UsuarioResponse.from(usuario);
    }

    /**
     * Eliminacion logica: se desactiva la cuenta en vez de borrarla,
     * para no perder su historial de boletas, notas y mensajes.
     */
    @Transactional
    public void desactivar(Long id) {
        if (id.equals(SecurityUtils.usuarioActual().id())) {
            throw new ReglaNegocioException("No puede desactivar su propia cuenta");
        }
        buscar(id).setActivo(false);
    }

    private static String vacioANull(String texto) {
        return (texto == null || texto.isBlank()) ? null : texto.trim();
    }

    private Usuario buscar(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario " + id + " no encontrado"));
    }
}
