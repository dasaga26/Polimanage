# PoliManage

Sistema de gestión para centros deportivos.

## 📋 Requisitos Previos

- Docker y Docker Compose
- Git

## 🚀 Configuración Inicial

### 1. Configurar Variables de Entorno

Antes de ejecutar el proyecto, debes configurar las variables de entorno:

```bash
# Copia el archivo de ejemplo
cp .env.example .env
```

Edita el archivo `.env` y configura tus valores personalizados:

- **POSTGRES_PASSWORD**: Contraseña de la base de datos PostgreSQL
- **PGADMIN_DEFAULT_EMAIL**: Email para acceder a pgAdmin
- **PGADMIN_DEFAULT_PASSWORD**: Contraseña para pgAdmin
- **JWT_SECRET**: Clave secreta para JWT (mínimo 32 caracteres)

⚠️ **IMPORTANTE**: Nunca subas el archivo `.env` a Git. Ya está incluido en `.gitignore`.

### 2. Levantar los Servicios

```bash
# Iniciar todos los servicios con Docker Compose
docker-compose up -d

# Ver los logs
docker-compose logs -f

# Detener los servicios
docker-compose down
```

## 🔧 Servicios Disponibles

Una vez iniciado, los siguientes servicios estarán disponibles:

- **Frontend**: http://localhost:5173
- **Backend Go**: http://localhost:8080
- **Backend Python**: http://localhost:8000
- **pgAdmin**: http://localhost:5050
- **PostgreSQL**: localhost:5432

## 📁 Estructura del Proyecto

```
PoliManage/
├── backend-go/          # Backend en Go (Fiber)
├── backend-python/      # Backend en Python (FastAPI)
├── frontend/            # Frontend en React + TypeScript + Vite
├── docker-compose.yml   # Configuración de Docker Compose
├── .env                 # Variables de entorno (NO SUBIR A GIT)
└── .env.example         # Plantilla de variables de entorno
```

## 🔐 Seguridad

- Todos los datos sensibles están en archivos `.env`
- Los archivos `.env` están en `.gitignore` y **NO** se suben a GitHub
- Utiliza el archivo `.env.example` como referencia
- En producción, usa contraseñas seguras y diferentes a las de desarrollo

## 🛠️ Desarrollo

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

### Backend Go

```bash
cd backend-go
go run cmd/api/main.go
```

### Backend Python

```bash
cd backend-python
pip install -r requirements.txt
python main.py
```

## 📝 Notas

- El archivo `.env` contiene valores por defecto para desarrollo local
- **NUNCA** uses las credenciales por defecto en producción
- Cambia el `JWT_SECRET` por una cadena aleatoria segura
- En producción, considera usar servicios de gestión de secretos

## 🤝 Contribuir

Al contribuir al proyecto:
1. Nunca subas archivos `.env` con datos reales
2. Actualiza `.env.example` si añades nuevas variables
3. Documenta los cambios en este README
