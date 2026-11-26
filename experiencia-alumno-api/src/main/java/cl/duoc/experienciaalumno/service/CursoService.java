package cl.duoc.experienciaalumno.service;

import cl.duoc.experienciaalumno.dto.AcademicoDto.CursoRequest;
import cl.duoc.experienciaalumno.dto.AcademicoDto.CursoResponse;
import cl.duoc.experienciaalumno.dto.UsuarioDto.UsuarioResumen;
import cl.duoc.experienciaalumno.exception.ApiExceptions.ConflictoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.RecursoNoEncontradoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.ReglaNegocioException;
import cl.duoc.experienciaalumno.model.Curso;
import cl.duoc.experienciaalumno.model.Inscripcion;
import cl.duoc.experienciaalumno.model.Rol;
import cl.duoc.experienciaalumno.model.Usuario;
import cl.duoc.experienciaalumno.repository.CursoRepository;
import cl.duoc.experienciaalumno.repository.EncuestaRepository;
import cl.duoc.experienciaalumno.repository.EvaluacionRepository;
import cl.duoc.experienciaalumno.repository.InscripcionRepository;
import cl.duoc.experienciaalumno.repository.UsuarioRepository;
import cl.duoc.experienciaalumno.security.SecurityUtils;
import cl.duoc.experienciaalumno.security.UsuarioAutenticado;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Cursos e inscripciones. */
@Service
@Transactional(readOnly = true)
public class CursoService {

    private final CursoRepository cursoRepository;
    private final InscripcionRepository inscripcionRepository;
    private final UsuarioRepository usuarioRepository;
    private final EvaluacionRepository evaluacionRepository;
    private final EncuestaRepository encuestaRepository;
    private final PermisosService permisosService;

    public CursoService(CursoRepository cursoRepository, InscripcionRepository inscripcionRepository,
                        UsuarioRepository usuarioRepository, EvaluacionRepository evaluacionRepository,
                        EncuestaRepository encuestaRepository, PermisosService permisosService) {
        this.cursoRepository = cursoRepository;
        this.inscripcionRepository = inscripcionRepository;
        this.usuarioRepository = usuarioRepository;
        this.evaluacionRepository = evaluacionRepository;
        this.encuestaRepository = encuestaRepository;
        this.permisosService = permisosService;
    }

    /**
     * Devuelve los cursos segun el rol de quien consulta:
     * ADMIN = todos, PROFESOR = los que dicta, ALUMNO = en los que esta inscrito.
     */
    public List<CursoResponse> listar() {
        UsuarioAutenticado actual = SecurityUtils.usuarioActual();
        List<Curso> cursos;
        if (actual.esAdmin()) {
            cursos = cursoRepository.findAllByOrderByNombreAsc();
        } else if (actual.esProfesor()) {
            cursos = cursoRepository.findByProfesorIdOrderByNombreAsc(actual.id());
        } else {
            cursos = inscripcionRepository.findByAlumnoId(actual.id()).stream()
                    .map(Inscripcion::getCurso)
                    .sorted(Comparator.comparing(Curso::getNombre))
                    .toList();
        }
        return cursos.stream().map(this::aResponse).toList();
    }

    public CursoResponse obtener(Long id) {
        Curso curso = buscar(id);
        permisosService.verificarVerCurso(curso, SecurityUtils.usuarioActual());
        return aResponse(curso);
    }

    @Transactional
    public CursoResponse crear(CursoRequest req) {
        if (cursoRepository.existsByCodigoIgnoreCaseAndSeccionIgnoreCase(req.codigo().trim(), req.seccion().trim())) {
            throw new ConflictoException("Ya existe el curso " + req.codigo() + " sección " + req.seccion());
        }
        Curso curso = new Curso(req.codigo().trim().toUpperCase(), req.seccion().trim().toUpperCase(),
                req.nombre().trim(), buscarProfesor(req.profesorId()));
        return aResponse(cursoRepository.save(curso));
    }

    @Transactional
    public CursoResponse actualizar(Long id, CursoRequest req) {
        Curso curso = buscar(id);
        boolean cambiaClave = !curso.getCodigo().equalsIgnoreCase(req.codigo().trim())
                || !curso.getSeccion().equalsIgnoreCase(req.seccion().trim());
        if (cambiaClave && cursoRepository.existsByCodigoIgnoreCaseAndSeccionIgnoreCase(req.codigo().trim(), req.seccion().trim())) {
            throw new ConflictoException("Ya existe el curso " + req.codigo() + " sección " + req.seccion());
        }
        curso.setCodigo(req.codigo().trim().toUpperCase());
        curso.setSeccion(req.seccion().trim().toUpperCase());
        curso.setNombre(req.nombre().trim());
        curso.setProfesor(buscarProfesor(req.profesorId()));
        return aResponse(curso);
    }

    @Transactional
    public void eliminar(Long id) {
        Curso curso = buscar(id);
        if (evaluacionRepository.existsByCursoId(id) || encuestaRepository.existsByCursoId(id)) {
            throw new ReglaNegocioException("No se puede eliminar: el curso tiene evaluaciones o encuestas registradas");
        }
        inscripcionRepository.deleteAll(inscripcionRepository.findByCursoIdOrderByAlumnoNombreAsc(id));
        cursoRepository.delete(curso);
    }

    /** Alumnos inscritos en un curso (lo usa el profesor para subir notas). */
    public List<UsuarioResumen> alumnos(Long cursoId) {
        Curso curso = buscar(cursoId);
        permisosService.verificarGestionCurso(curso, SecurityUtils.usuarioActual());
        return inscripcionRepository.findByCursoIdOrderByAlumnoNombreAsc(cursoId).stream()
                .map(i -> UsuarioResumen.from(i.getAlumno()))
                .toList();
    }

    @Transactional
    public CursoResponse inscribir(Long cursoId, Long alumnoId) {
        Curso curso = buscar(cursoId);
        Usuario alumno = usuarioRepository.findById(alumnoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Alumno " + alumnoId + " no encontrado"));
        if (alumno.getRol() != Rol.ALUMNO) {
            throw new ReglaNegocioException("Solo se pueden inscribir usuarios con rol ALUMNO");
        }
        if (inscripcionRepository.existsByAlumnoIdAndCursoId(alumnoId, cursoId)) {
            throw new ConflictoException(alumno.getNombre() + " ya está inscrito en " + curso.getNombre());
        }
        inscripcionRepository.save(new Inscripcion(alumno, curso));
        return aResponse(curso);
    }

    @Transactional
    public void desinscribir(Long cursoId, Long alumnoId) {
        Inscripcion inscripcion = inscripcionRepository.findByAlumnoIdAndCursoId(alumnoId, cursoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("El alumno no está inscrito en este curso"));
        inscripcionRepository.delete(inscripcion);
    }

    private Usuario buscarProfesor(Long profesorId) {
        Usuario profesor = usuarioRepository.findById(profesorId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Profesor " + profesorId + " no encontrado"));
        if (profesor.getRol() != Rol.PROFESOR) {
            throw new ReglaNegocioException("El usuario asignado debe tener rol PROFESOR");
        }
        return profesor;
    }

    private Curso buscar(Long id) {
        return cursoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Curso " + id + " no encontrado"));
    }

    private CursoResponse aResponse(Curso curso) {
        return CursoResponse.from(curso, inscripcionRepository.countByCursoId(curso.getId()));
    }
}
