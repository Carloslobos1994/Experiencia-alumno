package cl.duoc.experienciaalumno.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/** Tabla DETALLE_BOLETA: cada cuota pagada dentro de una boleta. */
@Entity
@Table(name = "detalle_boleta")
public class DetalleBoleta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "boleta_id", nullable = false)
    private Boleta boleta;

    /** Una cuota solo puede pagarse una vez, por eso la relacion es uno a uno (unique). */
    @OneToOne(optional = false)
    @JoinColumn(name = "cuota_id", nullable = false, unique = true)
    private Cuota cuota;

    /** Monto pagado en el momento (copia historica del monto de la cuota). */
    @Column(nullable = false)
    private Integer monto;

    public DetalleBoleta() {
    }

    public DetalleBoleta(Cuota cuota, Integer monto) {
        this.cuota = cuota;
        this.monto = monto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Boleta getBoleta() { return boleta; }
    public void setBoleta(Boleta boleta) { this.boleta = boleta; }

    public Cuota getCuota() { return cuota; }
    public void setCuota(Cuota cuota) { this.cuota = cuota; }

    public Integer getMonto() { return monto; }
    public void setMonto(Integer monto) { this.monto = monto; }
}
