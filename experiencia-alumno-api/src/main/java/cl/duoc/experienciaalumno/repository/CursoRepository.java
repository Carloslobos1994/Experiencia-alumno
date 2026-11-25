package cl.duoc.experienciaalumno.repository;

import cl.duoc.experienciaalumno.model.Curso;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CursoRepository extends JpaRepository<Curso, Long> {

    List<Curso> findByProfesorIdOrderByNombreAsc(Long profesorId);

    List<Curso> findAllByOrderByNombreAsc();

    boolean existsByCodigoIgnoreCaseAndSeccionIgnoreCase(String codigo, String seccion);
}
