package cl.duoc.experienciaalumno.security;

import cl.duoc.experienciaalumno.model.Rol;

/**
 * Datos del usuario que viajan dentro del JWT.
 * El filtro JwtAuthFilter lo deja en el SecurityContext para que los servicios sepan quien hace la peticion.
 */
public record UsuarioAutenticado(Long id, String email, Rol rol) {

    public boolean esAdmin() {
        return rol == Rol.ADMIN;
    }

    public boolean esProfesor() {
        return rol == Rol.PROFESOR;
    }

    public boolean esAlumno() {
        return rol == Rol.ALUMNO;
    }
}
