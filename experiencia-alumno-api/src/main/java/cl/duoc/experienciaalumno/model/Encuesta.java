package cl.duoc.experienciaalumno.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Tabla ENCUESTA: encuesta docente que crea Administracion para un curso.
 * Une los tres roles: ADMIN la crea, ALUMNO la responde y PROFESOR ve los resultados (anonimos).
 */
@Entity
@Table(name = "encuesta")
public class Encuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(nullable = false)
    private LocalDate fechaCierre;

    @Column(nullable = false)
    private boolean activa = true;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    public Encuesta() {
    }

    public Encuesta(Curso curso, String titulo, LocalDate fechaCierre) {
        this.curso = curso;
        this.titulo = titulo;
        this.fechaCierre = fechaCierre;
    }

    /** Una encuesta acepta respuestas si esta activa y no ha pasado su fecha de cierre. */
    public boolean estaAbierta(LocalDate hoy) {
        return activa && !hoy.isAfter(fechaCierre);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Curso getCurso() { return curso; }
    public void setCurso(Curso curso) { this.curso = curso; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public LocalDate getFechaCierre() { return fechaCierre; }
    public void setFechaCierre(LocalDate fechaCierre) { this.fechaCierre = fechaCierre; }

    public boolean isActiva() { return activa; }
    public void setActiva(boolean activa) { this.activa = activa; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
