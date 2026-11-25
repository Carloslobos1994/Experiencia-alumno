package cl.duoc.experienciaalumno.model;

/**
 * Roles del sistema.
 * ADMIN    = Administracion / Finanzas (equivale a "Administrador" en la rubrica: acceso total).
 * PROFESOR = Docente (equivale a "Vendedor": acceso parcial, solo a sus cursos).
 * ALUMNO   = Estudiante (equivale a "Cliente": solo su portal y su carrito de mensualidades).
 */
public enum Rol {
    ADMIN,
    PROFESOR,
    ALUMNO
}
