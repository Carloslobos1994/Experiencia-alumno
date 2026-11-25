package cl.duoc.experienciaalumno.repository;

import cl.duoc.experienciaalumno.model.Mensaje;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MensajeRepository extends JpaRepository<Mensaje, Long> {

    List<Mensaje> findByDestinatarioIdOrderByFechaEnvioDesc(Long destinatarioId);

    List<Mensaje> findByRemitenteIdOrderByFechaEnvioDesc(Long remitenteId);

    long countByDestinatarioIdAndLeidoFalse(Long destinatarioId);
}
