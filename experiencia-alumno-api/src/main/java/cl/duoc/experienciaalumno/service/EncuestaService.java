package cl.duoc.experienciaalumno.service;

import cl.duoc.experienciaalumno.dto.EncuestaDto.EncuestaRequest;
import cl.duoc.experienciaalumno.dto.EncuestaDto.EncuestaResponse;
import cl.duoc.experienciaalumno.dto.EncuestaDto.RespuestaRequest;
import cl.duoc.experienciaalumno.dto.EncuestaDto.ResultadoEncuestaResponse;
import cl.duoc.experienciaalumno.exception.ApiExceptions.AccesoDenegadoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.ConflictoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.RecursoNoEncontradoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.ReglaNegocioException;
import cl.duoc.experienciaalumno.model.Curso;
import cl.duoc.experienciaalumno.model.Encuesta;
import cl.duoc.experienciaalumno.model.Inscripcion;
import cl.duoc.experienciaalumno.model.RespuestaEncuesta;
import cl.duoc.experienciaalumno.model.Usuario;
import cl.duoc.experienciaalumno.repository.CursoRepository;
import cl.duoc.experienciaalumno.repository.EncuestaRepository;
import cl.duoc.experienciaalumno.repository.InscripcionRepository;
import cl.duoc.experienciaalumno.repository.RespuestaEncuestaRepository;
import cl.duoc.experienciaalumno.repository.UsuarioRepository;
import cl.duoc.experienciaalumno.security.SecurityUtils;
import cl.duoc.experienciaalumno.security.UsuarioAutenticado;
import java.time.LocalDate;
import java.util.List;
import java.util.OptionalDouble;
import java.util.function.ToIntFunction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Encuesta docente: el puente entre los tres roles.
 * ADMIN la crea para un curso -> ALUMNO inscrito la responde una vez -> PROFESOR ve resultados anonimos.
 */
@Service
@Transactional(readOnly = true)
public class EncuestaService {

    private final EncuestaRepository encuestaRepository;
    private final RespuestaEncuestaRepository respuestaRepository;
    private final CursoRepository cursoRepository;
    private final InscripcionRepository inscripcionRepository;
    private final UsuarioRepository usuarioRepository;
    private final PermisosService permisosService;

    public EncuestaService(EncuestaRepository encuestaRepository, RespuestaEncuestaRepository respuestaRepository,
                           CursoRepository cursoRepository, InscripcionRepository inscripcionRepository,
                           UsuarioRepository usuarioRepository, PermisosService permisosService) {
        this.encuestaRepository = encuestaRepository;
        this.respuestaRepository = respuestaRepository;
        this.cursoRepository = cursoRepository;
        this.inscripcionRepository = inscripcionRepository;
        this.usuarioRepository = usuarioRepository;
        this.permisosService = permisosService;
    }

    /** ADMIN ve todas; PROFESOR ve las de sus cursos. */
    public List<EncuestaResponse> listar() {
        UsuarioAutenticado actual = SecurityUtils.usuarioActual();
        List<Encuesta> encuestas;
        if (actual.esAdmin()) {
            encuestas = encuestaRepository.findAllByOrderByFechaCreacionDesc();
        } else if (actual.esProfesor()) {
            encuestas = encuestaRepository.findByCursoProfesorIdOrderByFechaCreacionDesc(actual.id());
        } else {
            throw new AccesoDenegadoException("Los alumnos consultan sus encuestas en /encuestas/pendientes");
        }
        return encuestas.stream().map(this::aResponse).toList();
    }

    /** ALUMNO: encuestas abiertas de sus cursos que todavia no ha respondido. */
    public List<EncuestaResponse> pendientes() {
        Long alumnoId = SecurityUtils.usuarioActual().id();
        List<Long> cursoIds = inscripcionRepository.findByAlumnoId(alumnoId).stream()
                .map(Inscripcion::getCurso).map(Curso::getId).toList();
        if (cursoIds.isEmpty()) {
            return List.of();
        }
        LocalDate hoy = LocalDate.now();
        return encuestaRepository.findByActivaTrueAndCursoIdIn(cursoIds).stream()
                .filter(e -> e.estaAbierta(hoy))
                .filter(e -> !respuestaRepository.existsByEncuestaIdAndAlumnoId(e.getId(), alumnoId))
                .map(this::aResponse)
                .toList();
    }

