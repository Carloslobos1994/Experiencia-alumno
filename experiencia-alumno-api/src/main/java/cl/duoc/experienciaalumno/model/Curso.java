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

/** Tabla CURSO: ramo dictado por un profesor (ej: DSY1104 - Desarrollo Fullstack II). */
@Entity
@Table(name = "curso", uniqueConstraints = @UniqueConstraint(columnNames = {"codigo", "seccion"}))
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String codigo;

    @Column(nullable = false, length = 10)
    private String seccion;

    @Column(nullable = false, length = 120)
    private String nombre;

    @ManyToOne(optional = false)
    @JoinColumn(name = "profesor_id", nullable = false)
    private Usuario profesor;

    public Curso() {
    }

    public Curso(String codigo, String seccion, String nombre, Usuario profesor) {
        this.codigo = codigo;
        this.seccion = seccion;
        this.nombre = nombre;
        this.profesor = profesor;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getSeccion() { return seccion; }
    public void setSeccion(String seccion) { this.seccion = seccion; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Usuario getProfesor() { return profesor; }
    public void setProfesor(Usuario profesor) { this.profesor = profesor; }
}
