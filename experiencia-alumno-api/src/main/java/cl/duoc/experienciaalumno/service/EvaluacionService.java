package cl.duoc.experienciaalumno.service;

import cl.duoc.experienciaalumno.dto.AcademicoDto.EvaluacionRequest;
import cl.duoc.experienciaalumno.dto.AcademicoDto.EvaluacionResponse;
import cl.duoc.experienciaalumno.exception.ApiExceptions.RecursoNoEncontradoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.ReglaNegocioException;
import cl.duoc.experienciaalumno.model.Curso;
import cl.duoc.experienciaalumno.model.Evaluacion;
import cl.duoc.experienciaalumno.model.Inscripcion;
import cl.duoc.experienciaalumno.repository.CursoRepository;
import cl.duoc.experienciaalumno.repository.EvaluacionRepository;
import cl.duoc.experienciaalumno.repository.InscripcionRepository;
import cl.duoc.experienciaalumno.repository.NotaRepository;
import cl.duoc.experienciaalumno.security.SecurityUtils;
import cl.duoc.experienciaalumno.security.UsuarioAutenticado;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Evaluaciones: las crea el profesor y el alumno las ve como "proximas evaluaciones". */
@Service
@Transactional(readOnly = true)
public class EvaluacionService {

    private final EvaluacionRepository evaluacionRepository;
    private final CursoRepository cursoRepository;
    private final InscripcionRepository inscripcionRepository;
    private final NotaRepository notaRepository;
    private final PermisosService permisosService;

    public EvaluacionService(EvaluacionRepository evaluacionRepository, CursoRepository cursoRepository,
                             InscripcionRepository inscripcionRepository, NotaRepository notaRepository,
                             PermisosService permisosService) {
        this.evaluacionRepository = evaluacionRepository;
        this.cursoRepository = cursoRepository;
        this.inscripcionRepository = inscripcionRepository;
        this.notaRepository = notaRepository;
        this.permisosService = permisosService;
    }

    public List<EvaluacionResponse> listarPorCurso(Long cursoId) {
        Curso curso = buscarCurso(cursoId);
        permisosService.verificarVerCurso(curso, SecurityUtils.usuarioActual());
        return evaluacionRepository.findByCursoIdOrderByFechaAsc(cursoId).stream()
                .map(EvaluacionResponse::from).toList();
    }

    /** Evaluaciones desde hoy en adelante de los cursos visibles para el usuario. */
    public List<EvaluacionResponse> proximas() {
        UsuarioAutenticado actual = SecurityUtils.usuarioActual();
        List<Long> cursoIds;
        if (actual.esAdmin()) {
            cursoIds = cursoRepository.findAll().stream().map(Curso::getId).toList();
        } else if (actual.esProfesor()) {
            cursoIds = cursoRepository.findByProfesorIdOrderByNombreAsc(actual.id()).stream().map(Curso::getId).toList();
        } else {
            cursoIds = inscripcionRepository.findByAlumnoId(actual.id()).stream()
                    .map(Inscripcion::getCurso).map(Curso::getId).toList();
        }
        if (cursoIds.isEmpty()) {
            return List.of();
        }
        return evaluacionRepository
                .findByCursoIdInAndFechaGreaterThanEqualOrderByFechaAsc(cursoIds, LocalDate.now())
                .stream().map(EvaluacionResponse::from).toList();
    }

    @Transactional
    public EvaluacionResponse crear(EvaluacionRequest req) {
        Curso curso = buscarCurso(req.cursoId());
        permisosService.verificarGestionCurso(curso, SecurityUtils.usuarioActual());
        validarPorcentaje(curso.getId(), req.porcentaje(), 0);

        Evaluacion evaluacion = new Evaluacion(curso, req.titulo().trim(), req.tipo().trim(),
                req.fecha(), req.sala(), req.porcentaje(), req.descripcion());
        return EvaluacionResponse.from(evaluacionRepository.save(evaluacion));
    }

    @Transactional
    public EvaluacionResponse actualizar(Long id, EvaluacionRequest req) {
        Evaluacion evaluacion = buscar(id);
        permisosService.verificarGestionCurso(evaluacion.getCurso(), SecurityUtils.usuarioActual());
        if (!evaluacion.getCurso().getId().equals(req.cursoId())) {
            throw new ReglaNegocioException("No se puede mover una evaluación a otro curso");
        }
        validarPorcentaje(evaluacion.getCurso().getId(), req.porcentaje(), evaluacion.getPorcentaje());

        evaluacion.setTitulo(req.titulo().trim());
        evaluacion.setTipo(req.tipo().trim());
        evaluacion.setFecha(req.fecha());
        evaluacion.setSala(req.sala());
        evaluacion.setPorcentaje(req.porcentaje());
        evaluacion.setDescripcion(req.descripcion());
        return EvaluacionResponse.from(evaluacion);
    }

    @Transactional
    public void eliminar(Long id) {
        Evaluacion evaluacion = buscar(id);
        permisosService.verificarGestionCurso(evaluacion.getCurso(), SecurityUtils.usuarioActual());
        if (notaRepository.existsByEvaluacionId(id)) {
            throw new ReglaNegocioException("No se puede eliminar: la evaluación ya tiene notas registradas");
        }
        evaluacionRepository.delete(evaluacion);
    }

    /**
     * Regla de negocio: la suma de ponderaciones de un curso no puede superar el 100%.
     * @param porcentajeAnterior porcentaje que ya tenia la evaluacion (0 si es nueva)
     */
    void validarPorcentaje(Long cursoId, int porcentajeNuevo, int porcentajeAnterior) {
        long sumaActual = evaluacionRepository.sumarPorcentajes(cursoId);
        long total = sumaActual - porcentajeAnterior + porcentajeNuevo;
        if (total > 100) {
            throw new ReglaNegocioException("La suma de ponderaciones del curso quedaría en " + total
                    + "% (máximo 100%). Disponible: " + (100 - (sumaActual - porcentajeAnterior)) + "%");
        }
    }

    private Evaluacion buscar(Long id) {
        return evaluacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Evaluación " + id + " no encontrada"));
    }

    private Curso buscarCurso(Long id) {
        return cursoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Curso " + id + " no encontrado"));
    }
}