    @Transactional
    public EncuestaResponse crear(EncuestaRequest req) {
        Curso curso = cursoRepository.findById(req.cursoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Curso " + req.cursoId() + " no encontrado"));
        Encuesta encuesta = new Encuesta(curso, req.titulo().trim(), req.fechaCierre());
        return aResponse(encuestaRepository.save(encuesta));
    }

    /**
     * Reglas: encuesta abierta, alumno inscrito en el curso y una sola respuesta por alumno.
     */
    @Transactional
    public void responder(Long encuestaId, RespuestaRequest req) {
        UsuarioAutenticado actual = SecurityUtils.usuarioActual();
        Encuesta encuesta = buscar(encuestaId);

        if (!encuesta.estaAbierta(LocalDate.now())) {
            throw new ReglaNegocioException("La encuesta está cerrada");
        }
        if (!permisosService.estaInscrito(actual.id(), encuesta.getCurso().getId())) {
            throw new AccesoDenegadoException("Solo los alumnos inscritos en el curso pueden responder");
        }
        if (respuestaRepository.existsByEncuestaIdAndAlumnoId(encuestaId, actual.id())) {
            throw new ConflictoException("Ya respondiste esta encuesta");
        }

        Usuario alumno = usuarioRepository.findById(actual.id())
                .orElseThrow(() -> new RecursoNoEncontradoException("Alumno no encontrado"));
        RespuestaEncuesta respuesta = new RespuestaEncuesta();
        respuesta.setEncuesta(encuesta);
        respuesta.setAlumno(alumno);
        respuesta.setClaridad(req.claridad());
        respuesta.setPuntualidad(req.puntualidad());
        respuesta.setRetroalimentacion(req.retroalimentacion());
        respuesta.setDominio(req.dominio());
        respuesta.setComentario(req.comentario() == null ? null : req.comentario().trim());
        respuestaRepository.save(respuesta);
    }

    /** Resultados agregados (promedios y comentarios sin nombre). ADMIN o el profesor del curso. */
    public ResultadoEncuestaResponse resultados(Long encuestaId) {
        Encuesta encuesta = buscar(encuestaId);
        UsuarioAutenticado actual = SecurityUtils.usuarioActual();
        if (!actual.esAdmin() && !permisosService.esProfesorDelCurso(encuesta.getCurso(), actual)) {
            throw new AccesoDenegadoException("Solo Administración o el profesor del curso pueden ver los resultados");
        }
        return calcularResultados(encuesta, respuestaRepository.findByEncuestaId(encuestaId),
                inscripcionRepository.countByCursoId(encuesta.getCurso().getId()));
    }

    @Transactional
    public EncuestaResponse cerrar(Long encuestaId) {
        Encuesta encuesta = buscar(encuestaId);
        encuesta.setActiva(false);
        return aResponse(encuesta);
    }

    @Transactional
    public void eliminar(Long encuestaId) {
        Encuesta encuesta = buscar(encuestaId);
        respuestaRepository.deleteByEncuestaId(encuestaId);
        encuestaRepository.delete(encuesta);
    }

    static ResultadoEncuestaResponse calcularResultados(Encuesta encuesta, List<RespuestaEncuesta> respuestas, long inscritos) {
        Double claridad = promedio(respuestas, RespuestaEncuesta::getClaridad);
        Double puntualidad = promedio(respuestas, RespuestaEncuesta::getPuntualidad);
        Double retro = promedio(respuestas, RespuestaEncuesta::getRetroalimentacion);
        Double dominio = promedio(respuestas, RespuestaEncuesta::getDominio);
        Double general = respuestas.isEmpty() ? null
                : redondear((claridad + puntualidad + retro + dominio) / 4.0);
        List<String> comentarios = respuestas.stream()
                .map(RespuestaEncuesta::getComentario)
                .filter(c -> c != null && !c.isBlank())
                .toList();
        return new ResultadoEncuestaResponse(encuesta.getId(), encuesta.getTitulo(), encuesta.getCurso().getNombre(),
                encuesta.getCurso().getProfesor().getNombre(), respuestas.size(), inscritos,
                claridad, puntualidad, retro, dominio, general, comentarios);
    }

    private static Double promedio(List<RespuestaEncuesta> respuestas, ToIntFunction<RespuestaEncuesta> campo) {
        OptionalDouble prom = respuestas.stream().mapToInt(campo).average();
        return prom.isPresent() ? redondear(prom.getAsDouble()) : null;
    }

    private static double redondear(double valor) {
        return Math.round(valor * 100.0) / 100.0;
    }

    private EncuestaResponse aResponse(Encuesta e) {
        Curso c = e.getCurso();
        return new EncuestaResponse(e.getId(), c.getId(), c.getCodigo(), c.getNombre(), c.getProfesor().getNombre(),
                e.getTitulo(), e.getFechaCierre(), e.isActiva(), e.estaAbierta(LocalDate.now()),
                respuestaRepository.countByEncuestaId(e.getId()), inscripcionRepository.countByCursoId(c.getId()));
    }

    private Encuesta buscar(Long id) {
        return encuestaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Encuesta " + id + " no encontrada"));
    }
}
