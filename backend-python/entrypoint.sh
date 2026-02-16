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

echo "⚙️  Note: Database migrations are handled by the Go server"
echo "   This server will only connect to the existing database"

# Dar tiempo al servidor Go para que ejecute las migraciones primero
echo "⏳ Waiting for Go server to complete migrations..."
sleep 5

echo "🚀 Starting FastAPI server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload