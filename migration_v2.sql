-- ============================================================
-- MIGRACIÓN V2: Sistema de Autenticación Profesional
-- Fecha: Febrero 2026
-- Propósito: Agregar soporte para multi-device y refresh tokens
-- ============================================================

-- 1. Agregar SessionVersion a la tabla users
-- ============================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_version INT NOT NULL DEFAULT 1;

COMMENT ON COLUMN users.session_version IS 'V2: Versión de sesión para logout global. Incrementar invalida todas las sesiones.';

-- 2. Crear tabla refresh_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    device_id VARCHAR(255) NOT NULL UNIQUE,
    family_id UUID NOT NULL,
    current_token_hash VARCHAR(255) NOT NULL,
    session_version INT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    reason VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign Keys
    CONSTRAINT fk_refresh_sessions_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Crear índices para optimizar queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_refresh_sessions_user_id 
    ON refresh_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_refresh_sessions_family_id 
    ON refresh_sessions(family_id);

CREATE INDEX IF NOT EXISTS idx_refresh_sessions_expires_at 
    ON refresh_sessions(expires_at);

-- 4. Agregar comentarios a la tabla y columnas
-- ============================================================
COMMENT ON TABLE refresh_sessions IS 
    'V2: Sesiones de refresh token. Soporta multi-device y detección de robo.';

COMMENT ON COLUMN refresh_sessions.user_id IS 
    'Usuario propietario de la sesión';

COMMENT ON COLUMN refresh_sessions.device_id IS 
    'UUID único del dispositivo (navegador/app). Generado por el cliente.';

COMMENT ON COLUMN refresh_sessions.family_id IS 
    'UUID que agrupa una cadena de rotación de tokens. Usado para detección de reuso.';

COMMENT ON COLUMN refresh_sessions.current_token_hash IS 
    'Hash SHA-256 del único refresh token válido actualmente para esta familia.';

COMMENT ON COLUMN refresh_sessions.session_version IS 
    'Snapshot de users.session_version al crear/rotar. Para validar logout global.';

COMMENT ON COLUMN refresh_sessions.expires_at IS 
    'Fecha de expiración del refresh token. Sliding window (se renueva en cada refresh).';

COMMENT ON COLUMN refresh_sessions.revoked IS 
    'Si la sesión fue revocada (logout, reuso detectado, etc.)';

COMMENT ON COLUMN refresh_sessions.reason IS 
    'Razón de revocación: "logout", "reuse_detection", "global_logout", "replaced"';

-- 5. Crear función para limpieza automática de sesiones expiradas
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    -- Eliminar sesiones revocadas o expiradas desde hace más de 7 días
    DELETE FROM refresh_sessions 
    WHERE (revoked = TRUE OR expires_at < NOW()) 
        AND updated_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_sessions() IS 
    'Limpia sesiones expiradas o revocadas antiguas (>7 días)';

-- 6. Verificación de la migración
-- ============================================================
DO $$
BEGIN
    -- Verificar que la columna session_version existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'session_version'
    ) THEN
        RAISE NOTICE '✅ Columna users.session_version creada correctamente';
    ELSE
        RAISE EXCEPTION '❌ Error: Columna users.session_version no fue creada';
    END IF;

    -- Verificar que la tabla refresh_sessions existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'refresh_sessions'
    ) THEN
        RAISE NOTICE '✅ Tabla refresh_sessions creada correctamente';
    ELSE
        RAISE EXCEPTION '❌ Error: Tabla refresh_sessions no fue creada';
    END IF;

    -- Verificar índices
    IF EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'refresh_sessions' 
        AND indexname = 'idx_refresh_sessions_user_id'
    ) THEN
        RAISE NOTICE '✅ Índices creados correctamente';
    ELSE
        RAISE EXCEPTION '❌ Error: Índices no fueron creados';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '🎉 MIGRACIÓN V2 COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '';
    RAISE NOTICE 'Próximos pasos:';
    RAISE NOTICE '1. Reiniciar el backend Go';
    RAISE NOTICE '2. Probar login/logout en el frontend';
    RAISE NOTICE '3. Verificar cookies en DevTools';
    RAISE NOTICE '';
END $$;

-- 7. Datos de ejemplo (OPCIONAL - Solo para desarrollo/testing)
-- ============================================================
-- Descomentar para crear un usuario de prueba

/*
INSERT INTO users (
    id, role_id, slug, email, password_hash, full_name, 
    is_active, session_version, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    5, -- CLIENTE
    'testuser',
    'test@example.com',
    '$argon2id$v=19$m=65536,t=3,p=2$somesalt$somehash', -- Cambiar con hash real
    'Usuario de Prueba',
    TRUE,
    1,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;
*/

-- ============================================================
-- ROLLBACK (Solo si es necesario deshacer la migración)
-- ============================================================
-- ADVERTENCIA: Esto eliminará TODAS las sesiones activas

/*
-- Deshacer cambios (USAR CON PRECAUCIÓN)
DROP TABLE IF EXISTS refresh_sessions CASCADE;
ALTER TABLE users DROP COLUMN IF EXISTS session_version;
DROP FUNCTION IF EXISTS cleanup_expired_sessions();

-- Verificación de rollback
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'refresh_sessions'
    ) THEN
        RAISE NOTICE '✅ Rollback completado: tabla refresh_sessions eliminada';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'session_version'
    ) THEN
        RAISE NOTICE '✅ Rollback completado: columna session_version eliminada';
    END IF;
END $$;
*/

-- ============================================================
-- FIN DE LA MIGRACIÓN V2
-- ============================================================
