import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import HomeView from "../views/HomeView";

describe("Prueba de navegador en Chromium - Componente HomeView", () => {
  beforeEach(() => {
    cleanup();
  });

  it("debería abrir el modal con el correo del compañero y permitir enviar el mensaje tras completar asunto y descripción", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<HomeView cambiarVista={() => {}} />);

    
    const botonesMensaje = screen.getAllByRole("button", { name: /mensaje/i });
    await user.click(botonesMensaje[0]);

    
    const inputCorreo = screen.getByLabelText(/para \(correo institucional\):/i);
    expect(inputCorreo).toHaveValue("marcelo@duocuc.cl");
    expect(inputCorreo).toBeDisabled();

    
    const botonEnviarModal = screen.getByRole("button", { name: /^enviar mensaje$/i });
    expect(botonEnviarModal).toBeDisabled();

    
    const inputAsunto = screen.getByLabelText(/asunto \*/i);
    const inputDescripcion = screen.getByLabelText(/descripción \/ mensaje \*/i);

    await user.type(inputAsunto, "Reunión de avance TacticalDEV");
    await user.type(inputDescripcion, "Hola Marcelo, revisemos la integracion de Room hoy.");

    expect(botonEnviarModal).toBeEnabled();

    
    await user.click(botonEnviarModal);

    expect(alertSpy).toHaveBeenCalledWith(
      "Mensaje enviado con éxito a Marcelo Pincheira (marcelo@duocuc.cl)"
    );

    alertSpy.mockRestore();
  });
});