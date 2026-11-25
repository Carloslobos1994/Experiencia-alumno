package cl.duoc.experienciaalumno.repository;

import cl.duoc.experienciaalumno.model.RespuestaEncuesta;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RespuestaEncuestaRepository extends JpaRepository<RespuestaEncuesta, Long> {

    List<RespuestaEncuesta> findByEncuestaId(Long encuestaId);

    boolean existsByEncuestaIdAndAlumnoId(Long encuestaId, Long alumnoId);

    long countByEncuestaId(Long encuestaId);

    void deleteByEncuestaId(Long encuestaId);
}
