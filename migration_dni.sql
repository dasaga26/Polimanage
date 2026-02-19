-- ============================================================
-- MIGRACIÓN: Agregar campo DNI a usuarios
-- Fecha: Febrero 2026
-- Propósito: Permitir almacenar DNI del usuario en el perfil
-- ============================================================

-- Agregar columna DNI a la tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS dni VARCHAR(20);

COMMENT ON COLUMN users.dni IS 'Documento Nacional de Identidad del usuario';

-- Nota: Esta migración se ejecuta automáticamente con la app
-- o puedes ejecutarla manualmente con: psql -U postgres -d polimanage -f migration_dni.sql
