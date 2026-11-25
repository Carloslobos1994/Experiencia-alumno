package cl.duoc.experienciaalumno.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;

/**
 * Tabla RESPUESTA_ENCUESTA: respuesta de un alumno a una encuesta docente.
 * Se guarda quien respondio solo para impedir respuestas duplicadas;
 * al profesor se le muestran unicamente promedios y comentarios, sin nombres.
 */
@Entity
@Table(name = "respuesta_encuesta", uniqueConstraints = @UniqueConstraint(columnNames = {"encuesta_id", "alumno_id"}))
public class RespuestaEncuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "encuesta_id", nullable = false)
    private Encuesta encuesta;

    @ManyToOne(optional = false)
    @JoinColumn(name = "alumno_id", nullable = false)
    private Usuario alumno;

    /** Escala 1 a 5. */
    @Column(nullable = false)
    private Integer claridad;

    @Column(nullable = false)
    private Integer puntualidad;

    @Column(nullable = false)
    private Integer retroalimentacion;

    @Column(nullable = false)
    private Integer dominio;

    @Column(length = 500)
    private String comentario;

    @Column(nullable = false)
    private LocalDateTime fecha = LocalDateTime.now();

    public RespuestaEncuesta() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Encuesta getEncuesta() { return encuesta; }
    public void setEncuesta(Encuesta encuesta) { this.encuesta = encuesta; }

    public Usuario getAlumno() { return alumno; }
    public void setAlumno(Usuario alumno) { this.alumno = alumno; }

    public Integer getClaridad() { return claridad; }
    public void setClaridad(Integer claridad) { this.claridad = claridad; }

    public Integer getPuntualidad() { return puntualidad; }
    public void setPuntualidad(Integer puntualidad) { this.puntualidad = puntualidad; }

    public Integer getRetroalimentacion() { return retroalimentacion; }
    public void setRetroalimentacion(Integer retroalimentacion) { this.retroalimentacion = retroalimentacion; }

    public Integer getDominio() { return dominio; }
    public void setDominio(Integer dominio) { this.dominio = dominio; }

    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }

    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
}
