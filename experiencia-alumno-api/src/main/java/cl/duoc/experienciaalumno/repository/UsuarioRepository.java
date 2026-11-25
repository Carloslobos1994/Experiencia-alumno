package cl.duoc.experienciaalumno.repository;

import cl.duoc.experienciaalumno.model.Rol;
import cl.duoc.experienciaalumno.model.Usuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByRut(String rut);

    List<Usuario> findByRolAndActivoTrueOrderByNombreAsc(Rol rol);

    List<Usuario> findAllByOrderByRolAscNombreAsc();
}
