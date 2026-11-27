-- Ejecutar en la EC2 dentro de:  sudo -u postgres psql
-- Reemplace CAMBIAR_PASSWORD por una contrasena propia (no la suba a GitHub).
-- Las tablas NO se crean aqui: las crea Hibernate al iniciar Spring Boot (ddl-auto=update).

CREATE USER experiencia_user WITH PASSWORD 'CAMBIAR_PASSWORD';
CREATE DATABASE experiencia_alumno OWNER experiencia_user;
GRANT ALL PRIVILEGES ON DATABASE experiencia_alumno TO experiencia_user;
