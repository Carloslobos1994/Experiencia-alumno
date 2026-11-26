import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Avatar from './Avatar';

describe('Avatar (átomo)', () => {
  it('muestra la foto de perfil cuando el usuario tiene fotoUrl', () => {
    render(<Avatar nombre="Carlos Lobos" fotoUrl="/avatars/carlos.jpg" />);
    expect(screen.getByAltText('Foto de Carlos Lobos')).toHaveAttribute('src', '/avatars/carlos.jpg');
  });

  it('sin foto muestra las iniciales', () => {
    render(<Avatar nombre="María Finanzas" />);
    expect(screen.getByLabelText('Avatar de María Finanzas')).toHaveTextContent('MF');
  });

  it('si la foto no carga, vuelve a las iniciales', () => {
    render(<Avatar nombre="Emilio Núñez" fotoUrl="/avatars/no-existe.jpg" />);
    fireEvent.error(screen.getByAltText('Foto de Emilio Núñez'));
    expect(screen.getByLabelText('Avatar de Emilio Núñez')).toHaveTextContent('EN');
  });
});
