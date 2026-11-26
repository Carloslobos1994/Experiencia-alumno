import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EscalaLikert from './EscalaLikert';
import ResultadosEncuesta from '../organisms/ResultadosEncuesta';

describe('EscalaLikert (molécula)', () => {
  it('muestra 5 opciones y notifica el valor elegido', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EscalaLikert id="claridad" pregunta="El docente explica con claridad" valor={undefined} onChange={onChange} />);

    expect(screen.getAllByRole('radio')).toHaveLength(5);
    await user.click(screen.getByLabelText('4'));
    expect(onChange).toHaveBeenCalledWith(4);
  });
});

describe('ResultadosEncuesta (organismo)', () => {
  const base = { titulo: 'Encuesta Docente 2026-2', cursoNombre: 'Desarrollo Fullstack II', profesorNombre: 'Mario', inscritos: 4 };

  it('sin respuestas muestra un aviso', () => {
    render(<ResultadosEncuesta resultado={{ ...base, respuestas: 0, comentarios: [] }} />);
    expect(screen.getByText(/aún no hay respuestas/i)).toBeInTheDocument();
  });

  it('muestra promedios y comentarios anónimos', () => {
    render(<ResultadosEncuesta resultado={{
      ...base, respuestas: 1, claridad: 5, puntualidad: 4, retroalimentacion: 2.5, dominio: 5,
      promedioGeneral: 4.13, comentarios: ['Explica muy bien'],
    }} />);
    expect(screen.getByText(/4.13 \/ 5/)).toBeInTheDocument();
    expect(screen.getByText(/explica muy bien/i)).toBeInTheDocument();
  });

  it('no muestra nada sin resultado', () => {
    const { container } = render(<ResultadosEncuesta resultado={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
