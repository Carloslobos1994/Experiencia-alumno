package cl.duoc.experienciaalumno.repository;

import cl.duoc.experienciaalumno.model.Encuesta;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EncuestaRepository extends JpaRepository<Encuesta, Long> {

    List<Encuesta> findAllByOrderByFechaCreacionDesc();

    List<Encuesta> findByCursoProfesorIdOrderByFechaCreacionDesc(Long profesorId);

    List<Encuesta> findByActivaTrueAndCursoIdIn(Collection<Long> cursoIds);

    boolean existsByCursoId(Long cursoId);
}
