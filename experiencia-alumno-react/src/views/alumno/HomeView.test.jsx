import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomeView from './HomeView';
import { academicoService, encuestasService, finanzasService, mensajesService } from '../../api/servicios';

// Mocks: alumno autenticado y servicios de la API
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    usuario: {
      id: 4, nombre: 'Carlos Lobos', rut: '12.345.678-9', rol: 'ALUMNO',
      carrera: 'Analista Programador', sede: 'Plaza Oeste', fotoUrl: null,
    },
  }),
}));
vi.mock('../../api/servicios', () => ({
  academicoService: { proximasEvaluaciones: vi.fn(), cursos: vi.fn() },
  encuestasService: { pendientes: vi.fn() },
  mensajesService: { contactos: vi.fn(), noLeidos: vi.fn(), enviar: vi.fn() },
  finanzasService: { misCuotas: vi.fn() },
}));

const EVALUACIONES = [
  {
    id: 3, cursoCodigo: 'DSY1104', cursoNombre: 'Desarrollo Fullstack II', titulo: 'Evaluación Parcial 3',
    tipo: 'Entrega y presentación', fecha: '2026-11-26', sala: 'Laboratorio Principal Sala 319',
    porcentaje: 20, descripcion: 'Backend Spring Boot integrado con React.', profesorNombre: 'Profesor Fullstack',
  },
  {
    id: 4, cursoCodigo: 'DSY1104', cursoNombre: 'Desarrollo Fullstack II', titulo: 'Examen Transversal Full Stack II',
    tipo: 'Examen transversal', fecha: '2026-12-14', sala: 'Laboratorio Principal Sala 319',
    porcentaje: 40, descripcion: 'Proyecto completo con pruebas unitarias.', profesorNombre: 'Profesor Fullstack',
  },
];
const CONTACTOS = [{ id: 2, nombre: 'Mario Adrián Huerta Silva', email: 'mari.huertas@profesorduocuc.cl', rol: 'PROFESOR' }];

function renderizar() {
  return render(
    <MemoryRouter>
      <HomeView />
    </MemoryRouter>,
  );
}

describe('HomeView - panel del alumno', () => {
  beforeEach(() => {
    academicoService.proximasEvaluaciones.mockResolvedValue(EVALUACIONES);
    academicoService.cursos.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    encuestasService.pendientes.mockResolvedValue([{ id: 7 }]);
    mensajesService.contactos.mockResolvedValue(CONTACTOS);
    mensajesService.noLeidos.mockResolvedValue({ noLeidos: 2 });
  });

  it('muestra el perfil del alumno con sus datos', async () => {
    renderizar();
    expect(await screen.findByText('¡Bienvenido, Carlos Lobos!')).toBeInTheDocument();
    expect(screen.getByText(/Carrera: Analista Programador/)).toBeInTheDocument();
    expect(screen.getByText(/RUT 12.345.678-9/)).toBeInTheDocument();
  });

  it('muestra las próximas evaluaciones como cartas', async () => {
    renderizar();
    expect(await screen.findByText('Evaluación Parcial 3')).toBeInTheDocument();
    expect(screen.getByText('Examen Transversal Full Stack II')).toBeInTheDocument();
    expect(screen.getByText('Próximas evaluaciones')).toBeInTheDocument();
  });

  it('privacidad: NO muestra deuda ni montos de mensualidades', async () => {
    renderizar();
    await screen.findByText('¡Bienvenido, Carlos Lobos!');
    expect(finanzasService.misCuotas).not.toHaveBeenCalled();
    expect(screen.queryAllByText(/\$\s?\d/)).toHaveLength(0);
    expect(screen.queryByText(/deuda/i)).not.toBeInTheDocument();
  });

  it('invita a responder la encuesta docente pendiente', async () => {
    renderizar();
    const boton = await screen.findByRole('button', { name: /responder encuesta docente \(1\)/i });
    expect(boton).toHaveAttribute('href', '/alumno/encuestas');
  });

  it('escribe un mensaje al profesor desde el directorio de contactos', async () => {
    const user = userEvent.setup();
    mensajesService.enviar.mockResolvedValue({ id: 99 });
    renderizar();

    await user.click(await screen.findByRole('button', { name: 'Mensaje' }));
    expect(screen.getByText('Nuevo mensaje para Mario Adrián Huerta Silva')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Asunto *'), 'Consulta EP3');
    await user.type(screen.getByLabelText('Mensaje *'), '¿Se puede entregar en grupo?');
    await user.click(screen.getByRole('button', { name: 'Enviar Mensaje' }));

    expect(mensajesService.enviar).toHaveBeenCalledWith({
      destinatarioId: 2, asunto: 'Consulta EP3', cuerpo: '¿Se puede entregar en grupo?', respuestaAId: null,
    });
    expect(await screen.findByText('Mensaje enviado a Mario Adrián Huerta Silva')).toBeInTheDocument();
  });

  it('si el backend no responde muestra el error y mantiene el portafolio', async () => {
    academicoService.proximasEvaluaciones.mockRejectedValue(new Error('Network Error'));
    renderizar();
    expect(await screen.findByText(/no se pudo conectar con el servidor/i)).toBeInTheDocument();
    expect(screen.getByText('Mis Proyectos de Portafolio')).toBeInTheDocument();
  });
});
