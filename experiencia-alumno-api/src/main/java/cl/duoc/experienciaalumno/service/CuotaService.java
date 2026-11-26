package cl.duoc.experienciaalumno.service;

import cl.duoc.experienciaalumno.dto.FinanzasDto.CuotaLoteRequest;
import cl.duoc.experienciaalumno.dto.FinanzasDto.CuotaRequest;
import cl.duoc.experienciaalumno.dto.FinanzasDto.CuotaResponse;
import cl.duoc.experienciaalumno.dto.FinanzasDto.LoteResponse;
import cl.duoc.experienciaalumno.exception.ApiExceptions.RecursoNoEncontradoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.ReglaNegocioException;
import cl.duoc.experienciaalumno.model.Categoria;
import cl.duoc.experienciaalumno.model.Cuota;
import cl.duoc.experienciaalumno.model.EstadoCuota;
import cl.duoc.experienciaalumno.model.Rol;
import cl.duoc.experienciaalumno.model.Usuario;
import cl.duoc.experienciaalumno.repository.CategoriaRepository;
import cl.duoc.experienciaalumno.repository.CuotaRepository;
import cl.duoc.experienciaalumno.repository.UsuarioRepository;
import cl.duoc.experienciaalumno.security.SecurityUtils;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Cuotas / mensualidades: Administracion (Finanzas) las carga y el alumno las paga. */
@Service
@Transactional(readOnly = true)
public class CuotaService {

    private final CuotaRepository cuotaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;

    public CuotaService(CuotaRepository cuotaRepository, UsuarioRepository usuarioRepository,
                        CategoriaRepository categoriaRepository) {
        this.cuotaRepository = cuotaRepository;
        this.usuarioRepository = usuarioRepository;
        this.categoriaRepository = categoriaRepository;
    }

    /** Administracion: todas las cuotas o las de un alumno. */
    public List<CuotaResponse> listar(Long alumnoId) {
        List<Cuota> cuotas = (alumnoId == null)
                ? cuotaRepository.findAllByOrderByVencimientoAscIdAsc()
                : cuotaRepository.findByAlumnoIdOrderByVencimientoAsc(alumnoId);
        return cuotas.stream().map(CuotaResponse::from).toList();
    }

    /** Alumno: solo sus propias cuotas (el id sale del token, no de la URL). */
    public List<CuotaResponse> misCuotas() {
        Long alumnoId = SecurityUtils.usuarioActual().id();
        return cuotaRepository.findByAlumnoIdOrderByVencimientoAsc(alumnoId).stream()
                .map(CuotaResponse::from).toList();
    }

    @Transactional
    public CuotaResponse crear(CuotaRequest req) {
        Cuota cuota = new Cuota(buscarAlumno(req.alumnoId()), buscarCategoria(req.categoriaId()),
                req.concepto().trim(), req.monto(), req.vencimiento(), req.periodo());
        return CuotaResponse.from(cuotaRepository.save(cuota));
    }

    /**
     * Carga masiva: crea la cuota para todos los alumnos activos.
     * Si un alumno ya tiene una cuota con el mismo concepto, se omite (evita cobros duplicados).
     */
    @Transactional
    public LoteResponse crearLote(CuotaLoteRequest req) {
        Categoria categoria = buscarCategoria(req.categoriaId());
        List<CuotaResponse> creadas = new ArrayList<>();
        int omitidas = 0;
        for (Usuario alumno : usuarioRepository.findByRolAndActivoTrueOrderByNombreAsc(Rol.ALUMNO)) {
            if (cuotaRepository.existsByAlumnoIdAndConceptoIgnoreCase(alumno.getId(), req.concepto().trim())) {
                omitidas++;
                continue;
            }
            Cuota cuota = new Cuota(alumno, categoria, req.concepto().trim(), req.monto(), req.vencimiento(), req.periodo());
            creadas.add(CuotaResponse.from(cuotaRepository.save(cuota)));
        }
        return new LoteResponse(creadas.size(), omitidas, creadas);
    }

    @Transactional
    public CuotaResponse actualizar(Long id, CuotaRequest req) {
        Cuota cuota = buscar(id);
        verificarPendiente(cuota, "modificar");
        cuota.setAlumno(buscarAlumno(req.alumnoId()));
        cuota.setCategoria(buscarCategoria(req.categoriaId()));
        cuota.setConcepto(req.concepto().trim());
        cuota.setMonto(req.monto());
        cuota.setVencimiento(req.vencimiento());
        cuota.setPeriodo(req.periodo());
        return CuotaResponse.from(cuota);
    }

    @Transactional
    public void eliminar(Long id) {
        Cuota cuota = buscar(id);
        verificarPendiente(cuota, "eliminar");
        cuotaRepository.delete(cuota);
    }

    /** Regla de negocio: una cuota pagada forma parte de una boleta y no se puede alterar. */
    private void verificarPendiente(Cuota cuota, String accion) {
        if (cuota.getEstado() == EstadoCuota.PAGADA) {
            throw new ReglaNegocioException("No se puede " + accion + " una cuota que ya fue pagada");
        }
    }

    private Usuario buscarAlumno(Long id) {
        Usuario alumno = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Alumno " + id + " no encontrado"));
        if (alumno.getRol() != Rol.ALUMNO || !alumno.isActivo()) {
            throw new ReglaNegocioException("Las cuotas solo se asignan a alumnos activos");
        }
        return alumno;
    }

    private Categoria buscarCategoria(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría " + id + " no encontrada"));
    }

    private Cuota buscar(Long id) {
        return cuotaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cuota " + id + " no encontrada"));
    }
}
