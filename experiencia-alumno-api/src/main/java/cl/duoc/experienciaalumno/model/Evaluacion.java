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

/**
 * Tabla EVALUACION: la crea el profesor para su curso.
 * El alumno la ve como etiqueta de "Proxima evaluacion" en su portal.
 */
@Entity
@Table(name = "evaluacion")
public class Evaluacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @Column(nullable = false, length = 120)
    private String titulo;

    @Column(nullable = false, length = 60)
    private String tipo;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(length = 60)
    private String sala;

    /** Breve descripcion de lo que se evalua (se muestra en la tarjeta del alumno). */
    @Column(length = 300)
    private String descripcion;

    /** Ponderacion de la evaluacion dentro del curso (1 a 100). */
    @Column(nullable = false)
    private Integer porcentaje;

    public Evaluacion() {
    }

    public Evaluacion(Curso curso, String titulo, String tipo, LocalDate fecha, String sala, Integer porcentaje) {
        this.curso = curso;
        this.titulo = titulo;
        this.tipo = tipo;
        this.fecha = fecha;
        this.sala = sala;
        this.porcentaje = porcentaje;
    }

    public Evaluacion(Curso curso, String titulo, String tipo, LocalDate fecha, String sala, Integer porcentaje,
                      String descripcion) {
        this(curso, titulo, tipo, fecha, sala, porcentaje);
        this.descripcion = descripcion;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Curso getCurso() { return curso; }
    public void setCurso(Curso curso) { this.curso = curso; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public String getSala() { return sala; }
    public void setSala(String sala) { this.sala = sala; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Integer getPorcentaje() { return porcentaje; }
    public void setPorcentaje(Integer porcentaje) { this.porcentaje = porcentaje; }
}
