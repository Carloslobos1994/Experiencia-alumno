package cl.duoc.experienciaalumno.repository;

import cl.duoc.experienciaalumno.model.Boleta;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoletaRepository extends JpaRepository<Boleta, Long> {

    List<Boleta> findByAlumnoIdOrderByFechaDesc(Long alumnoId);

    List<Boleta> findAllByOrderByFechaDesc();
}
