package cl.duoc.experienciaalumno.service;

import cl.duoc.experienciaalumno.exception.ApiExceptions.AccesoDenegadoException;
import cl.duoc.experienciaalumno.model.Curso;
import cl.duoc.experienciaalumno.repository.InscripcionRepository;
import cl.duoc.experienciaalumno.security.UsuarioAutenticado;
import org.springframework.stereotype.Service;

/**
 * Reglas de propiedad (ownership) que @PreAuthorize no puede resolver solo con el rol:
 * un PROFESOR solo gestiona SUS cursos y un ALUMNO solo ve los cursos donde esta inscrito.
 */
@Service
public class PermisosService {

    private final InscripcionRepository inscripcionRepository;

    public PermisosService(InscripcionRepository inscripcionRepository) {
        this.inscripcionRepository = inscripcionRepository;
    }

    public boolean esProfesorDelCurso(Curso curso, UsuarioAutenticado usuario) {
        return usuario.esProfesor() && curso.getProfesor().getId().equals(usuario.id());
    }

    public boolean estaInscrito(Long alumnoId, Long cursoId) {
        return inscripcionRepository.existsByAlumnoIdAndCursoId(alumnoId, cursoId);
    }

    /** Crear/editar evaluaciones y notas: Administracion o el profesor a cargo. */
    public void verificarGestionCurso(Curso curso, UsuarioAutenticado usuario) {
        if (usuario.esAdmin() || esProfesorDelCurso(curso, usuario)) {
            return;
        }
        throw new AccesoDenegadoException("Solo el profesor a cargo del curso o Administración pueden realizar esta acción");
    }

    /** Ver un curso: Administracion, el profesor a cargo o un alumno inscrito. */
    public void verificarVerCurso(Curso curso, UsuarioAutenticado usuario) {
        if (usuario.esAdmin() || esProfesorDelCurso(curso, usuario)
                || (usuario.esAlumno() && estaInscrito(usuario.id(), curso.getId()))) {
            return;
        }
        throw new AccesoDenegadoException("No tiene acceso a este curso");
    }
}
