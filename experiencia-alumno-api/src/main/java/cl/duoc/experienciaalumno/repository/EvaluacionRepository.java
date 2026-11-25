package cl.duoc.experienciaalumno.repository;

import cl.duoc.experienciaalumno.model.Evaluacion;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EvaluacionRepository extends JpaRepository<Evaluacion, Long> {

    List<Evaluacion> findByCursoIdOrderByFechaAsc(Long cursoId);

    List<Evaluacion> findByCursoIdInAndFechaGreaterThanEqualOrderByFechaAsc(Collection<Long> cursoIds, LocalDate desde);

    boolean existsByCursoId(Long cursoId);

    /** Suma de porcentajes ya asignados en un curso (para no superar el 100%). */
    @Query("select coalesce(sum(e.porcentaje), 0) from Evaluacion e where e.curso.id = :cursoId")
    Long sumarPorcentajes(@Param("cursoId") Long cursoId);
}
