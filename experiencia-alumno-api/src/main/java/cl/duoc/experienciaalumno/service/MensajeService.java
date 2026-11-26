package cl.duoc.experienciaalumno.service;

import cl.duoc.experienciaalumno.dto.MensajeDto.MensajeRequest;
import cl.duoc.experienciaalumno.dto.MensajeDto.MensajeResponse;
import cl.duoc.experienciaalumno.dto.MensajeDto.NoLeidosResponse;
import cl.duoc.experienciaalumno.dto.UsuarioDto.UsuarioResumen;
import cl.duoc.experienciaalumno.exception.ApiExceptions.AccesoDenegadoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.RecursoNoEncontradoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.ReglaNegocioException;
import cl.duoc.experienciaalumno.model.Curso;
import cl.duoc.experienciaalumno.model.Inscripcion;
import cl.duoc.experienciaalumno.model.Mensaje;
import cl.duoc.experienciaalumno.model.Rol;
import cl.duoc.experienciaalumno.model.Usuario;
import cl.duoc.experienciaalumno.repository.CursoRepository;
import cl.duoc.experienciaalumno.repository.InscripcionRepository;
import cl.duoc.experienciaalumno.repository.MensajeRepository;
import cl.duoc.experienciaalumno.repository.UsuarioRepository;
import cl.duoc.experienciaalumno.security.SecurityUtils;
import cl.duoc.experienciaalumno.security.UsuarioAutenticado;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Mensajeria interna con reglas de contacto:
 * - ALUMNO: puede escribir a Administracion, a los profesores de sus cursos y a sus
 *   companeros (alumnos que comparten al menos un curso con el).
 * - PROFESOR: puede escribir a Administracion y a los alumnos de sus cursos.
 * - ADMIN: puede escribir a cualquier usuario activo.
 */
@Service
@Transactional(readOnly = true)
public class MensajeService {

    private final MensajeRepository mensajeRepository;
    private final UsuarioRepository usuarioRepository;
    private final InscripcionRepository inscripcionRepository;
    private final CursoRepository cursoRepository;

    public MensajeService(MensajeRepository mensajeRepository, UsuarioRepository usuarioRepository,
                          InscripcionRepository inscripcionRepository, CursoRepository cursoRepository) {
        this.mensajeRepository = mensajeRepository;
        this.usuarioRepository = usuarioRepository;
        this.inscripcionRepository = inscripcionRepository;
        this.cursoRepository = cursoRepository;
    }

    public List<MensajeResponse> recibidos() {
        Long id = SecurityUtils.usuarioActual().id();
        return mensajeRepository.findByDestinatarioIdOrderByFechaEnvioDesc(id).stream().map(MensajeResponse::from).toList();
    }

    public List<MensajeResponse> enviados() {
        Long id = SecurityUtils.usuarioActual().id();
        return mensajeRepository.findByRemitenteIdOrderByFechaEnvioDesc(id).stream().map(MensajeResponse::from).toList();
    }

    public NoLeidosResponse noLeidos() {
        return new NoLeidosResponse(mensajeRepository.countByDestinatarioIdAndLeidoFalse(SecurityUtils.usuarioActual().id()));
    }

    public MensajeResponse obtener(Long id) {
        Mensaje mensaje = buscar(id);
        verificarParticipante(mensaje, SecurityUtils.usuarioActual());
        return MensajeResponse.from(mensaje);
    }

    /** Usuarios a los que el usuario autenticado puede escribir. */
    public List<UsuarioResumen> contactos() {
        return calcularContactos(SecurityUtils.usuarioActual()).values().stream()
                .sorted(Comparator.comparing(Usuario::getRol).thenComparing(Usuario::getNombre))
                .map(UsuarioResumen::from)
                .toList();
    }

    @Transactional
    public MensajeResponse enviar(MensajeRequest req) {
        UsuarioAutenticado actual = SecurityUtils.usuarioActual();
        if (req.destinatarioId().equals(actual.id())) {
            throw new ReglaNegocioException("No puede enviarse un mensaje a sí mismo");
        }
        Usuario remitente = usuarioRepository.findById(actual.id())
                .orElseThrow(() -> new RecursoNoEncontradoException("Remitente no encontrado"));
        Usuario destinatario = usuarioRepository.findById(req.destinatarioId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Destinatario " + req.destinatarioId() + " no encontrado"));

        if (!calcularContactos(actual).containsKey(destinatario.getId())) {
            throw new AccesoDenegadoException("No puede enviar mensajes a este usuario");
        }

        Mensaje mensaje = new Mensaje(remitente, destinatario, req.asunto().trim(), req.cuerpo().trim());
        if (req.respuestaAId() != null) {
            Mensaje original = buscar(req.respuestaAId());
            verificarParticipante(original, actual);
            mensaje.setRespuestaA(original);
        }
        return MensajeResponse.from(mensajeRepository.save(mensaje));
    }

    @Transactional
    public MensajeResponse marcarLeido(Long id) {
        Mensaje mensaje = buscar(id);
        if (!mensaje.getDestinatario().getId().equals(SecurityUtils.usuarioActual().id())) {
            throw new AccesoDenegadoException("Solo el destinatario puede marcar el mensaje como leído");
        }
        mensaje.setLeido(true);
        return MensajeResponse.from(mensaje);
    }

    private Map<Long, Usuario> calcularContactos(UsuarioAutenticado actual) {
        Map<Long, Usuario> contactos = new LinkedHashMap<>();
        if (actual.esAdmin()) {
            usuarioRepository.findAllByOrderByRolAscNombreAsc().stream()
                    .filter(Usuario::isActivo)
                    .forEach(u -> contactos.put(u.getId(), u));
        } else {
            // Todos pueden escribir a Administracion
            usuarioRepository.findByRolAndActivoTrueOrderByNombreAsc(Rol.ADMIN)
                    .forEach(u -> contactos.put(u.getId(), u));

            if (actual.esAlumno()) {
                for (Inscripcion inscripcion : inscripcionRepository.findByAlumnoId(actual.id())) {
                    Curso curso = inscripcion.getCurso();
                    // Profesor del curso
                    if (curso.getProfesor().isActivo()) {
                        contactos.put(curso.getProfesor().getId(), curso.getProfesor());
                    }
                    // Companeros del mismo curso
                    inscripcionRepository.findByCursoIdOrderByAlumnoNombreAsc(curso.getId()).stream()
                            .map(Inscripcion::getAlumno)
                            .filter(Usuario::isActivo)
                            .forEach(a -> contactos.put(a.getId(), a));
                }
            } else if (actual.esProfesor()) {
                for (Curso curso : cursoRepository.findByProfesorIdOrderByNombreAsc(actual.id())) {
                    inscripcionRepository.findByCursoIdOrderByAlumnoNombreAsc(curso.getId()).stream()
                            .map(Inscripcion::getAlumno)
                            .filter(Usuario::isActivo)
                            .forEach(a -> contactos.put(a.getId(), a));
                }
            }
        }
        contactos.remove(actual.id());
        return contactos;
    }

    private void verificarParticipante(Mensaje mensaje, UsuarioAutenticado actual) {
        boolean participa = mensaje.getRemitente().getId().equals(actual.id())
                || mensaje.getDestinatario().getId().equals(actual.id());
        if (!participa) {
            throw new AccesoDenegadoException("No tiene acceso a este mensaje");
        }
    }

    private Mensaje buscar(Long id) {
        return mensajeRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Mensaje " + id + " no encontrado"));
    }
}
