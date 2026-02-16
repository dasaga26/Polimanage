/*
 * ======================================================================================
 * POLIMANAGE - SCHEMA DEFINITIVO (POSTGRESQL 17)
 * Arquitectura: Híbrida (SQL Core + Mongo Auxiliar)
 * Cambios: Sin Wallet, Sin Reviews, Incidencias en NoSQL.
 * ======================================================================================
 */

-- 1. LIMPIEZA
DROP TABLE IF EXISTS match_players CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;
DROP TABLE IF EXISTS class_enrollments CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS pistas CASCADE;
DROP TABLE IF EXISTS special_days CASCADE;
DROP TABLE IF EXISTS opening_hours CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 2. FUNCIÓN AUTO-UPDATE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

/* --------------------------------------------------------------------------------------
    MÓDULO 1: IDENTIDAD
-------------------------------------------------------------------------------------- */

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, 
    description VARCHAR(255)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL DEFAULT 5 REFERENCES roles(id),
    slug VARCHAR(120) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    stripe_customer_id VARCHAR(255), -- Clave para Stripe
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_users_email ON users(email);
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

/* --------------------------------------------------------------------------------------
    MÓDULO 2: CONFIGURACIÓN (Horarios)
-------------------------------------------------------------------------------------- */
CREATE TABLE opening_hours (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT uq_day_of_week UNIQUE (day_of_week)
);

CREATE TABLE special_days (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    is_closed BOOLEAN DEFAULT FALSE,
    open_time TIME,
    close_time TIME,
    reason VARCHAR(100)
);

/* --------------------------------------------------------------------------------------
    MÓDULO 3: RECURSOS Y RESERVAS
-------------------------------------------------------------------------------------- */
CREATE TABLE pistas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL, 
    surface VARCHAR(50),
    location_info VARCHAR(100),
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    base_price_cents INTEGER NOT NULL CHECK (base_price_cents >= 0),
    duration_minutes INTEGER DEFAULT 90,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TRIGGER update_pistas_modtime BEFORE UPDATE ON pistas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    pista_id INTEGER NOT NULL REFERENCES pistas(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    price_snapshot_cents INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    payment_status VARCHAR(50) DEFAULT 'UNPAID',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT check_booking_dates CHECK (end_time > start_time)
);
CREATE INDEX idx_bookings_dates ON bookings(start_time, end_time);
-- Indice anti-solapes básico
CREATE UNIQUE INDEX idx_booking_overlap ON bookings (pista_id, start_time) 
WHERE status != 'CANCELLED' AND deleted_at IS NULL;
CREATE TRIGGER update_bookings_modtime BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

/* --------------------------------------------------------------------------------------
    MÓDULO 4: SUSCRIPCIONES (CLUB / SOCIOS)
-------------------------------------------------------------------------------------- */
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    price_cents INTEGER NOT NULL,
    interval_unit VARCHAR(20) NOT NULL, -- 'MONTH', 'YEAR'
    duration_interval INTEGER DEFAULT 1,
    stripe_price_id VARCHAR(255), -- ID del plan en Stripe
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    stripe_subscription_id VARCHAR(255), -- ID de la suscripción en Stripe
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

/* --------------------------------------------------------------------------------------
    MÓDULO 5: ACADEMIA Y SOCIAL
-------------------------------------------------------------------------------------- */
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    captain_id INTEGER NOT NULL REFERENCES users(id),
    logo_url TEXT,
    level VARCHAR(50) DEFAULT 'BEGINNER',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    role VARCHAR(20) DEFAULT 'MEMBER',
    status VARCHAR(20) DEFAULT 'ACCEPTED',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_team_user UNIQUE (team_id, user_id)
);

CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    pista_id INTEGER NOT NULL REFERENCES pistas(id),
    instructor_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    capacity INTEGER DEFAULT 4,
    price_cents INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE class_enrollments (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'CONFIRMED',
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_class_user UNIQUE (class_id, user_id)
);

CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'REGISTRATION_OPEN',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER UNIQUE REFERENCES bookings(id),
    tournament_id INTEGER REFERENCES tournaments(id),
    result_set_1 VARCHAR(10),
    result_set_2 VARCHAR(10),
    result_set_3 VARCHAR(10),
    winner_team VARCHAR(10),
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE match_players (
    match_id INTEGER NOT NULL REFERENCES matches(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    team VARCHAR(10) NOT NULL,
    PRIMARY KEY (match_id, user_id)
);

/* --------------------------------------------------------------------------------------
    MÓDULO 6: PAGOS UNIFICADOS (STRIPE READY)
-------------------------------------------------------------------------------------- */
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(50) NOT NULL, -- 'SUCCEEDED', 'PENDING', 'FAILED'
    provider VARCHAR(50) DEFAULT 'STRIPE',
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    
    -- Exclusive Arc (A qué corresponde el pago)
    booking_id INTEGER REFERENCES bookings(id),
    class_enrollment_id INTEGER REFERENCES class_enrollments(id),
    tournament_id INTEGER REFERENCES tournaments(id),
    subscription_id INTEGER REFERENCES subscriptions(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Regla: Solo 1 concepto pagado a la vez
    CONSTRAINT check_payment_origin CHECK (
        (booking_id IS NOT NULL)::integer + 
        (class_enrollment_id IS NOT NULL)::integer + 
        (tournament_id IS NOT NULL)::integer +
        (subscription_id IS NOT NULL)::integer 
        = 1
    )
);
CREATE TRIGGER update_payments_modtime BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

/* --------------------------------------------------------------------------------------
    SEED DATA BÁSICO
-------------------------------------------------------------------------------------- */
INSERT INTO roles (id, name, description) VALUES 
(1, 'ADMIN', 'Administrador con acceso completo al sistema'), 
(2, 'GESTOR', 'Personal del polideportivo con permisos de gestión'), 
(3, 'CLUB', 'Dueño/Gestor de club deportivo'),
(4, 'MONITOR', 'Monitor de clases y entrenamientos'),
(5, 'CLIENTE', 'Usuario externo del polideportivo');
INSERT INTO opening_hours (day_of_week, open_time, close_time) VALUES
(1, '09:00', '23:00'), (2, '09:00', '23:00'), (3, '09:00', '23:00'), (4, '09:00', '23:00'),
(5, '09:00', '23:00'), (6, '09:00', '22:00'), (0, '09:00', '21:00');

-- Seed pistas con deportes reales (UTF-8)
INSERT INTO pistas (name, slug, type, surface, location_info, base_price_cents, is_active) VALUES
('Pista Pádel 1', 'pista-padel-1', 'Pádel', 'Césped artificial', 'Planta baja, zona oeste', 2000, TRUE),
('Pista Pádel 2', 'pista-padel-2', 'Pádel', 'Césped artificial', 'Planta baja, zona oeste', 2000, TRUE),
('Pista Pádel 3', 'pista-padel-3', 'Pádel', 'Cristal', 'Planta baja, zona este', 2500, TRUE),
('Pista Tenis 1', 'pista-tenis-1', 'Tenis', 'Tierra batida', 'Exterior, zona norte', 2200, TRUE),
('Pista Tenis 2', 'pista-tenis-2', 'Tenis', 'Pista dura', 'Exterior, zona sur', 2000, TRUE),
('Pista Fútbol Sala', 'pista-futbol-sala', 'Fútbol Sala', 'Parquet', 'Polideportivo principal', 3500, TRUE),
('Pista Baloncesto', 'pista-baloncesto', 'Baloncesto', 'Parquet', 'Polideportivo principal', 3000, TRUE),
('Pista Voleibol', 'pista-voleibol', 'Voleibol', 'Parquet', 'Gimnasio multiusos', 2500, TRUE),
('Pista Squash 1', 'pista-squash-1', 'Squash', 'Cemento pulido', 'Planta sótano', 1800, TRUE),
('Pista Squash 2', 'pista-squash-2', 'Squash', 'Cemento pulido', 'Planta sótano', 1800, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Tabla de clubes deportivos
CREATE TABLE IF NOT EXISTS clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    image_url TEXT,
    icon VARCHAR(50) NOT NULL,
    level VARCHAR(50) NOT NULL,
    sport_type VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed de clubes deportivos
INSERT INTO clubs (name, slug, description, image_url, icon, level, sport_type, color) VALUES
('City United FC', 'city-united-fc', 'Passion in every pass', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOW5EeKoXxWwoL3tByuPti4ma3zc2fR3TGT-OueR_83cN56XqosHi5FXEqZ8Ad5mf5YFj6Qiy7d7v0P14E9iXCQpwiI4otZGm86NnGHoZ7vF0E-bgH2tPhj-lYVgtG28WX5hssq3sKVeB4uXjaFILs2pfIYj20-2Dlyo4-c1ikvKM1Yz1SGkLocyZRbxgFFB9zxrqEwjGBRE9QnGw2Va2sTMl6GVo1Os4MGpzrXhqe7Fvlw_Nte77QC7mpvNU5AXd5XWB8RXFImRZN', 'sports_soccer', 'Competitive', 'Fútbol', 'emerald'),
('Metro Dunkers', 'metro-dunkers', 'Rise above the rim', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIpwxThfmkIFmbMRsC6orrsa5j6-Z_NdO2t_vB3xh0DVCtO9QYyOl2afyWI_lcCUg01W-p-7u_winN5EygxHrY2YgXei5ebGf3hAE3ncJKD0cVuR70x44Czg00zP5dIK-bHkDa8PZgU68C6Zc2xOeiAT7h4QEOxZd8zlcCj9kr59vaY4aiumPcI1szE1_DPROgDGMMBRpKNq21n5xUVY0TLtn04RkKI6HzE76TyrIABR6NL9k7llU5BhrgocKUdBsksAFKr3apOUbG', 'sports_basketball', 'Youth', 'Baloncesto', 'purple'),
('Blue Wave Swim', 'blue-wave-swim', 'Find your flow', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCszqO-DfmYWYe9eVg8LxMcMlGZ3UZMkCWhi_5tDAedt7YGoUyKs3QcbWKjcJJQ7Hzv-5IO5NGEOUB1xVurQzCwPsmu19zXIlYAeqVuyKXUd_YbU8RI1pJI6m5NIza6R7Wc1n7aTnrH-2O8xUCyLXJXaefsBDMLXTkyul7YKBgXfDuUQsqRmNaxBQTy5Z_GQc2u51lc-Zz5Z0jr3yCZTsozSlW9Z2btKpbY6b6ud9iQ_l_c1wQ32Nk-ueOJhhTsY8g8tSTNXitLYWmu', 'pool', 'All Levels', 'Natación', 'cyan'),
('Ace Academy', 'ace-academy', 'Serve with power', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMCdiJLmFRMeeLCqInS7ABH0Yp0LFnN5viJbXmnLsDDy39amwebU83xufb83AJNxP0m5bt9EfOdpnCrPhB6oZeqbtpbOs9upvZR5YefDcjLVfx-v9C4x3nhES0-raU6CXo37mQocBROZ7W5hybwrw19uI-MaHkkvXWbRd5baG8CtoPx2s5YPLzCKmrs-welzGmTOhQAMhULPRECihzKtK9wG93OjMC02u5_5UI1AmOQJHbNObuD_02nOZRKUEkxVBettaM73VSDvnj', 'sports_tennis', 'Elite', 'Tenis', 'amber')
ON CONFLICT (slug) DO NOTHING;

DO $$ BEGIN RAISE NOTICE '✅ Base de Datos PoliManage (Híbrida) creada exitosamente.'; END $$;