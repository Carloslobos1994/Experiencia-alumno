import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Login from "../views/LoginView";

describe("Prueba de navegador en Chromium - Componente Login", () => {
  beforeEach(() => {
    // Limpiamos el DOM del navegador entre cada test
    cleanup();
  });

  it("debería permitir escribir correo y contraseña en los campos", async () => {
    const user = userEvent.setup();

    render(<Login onLoginSuccess={() => {}} />);

    const inputUsuario = screen.getByLabelText(/correo institucional/i);
    const inputPassword = screen.getByLabelText(/contraseña/i);

    await user.type(inputUsuario, "carlos.lobos@duocuc.cl");
    await user.type(inputPassword, "123456");

    expect(inputUsuario).toHaveValue("carlos.lobos@duocuc.cl");
    expect(inputPassword).toHaveValue("123456");
  });

  it("debería disparar una alerta cuando el correo no es @duocuc.cl", async () => {
    const user = userEvent.setup();

    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<Login onLoginSuccess={() => {}} />);

    const inputUsuario = screen.getByLabelText(/correo institucional/i);
    const botonIngresar = screen.getByRole("button", { name: /ingresar/i });

    await user.type(inputUsuario, "correo@gmail.com");
    await user.click(botonIngresar);

    expect(alertSpy).toHaveBeenCalledWith(
      "Acceso restringido: Debe ingresar con su correo institucional @duocuc.cl"
    );

    alertSpy.mockRestore();
  });
});