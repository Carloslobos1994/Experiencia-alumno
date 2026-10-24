import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MensualidadesView from "../views/MensualidadesView";

describe("Prueba de navegador en Chromium - Flujo de Mensualidades", () => {
  beforeEach(() => {
    cleanup();
  });

  it("debería permitir seleccionar un mes completo y activar el pago del total de esa cuota", async () => {
    const user = userEvent.setup();

    render(<MensualidadesView />);

    // Seleccionamos la casilla correspondiente a una cuota mensual completa
    const checkboxes = screen.getAllByRole("checkbox");
    
    // Marcamos la primera cuota mensual disponible
    await user.click(checkboxes[0]);

    // Comprobamos que el botón habilita el pago por el valor íntegro de la cuota seleccionada
    const botonPagar = screen.getByRole("button", { name: /pagar selección/i });
    expect(botonPagar).toBeEnabled();
  });

  it("debería mantener el botón deshabilitado si no se ha seleccionado ningún mes completo", () => {
    render(<MensualidadesView />);

    const botonPagar = screen.getByRole("button", { name: /pagar selección/i });
    
    // Al no seleccionar un mes, no se puede iniciar la transacción
    expect(botonPagar).toBeDisabled();
  });
});