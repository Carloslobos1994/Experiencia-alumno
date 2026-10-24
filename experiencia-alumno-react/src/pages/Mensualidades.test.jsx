import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MensualidadesView from "../views/MensualidadesView"

describe("Prueba Unitaria - MensualidadesView", () => {
  it("debería renderizar el título de la vista y la carrera del alumno correctamente", () => {
    render(<MensualidadesView />);

    // Verificamos que el título principal exista en el DOM virtual
    expect(screen.getByText(/estado de mensualidades y aranceles/i)).toBeInTheDocument();
    
    // Verificamos que muestre información de la carrera
    expect(screen.getByText(/carrera: analista programador/i)).toBeInTheDocument();
  });
});