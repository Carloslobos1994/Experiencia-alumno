package cl.duoc.experienciaalumno.repository;

import cl.duoc.experienciaalumno.model.Inscripcion;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InscripcionRepository extends JpaRepository<Inscripcion, Long> {

    List<Inscripcion> findByAlumnoId(Long alumnoId);

    List<Inscripcion> findByCursoIdOrderByAlumnoNombreAsc(Long cursoId);

    List<Inscripcion> findByCursoProfesorId(Long profesorId);

    boolean existsByAlumnoIdAndCursoId(Long alumnoId, Long cursoId);

    Optional<Inscripcion> findByAlumnoIdAndCursoId(Long alumnoId, Long cursoId);

    long countByCursoId(Long cursoId);
}
