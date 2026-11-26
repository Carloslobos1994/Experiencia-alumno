package cl.duoc.experienciaalumno.service;

import cl.duoc.experienciaalumno.dto.AcademicoDto.NotaAlumnoItem;
import cl.duoc.experienciaalumno.dto.AcademicoDto.NotaRequest;
import cl.duoc.experienciaalumno.dto.AcademicoDto.NotaResponse;
import cl.duoc.experienciaalumno.dto.AcademicoDto.ResumenCursoAlumno;
import cl.duoc.experienciaalumno.exception.ApiExceptions.RecursoNoEncontradoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.ReglaNegocioException;
import cl.duoc.experienciaalumno.model.Curso;
import cl.duoc.experienciaalumno.model.Evaluacion;
import cl.duoc.experienciaalumno.model.Inscripcion;
import cl.duoc.experienciaalumno.model.Nota;
import cl.duoc.experienciaalumno.model.Rol;
import cl.duoc.experienciaalumno.model.Usuario;
import cl.duoc.experienciaalumno.repository.EvaluacionRepository;
import cl.duoc.experienciaalumno.repository.InscripcionRepository;
import cl.duoc.experienciaalumno.repository.NotaRepository;
import cl.duoc.experienciaalumno.repository.UsuarioRepository;
import cl.duoc.experienciaalumno.security.SecurityUtils;
import cl.duoc.experienciaalumno.security.UsuarioAutenticado;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Notas: el profesor califica y el alumno consulta sus notas con promedio ponderado. */
@Service
@Transactional(readOnly = true)
public class NotaService {

    private static final BigDecimal NOTA_MINIMA = new BigDecimal("1.0");
    private static final BigDecimal NOTA_MAXIMA = new BigDecimal("7.0");

    private final NotaRepository notaRepository;
    private final EvaluacionRepository evaluacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final InscripcionRepository inscripcionRepository;
    private final PermisosService permisosService;

    public NotaService(NotaRepository notaRepository, EvaluacionRepository evaluacionRepository,
                       UsuarioRepository usuarioRepository, InscripcionRepository inscripcionRepository,
                       PermisosService permisosService) {
        this.notaRepository = notaRepository;
        this.evaluacionRepository = evaluacionRepository;
        this.usuarioRepository = usuarioRepository;
        this.inscripcionRepository = inscripcionRepository;
        this.permisosService = permisosService;
    }

    /**
     * Registra o actualiza (upsert) la nota de un alumno en una evaluacion.
     * Reglas: solo el profesor del curso (o Administracion), alumno inscrito, nota entre 1.0 y 7.0.
     */
    @Transactional
    public NotaResponse registrar(NotaRequest req) {
        Evaluacion evaluacion = evaluacionRepository.findById(req.evaluacionId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Evaluación " + req.evaluacionId() + " no encontrada"));
        permisosService.verificarGestionCurso(evaluacion.getCurso(), SecurityUtils.usuarioActual());

        Usuario alumno = usuarioRepository.findById(req.alumnoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Alumno " + req.alumnoId() + " no encontrado"));
        if (alumno.getRol() != Rol.ALUMNO) {
            throw new ReglaNegocioException("Solo se pueden registrar notas a usuarios con rol ALUMNO");
        }
        if (!permisosService.estaInscrito(alumno.getId(), evaluacion.getCurso().getId())) {
            throw new ReglaNegocioException(alumno.getNombre() + " no está inscrito en " + evaluacion.getCurso().getNombre());
        }

        BigDecimal valor = validarValor(req.valor());

        Nota nota = notaRepository.findByEvaluacionIdAndAlumnoId(evaluacion.getId(), alumno.getId())
                .orElseGet(() -> new Nota(evaluacion, alumno, valor));
        nota.setValor(valor);
        return NotaResponse.from(notaRepository.save(nota));
    }

    public List<NotaResponse> listarPorEvaluacion(Long evaluacionId) {
        Evaluacion evaluacion = evaluacionRepository.findById(evaluacionId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Evaluación " + evaluacionId + " no encontrada"));
        permisosService.verificarGestionCurso(evaluacion.getCurso(), SecurityUtils.usuarioActual());
        return notaRepository.findByEvaluacionIdOrderByAlumnoNombreAsc(evaluacionId).stream()
                .map(NotaResponse::from).toList();
    }

    @Transactional
    public void eliminar(Long id) {
        Nota nota = notaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Nota " + id + " no encontrada"));
        permisosService.verificarGestionCurso(nota.getEvaluacion().getCurso(), SecurityUtils.usuarioActual());
        notaRepository.delete(nota);
    }

    /** Vista del alumno: cada curso con sus evaluaciones, notas y promedio ponderado. */
    public List<ResumenCursoAlumno> misNotas() {
        UsuarioAutenticado actual = SecurityUtils.usuarioActual();
        return inscripcionRepository.findByAlumnoId(actual.id()).stream()
                .map(Inscripcion::getCurso)
                .sorted(Comparator.comparing(Curso::getNombre))
                .map(curso -> resumenCurso(curso, actual.id()))
                .toList();
    }

    private ResumenCursoAlumno resumenCurso(Curso curso, Long alumnoId) {
        Map<Long, BigDecimal> notasPorEvaluacion = new HashMap<>();
        for (Nota n : notaRepository.findByAlumnoIdAndEvaluacionCursoId(alumnoId, curso.getId())) {
            notasPorEvaluacion.put(n.getEvaluacion().getId(), n.getValor());
        }
        List<NotaAlumnoItem> items = evaluacionRepository.findByCursoIdOrderByFechaAsc(curso.getId()).stream()
                .map(e -> new NotaAlumnoItem(e.getId(), e.getTitulo(), e.getTipo(), e.getFecha(),
                        e.getPorcentaje(), notasPorEvaluacion.get(e.getId())))
                .toList();

        int porcentajeEvaluado = items.stream()
                .filter(i -> i.nota() != null)
                .mapToInt(NotaAlumnoItem::porcentaje)
                .sum();
        return new ResumenCursoAlumno(curso.getId(), curso.getCodigo(), curso.getSeccion(), curso.getNombre(),
                curso.getProfesor().getNombre(), items, calcularPromedio(items), porcentajeEvaluado);
    }

    /**
     * Promedio ponderado de las evaluaciones que ya tienen nota:
     * suma(nota x porcentaje) / suma(porcentajes evaluados), redondeado a 1 decimal.
     * Devuelve null si todavia no hay notas.
     */
    public static BigDecimal calcularPromedio(List<NotaAlumnoItem> items) {
        BigDecimal sumaPonderada = BigDecimal.ZERO;
        int sumaPorcentajes = 0;
        for (NotaAlumnoItem item : items) {
            if (item.nota() != null) {
                sumaPonderada = sumaPonderada.add(item.nota().multiply(BigDecimal.valueOf(item.porcentaje())));
                sumaPorcentajes += item.porcentaje();
            }
        }
        if (sumaPorcentajes == 0) {
            return null;
        }
        return sumaPonderada.divide(BigDecimal.valueOf(sumaPorcentajes), 1, RoundingMode.HALF_UP);
    }

    static BigDecimal validarValor(BigDecimal valor) {
        if (valor == null || valor.compareTo(NOTA_MINIMA) < 0 || valor.compareTo(NOTA_MAXIMA) > 0) {
            throw new ReglaNegocioException("La nota debe estar entre 1.0 y 7.0");
        }
        return valor.setScale(1, RoundingMode.HALF_UP);
    }
}
