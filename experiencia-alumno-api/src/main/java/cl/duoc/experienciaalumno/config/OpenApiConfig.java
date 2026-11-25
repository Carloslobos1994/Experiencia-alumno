package cl.duoc.experienciaalumno.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

/**
 * Documentacion Swagger / OpenAPI.
 * Agrega el boton "Authorize" para pegar el accessToken y probar los endpoints protegidos.
 */
@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Experiencia Alumno API",
                version = "v1",
                description = "API REST del portal Experiencia Alumno (DSY1104 - Evaluacion Parcial 3). "
                        + "1) Ejecute POST /api/v1/auth/login. 2) Copie el accessToken. "
                        + "3) Presione Authorize y peguelo (sin escribir 'Bearer').",
                contact = @Contact(name = "Equipo Experiencia Alumno - Duoc UC Plaza Oeste")),
        security = @SecurityRequirement(name = "bearerAuth"))
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT")
public class OpenApiConfig {
}
