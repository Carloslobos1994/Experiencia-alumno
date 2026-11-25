package cl.duoc.experienciaalumno.repository;

import cl.duoc.experienciaalumno.model.Nota;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotaRepository extends JpaRepository<Nota, Long> {

    List<Nota> findByEvaluacionIdOrderByAlumnoNombreAsc(Long evaluacionId);

    List<Nota> findByAlumnoIdAndEvaluacionCursoId(Long alumnoId, Long cursoId);

    Optional<Nota> findByEvaluacionIdAndAlumnoId(Long evaluacionId, Long alumnoId);

    boolean existsByEvaluacionId(Long evaluacionId);
}
