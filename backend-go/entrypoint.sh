#!/usr/bin/env sh
set -e

echo "⏳ Waiting for PostgreSQL to be ready..."

# Función para esperar a PostgreSQL
wait_for_postgres() {
    echo "Checking PostgreSQL connection at ${DB_HOST}:${DB_PORT}..."
    
    until PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" -c '\q' 2>/dev/null; do
        echo "PostgreSQL is unavailable - sleeping"
        sleep 2
    done
    
    echo "✅ PostgreSQL is ready!"
}

wait_for_postgres

echo "� Preparing database..."
echo "   This server is responsible for all database migrations"

# Dar un pequeño delay adicional para asegurar que PostgreSQL está completamente listo
sleep 2

echo "🚀 Starting Go server..."
echo "   GORM will handle database migrations automatically on startup"

# Ejecutar la aplicación Go (las migraciones se ejecutan en database.Connect())
exec ./main
