package cl.duoc.experienciaalumno.repository;

import cl.duoc.experienciaalumno.model.Cuota;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CuotaRepository extends JpaRepository<Cuota, Long> {

    List<Cuota> findByAlumnoIdOrderByVencimientoAsc(Long alumnoId);

    List<Cuota> findAllByOrderByVencimientoAscIdAsc();

    boolean existsByAlumnoIdAndConceptoIgnoreCase(Long alumnoId, String concepto);

    boolean existsByCategoriaId(Long categoriaId);
}
