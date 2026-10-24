// // src/utils/validaciones.js

// Valida que el correo pertenezca estrictamente al dominio institucional de alumno
export function validarCorreoAlumno(correo) {
  return correo.endsWith("@duocuc.cl");
}

// Valida las credenciales de acceso para el inicio de sesión
export function validarCredenciales(usuario, password) {
  const USUARIO_CORRECTO = "carlos@duocuc.cl";
  const PASSWORD_CORRECTO = "12345678";

  return usuario === USUARIO_CORRECTO && password === PASSWORD_CORRECTO;
}