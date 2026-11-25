package cl.duoc.experienciaalumno.config;

import cl.duoc.experienciaalumno.model.Boleta;
import cl.duoc.experienciaalumno.model.Categoria;
import cl.duoc.experienciaalumno.model.Cuota;
import cl.duoc.experienciaalumno.model.Curso;
import cl.duoc.experienciaalumno.model.DetalleBoleta;
import cl.duoc.experienciaalumno.model.Encuesta;
import cl.duoc.experienciaalumno.model.EstadoCuota;
import cl.duoc.experienciaalumno.model.Evaluacion;
import cl.duoc.experienciaalumno.model.Inscripcion;
import cl.duoc.experienciaalumno.model.Mensaje;
import cl.duoc.experienciaalumno.model.Nota;
import cl.duoc.experienciaalumno.model.RespuestaEncuesta;
import cl.duoc.experienciaalumno.model.Rol;
import cl.duoc.experienciaalumno.model.Usuario;
import cl.duoc.experienciaalumno.repository.BoletaRepository;
import cl.duoc.experienciaalumno.repository.CategoriaRepository;
import cl.duoc.experienciaalumno.repository.CuotaRepository;
import cl.duoc.experienciaalumno.repository.CursoRepository;
import cl.duoc.experienciaalumno.repository.EncuestaRepository;
import cl.duoc.experienciaalumno.repository.EvaluacionRepository;
import cl.duoc.experienciaalumno.repository.InscripcionRepository;
import cl.duoc.experienciaalumno.repository.MensajeRepository;
import cl.duoc.experienciaalumno.repository.NotaRepository;
import cl.duoc.experienciaalumno.repository.RespuestaEncuestaRepository;
import cl.duoc.experienciaalumno.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Datos iniciales para la demostracion. Solo se cargan si la tabla usuario esta vacia,
 * asi que en PostgreSQL se ejecuta una sola vez (no duplica datos al reiniciar).
 *
 * Usuarios: 1 Administracion/Finanzas, 2 profesores y los 4 integrantes del equipo como alumnos.
 * Contrasena de todos los usuarios de demostracion: Duoc2026!
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    public static final String PASSWORD_DEMO = "Duoc2026!";

    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final CursoRepository cursoRepository;
    private final InscripcionRepository inscripcionRepository;
    private final EvaluacionRepository evaluacionRepository;
    private final NotaRepository notaRepository;
    private final CuotaRepository cuotaRepository;
    private final BoletaRepository boletaRepository;
    private final MensajeRepository mensajeRepository;
    private final EncuestaRepository encuestaRepository;
    private final RespuestaEncuestaRepository respuestaRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, CategoriaRepository categoriaRepository,
                           CursoRepository cursoRepository, InscripcionRepository inscripcionRepository,
                           EvaluacionRepository evaluacionRepository, NotaRepository notaRepository,
                           CuotaRepository cuotaRepository, BoletaRepository boletaRepository,
                           MensajeRepository mensajeRepository, EncuestaRepository encuestaRepository,
                           RespuestaEncuestaRepository respuestaRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.categoriaRepository = categoriaRepository;
        this.cursoRepository = cursoRepository;
        this.inscripcionRepository = inscripcionRepository;
        this.evaluacionRepository = evaluacionRepository;
        this.notaRepository = notaRepository;
        this.cuotaRepository = cuotaRepository;
        this.boletaRepository = boletaRepository;
        this.mensajeRepository = mensajeRepository;
        this.encuestaRepository = encuestaRepository;
        this.respuestaRepository = respuestaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (usuarioRepository.count() > 0) {
            log.info("Datos iniciales ya cargados: se omite DataInitializer");
            return;
        }
        String pass = passwordEncoder.encode(PASSWORD_DEMO);

        // ---------- Usuarios ----------
        Usuario finanzas = usuarioRepository.save(new Usuario("María Finanzas", "9.999.999-9",
                "mariafinanzas@adminduocuc.cl", pass, Rol.ADMIN, null, "Plaza Oeste"));

        Usuario mario = usuarioRepository.save(new Usuario("Mario Adrián Huerta Silva", "12.345.678-5",
                "mari.huertas@profesorduocuc.cl", pass, Rol.PROFESOR, null, "Plaza Oeste"));
        Usuario dusty = usuarioRepository.save(new Usuario("Dusty César Tessini Panes", "13.456.789-2",
                "du.tessini@profesor.duocuc.cl", pass, Rol.PROFESOR, null, "Plaza Oeste"));
        mario.setFotoUrl("/avatars/mario.jpg");
        dusty.setFotoUrl("/avatars/dusty.jpg");

        String analista = "Analista Programador";
        String ingenieria = "Ingeniería en Informática";
        Usuario carlos = usuarioRepository.save(new Usuario("Carlos Iván Lobos Escobar", "11.111.111-1",
                "carlos.lobos@duocuc.cl", pass, Rol.ALUMNO, analista, "Plaza Oeste"));
        Usuario marcelo = usuarioRepository.save(new Usuario("Marcelo Pincheira", "22.222.222-2",
                "marcelo@duocuc.cl", pass, Rol.ALUMNO, ingenieria, "Plaza Oeste"));
        Usuario angelo = usuarioRepository.save(new Usuario("Angelo Olivares", "33.333.333-3",
                "angelo@duocuc.cl", pass, Rol.ALUMNO, ingenieria, "Plaza Oeste"));
        Usuario emilio = usuarioRepository.save(new Usuario("Emilio Núñez", "44.444.444-4",
                "emilio@duocuc.cl", pass, Rol.ALUMNO, ingenieria, "Plaza Oeste"));
        carlos.setFotoUrl("/avatars/carlos.jpg");
        marcelo.setFotoUrl("/avatars/marcelo.jpg");
        angelo.setFotoUrl("/avatars/angelo.jpg");
        emilio.setFotoUrl("/avatars/emilio.jpg");
        List<Usuario> alumnos = List.of(carlos, marcelo, angelo, emilio);

        // ---------- Categorias ----------
        Categoria mensualidad = categoriaRepository.save(new Categoria("Mensualidad", "Arancel mensual de la carrera"));
        categoriaRepository.save(new Categoria("Matrícula", "Matrícula semestral"));
        categoriaRepository.save(new Categoria("Certificado", "Certificados académicos y de alumno regular"));

        // ---------- Cursos e inscripciones ----------
        Curso fullstack = cursoRepository.save(new Curso("DSY1104", "001V", "Desarrollo Fullstack II", mario));
        Curso moviles = cursoRepository.save(new Curso("DSY1105", "002V", "Desarrollo de Aplicaciones Móviles", dusty));
        for (Usuario alumno : alumnos) {
            inscripcionRepository.save(new Inscripcion(alumno, fullstack));
            inscripcionRepository.save(new Inscripcion(alumno, moviles));
        }

        // ---------- Evaluaciones (creadas por cada profesor) ----------
        // Ponderacion por curso: 3 evaluaciones parciales (20% c/u) + Examen Transversal (40%) = 100%
        String salaFullstack = "Laboratorio Principal Sala 319";
        Evaluacion fs1 = evaluacionRepository.save(new Evaluacion(fullstack, "Evaluación Parcial 1 - Frontend React",
                "Entrega por encargo", LocalDate.of(2026, 9, 15), salaFullstack, 20,
                "Portal web en React + Vite con componentes Bootstrap y navegación entre vistas."));
        Evaluacion fs2 = evaluacionRepository.save(new Evaluacion(fullstack, "Evaluación Parcial 2 - Pruebas unitarias",
                "Entrega y presentación", LocalDate.of(2026, 10, 24), salaFullstack, 20,
                "Pruebas unitarias con Vitest y Testing Library sobre los componentes del portal."));
        evaluacionRepository.save(new Evaluacion(fullstack, "Evaluación Parcial 3 - Integración Backend y Frontend",
                "Entrega y presentación", LocalDate.of(2026, 11, 26), salaFullstack, 20,
                "API REST Spring Boot con JWT y roles, consumida desde React con Axios y desplegada en AWS EC2."));
        evaluacionRepository.save(new Evaluacion(fullstack, "Examen Transversal Full Stack II",
                "Examen transversal", LocalDate.of(2026, 12, 14), salaFullstack, 40,
                "Aplicación completa: frontend React, microservicio Spring Boot con persistencia en la nube y pruebas unitarias."));

        String salaMoviles = "Laboratorio 205";
        Evaluacion mv1 = evaluacionRepository.save(new Evaluacion(moviles, "Evaluación Formativa MVP",
                "Entrega por encargo", LocalDate.of(2026, 9, 20), salaMoviles, 20,
                "Producto mínimo viable de una app Android en Kotlin con sus pantallas principales."));
        Evaluacion mv2 = evaluacionRepository.save(new Evaluacion(moviles, "Solemne 1 - Arquitectura MVVM",
                "Prueba escrita", LocalDate.of(2026, 10, 30), salaMoviles, 20,
                "Arquitectura MVVM: ViewModel, LiveData/StateFlow y separación de capas."));
        evaluacionRepository.save(new Evaluacion(moviles, "Avance Proyecto Kotlin",
                "Entrega y presentación", LocalDate.of(2026, 12, 3), salaMoviles, 20,
                "Avance del proyecto Android en Kotlin consumiendo una API REST, con persistencia local."));
        evaluacionRepository.save(new Evaluacion(moviles, "Examen Transversal Aplicaciones Móviles",
                "Examen transversal", LocalDate.of(2026, 12, 15), salaMoviles, 40,
                "App móvil en Android Studio conectada a un backend en AWS, con pruebas unitarias."));

        // ---------- Notas de las evaluaciones ya rendidas ----------
        double[][] notas = {
                {6.5, 6.2, 6.7, 6.7}, // Carlos
                {6.8, 6.4, 6.2, 5.7}, // Marcelo
                {6.0, 5.8, 5.9, 6.1}, // Angelo
                {5.6, 6.0, 6.9, 6.8}  // Emilio
        };
        Evaluacion[] rendidas = {fs1, fs2, mv1, mv2};
        for (int a = 0; a < alumnos.size(); a++) {
            for (int e = 0; e < rendidas.length; e++) {
                notaRepository.save(new Nota(rendidas[e], alumnos.get(a), BigDecimal.valueOf(notas[a][e])));
            }
        }

        // ---------- Mensualidades: agosto a octubre pagadas (con boleta), noviembre y diciembre pendientes ----------
        String[] meses = {"Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"};
        for (Usuario alumno : alumnos) {
            List<Cuota> pagadas = new ArrayList<>();
            for (int i = 0; i < meses.length; i++) {
                Cuota cuota = new Cuota(alumno, mensualidad, "Mensualidad " + meses[i] + " 2026", 319000,
                        LocalDate.of(2026, 8 + i, 25), "2026-2");
                if (i < 3) {
                    cuota.setEstado(EstadoCuota.PAGADA);
                    pagadas.add(cuota);
                }
                cuotaRepository.save(cuota);
            }
            Boleta boleta = new Boleta();
            boleta.setAlumno(alumno);
            boleta.setMedioPago("WEBPAY");
            boleta.setFecha(LocalDate.of(2026, 10, 20).atTime(10, 30));
            int total = 0;
            for (Cuota c : pagadas) {
                boleta.agregarDetalle(new DetalleBoleta(c, c.getMonto()));
                total += c.getMonto();
            }
            boleta.setTotal(total);
            Boleta guardada = boletaRepository.save(boleta);
            guardada.setNumero(String.format("B-%06d", guardada.getId()));
        }

        // ---------- Mensajes internos ----------
        for (Usuario alumno : alumnos) {
            mensajeRepository.save(new Mensaje(mario, alumno, "Recordatorio Evaluación Parcial 3",
                    "Estimado(a) " + alumno.getNombre().split(" ")[0] + ": el jueves 26 de noviembre es la entrega "
                            + "y presentación de la EP3 en la Sala 319. Recuerde subir los repositorios públicos."));
            mensajeRepository.save(new Mensaje(finanzas, alumno, "Mensualidad de noviembre disponible",
                    "Su mensualidad de noviembre ya está disponible para pago en el portal. Vence el 25/11/2026."));
        }
        Mensaje consulta = mensajeRepository.save(new Mensaje(carlos, mario, "Consulta sobre la EP3",
                "Profesor, ¿podemos usar PostgreSQL en EC2 como base de datos relacional para la entrega?"));
        Mensaje respuesta = new Mensaje(mario, carlos, "RE: Consulta sobre la EP3",
                "Sí Carlos, PostgreSQL es una base de datos relacional válida. Documenten la conexión en el informe.");
        respuesta.setRespuestaA(consulta);
        mensajeRepository.save(respuesta);

        // Mensajes entre companeros (los alumnos tambien se comunican entre ellos)
        Mensaje coordinacion = mensajeRepository.save(new Mensaje(marcelo, carlos, "Coordinación EP3",
                "Carlos, ¿revisamos hoy la integración del frontend con Axios antes de la presentación?"));
        Mensaje respuestaCompanero = new Mensaje(carlos, marcelo, "RE: Coordinación EP3",
                "Dale Marcelo, a las 18:00 en la biblioteca. Le aviso a Angelo y Emilio.");
        respuestaCompanero.setRespuestaA(coordinacion);
        mensajeRepository.save(respuestaCompanero);

        // ---------- Encuesta docente ----------
        LocalDate cierre = LocalDate.now().plusDays(21);
        Encuesta encuestaFs = encuestaRepository.save(new Encuesta(fullstack, "Encuesta Docente 2026-2", cierre));
        encuestaRepository.save(new Encuesta(moviles, "Encuesta Docente 2026-2", cierre));

        RespuestaEncuesta r = new RespuestaEncuesta();
        r.setEncuesta(encuestaFs);
        r.setAlumno(angelo);
        r.setClaridad(5);
        r.setPuntualidad(4);
        r.setRetroalimentacion(5);
        r.setDominio(5);
        r.setComentario("Explica muy bien la integración entre React y Spring Boot.");
        respuestaRepository.save(r);

        log.info("==========================================================");
        log.info(" Datos de demostracion cargados. Contrasena: {}", PASSWORD_DEMO);
        log.info(" ADMIN    : mariafinanzas@adminduocuc.cl");
        log.info(" PROFESOR : mari.huertas@profesorduocuc.cl | du.tessini@profesor.duocuc.cl");
        log.info(" ALUMNO   : carlos.lobos@duocuc.cl | marcelo@duocuc.cl");
        log.info("            angelo@duocuc.cl | emilio@duocuc.cl");
        log.info(" Swagger  : http://localhost:8080/swagger-ui/index.html");
        log.info("==========================================================");
    }
}
