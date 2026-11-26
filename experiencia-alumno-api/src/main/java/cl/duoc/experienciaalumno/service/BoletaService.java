package cl.duoc.experienciaalumno.service;

import cl.duoc.experienciaalumno.dto.FinanzasDto.BoletaResponse;
import cl.duoc.experienciaalumno.dto.FinanzasDto.PagoRequest;
import cl.duoc.experienciaalumno.exception.ApiExceptions.AccesoDenegadoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.RecursoNoEncontradoException;
import cl.duoc.experienciaalumno.exception.ApiExceptions.ReglaNegocioException;
import cl.duoc.experienciaalumno.model.Boleta;
import cl.duoc.experienciaalumno.model.Cuota;
import cl.duoc.experienciaalumno.model.DetalleBoleta;
import cl.duoc.experienciaalumno.model.EstadoCuota;
import cl.duoc.experienciaalumno.model.Usuario;
import cl.duoc.experienciaalumno.repository.BoletaRepository;
import cl.duoc.experienciaalumno.repository.CuotaRepository;
import cl.duoc.experienciaalumno.repository.UsuarioRepository;
import cl.duoc.experienciaalumno.security.SecurityUtils;
import cl.duoc.experienciaalumno.security.UsuarioAutenticado;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Pago del carrito de mensualidades y consulta de boletas. */
@Service
@Transactional(readOnly = true)
public class BoletaService {

    private final BoletaRepository boletaRepository;
    private final CuotaRepository cuotaRepository;
    private final UsuarioRepository usuarioRepository;

    public BoletaService(BoletaRepository boletaRepository, CuotaRepository cuotaRepository,
                         UsuarioRepository usuarioRepository) {
        this.boletaRepository = boletaRepository;
        this.cuotaRepository = cuotaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Paga las cuotas seleccionadas en el carrito y genera la boleta con su detalle.
     *
     * Reglas de negocio (todas en el servidor, el navegador no decide nada):
     * 1. Las cuotas deben existir.
     * 2. Deben pertenecer al alumno autenticado (no se pueden pagar cuotas ajenas).
     * 3. Deben estar PENDIENTES (no se paga dos veces).
     * 4. El total lo calcula el backend sumando los montos guardados en la base.
     * Todo ocurre en una transaccion: si algo falla, no se guarda nada.
     */
    @Transactional
    public BoletaResponse pagar(PagoRequest req) {
        UsuarioAutenticado actual = SecurityUtils.usuarioActual();
        if (!actual.esAlumno()) {
            throw new AccesoDenegadoException("Solo los alumnos pueden pagar cuotas");
        }

        List<Long> ids = req.cuotaIds().stream().distinct().toList();
        List<Cuota> cuotas = cuotaRepository.findAllById(ids);
        if (cuotas.size() != ids.size()) {
            throw new RecursoNoEncontradoException("Una o más cuotas seleccionadas no existen");
        }
        for (Cuota cuota : cuotas) {
            if (!cuota.getAlumno().getId().equals(actual.id())) {
                throw new AccesoDenegadoException("No puede pagar cuotas de otro alumno");
            }
            if (cuota.getEstado() == EstadoCuota.PAGADA) {
                throw new ReglaNegocioException("La cuota '" + cuota.getConcepto() + "' ya está pagada");
            }
        }

        Usuario alumno = usuarioRepository.findById(actual.id())
                .orElseThrow(() -> new RecursoNoEncontradoException("Alumno no encontrado"));

        Boleta boleta = new Boleta();
        boleta.setAlumno(alumno);
        boleta.setMedioPago(req.medioPago());

        int total = 0;
        List<Cuota> ordenadas = cuotas.stream().sorted(Comparator.comparing(Cuota::getVencimiento)).toList();
        for (Cuota cuota : ordenadas) {
            boleta.agregarDetalle(new DetalleBoleta(cuota, cuota.getMonto()));
            total += cuota.getMonto();
            cuota.setEstado(EstadoCuota.PAGADA);
        }
        boleta.setTotal(total);

        Boleta guardada = boletaRepository.save(boleta);
        guardada.setNumero(String.format("B-%06d", guardada.getId()));
        return BoletaResponse.from(guardada);
    }

    /** Administracion: todas las boletas. */
    public List<BoletaResponse> listar() {
        return boletaRepository.findAllByOrderByFechaDesc().stream().map(BoletaResponse::from).toList();
    }

    /** Alumno: solo sus boletas. */
    public List<BoletaResponse> misBoletas() {
        Long alumnoId = SecurityUtils.usuarioActual().id();
        return boletaRepository.findByAlumnoIdOrderByFechaDesc(alumnoId).stream().map(BoletaResponse::from).toList();
    }

    /** Detalle: Administracion o el alumno dueno de la boleta. */
    public BoletaResponse obtener(Long id) {
        Boleta boleta = boletaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Boleta " + id + " no encontrada"));
        UsuarioAutenticado actual = SecurityUtils.usuarioActual();
        if (!actual.esAdmin() && !boleta.getAlumno().getId().equals(actual.id())) {
            throw new AccesoDenegadoException("No tiene acceso a esta boleta");
        }
        return BoletaResponse.from(boleta);
    }
}
