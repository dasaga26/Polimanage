# Instalación de Dependencias para el Dashboard del Admin

## Dependencias Necesarias

El dashboard del admin requiere las siguientes dependencias adicionales:

### 1. React Router DOM
Para la navegación entre páginas:
```bash
npm install react-router-dom
npm install --save-dev @types/react-router-dom
```

### 2. Date-fns (para formateo de fechas)
```bash
npm install date-fns
```

## Instalación Completa

Ejecuta el siguiente comando en la carpeta `frontend`:

```bash
npm install react-router-dom date-fns && npm install --save-dev @types/react-router-dom
```

## Estructura del Dashboard

El dashboard del admin incluye:

### Componentes Principales
- `Sidebar`: Menú lateral de navegación
- `DashboardLayout`: Layout principal con header y sidebar
- `DataTable`: Componente reutilizable para tablas de datos
- `StatsCard`: Tarjetas de estadísticas

### Páginas
- `/admin` - Dashboard principal con estadísticas
- `/admin/users` - Gestión de usuarios
- `/admin/pistas` - Gestión de pistas
- `/admin/bookings` - Gestión de reservas
- `/admin/classes` - Gestión de clases
- `/admin/teams` - Gestión de equipos
- `/admin/tournaments` - Gestión de torneos
- `/admin/subscriptions` - Gestión de suscripciones
- `/admin/payments` - Historial de pagos
- `/admin/opening-hours` - Configuración de horarios
- `/admin/settings` - Configuración general

### Servicios
- `adminService.ts`: Servicios API para todas las entidades
  - userService
  - pistaService
  - bookingService
  - classService
  - teamService
  - tournamentService
  - subscriptionService
  - paymentService
  - openingHourService
  - statsService

### Tipos
- `admin.ts`: TypeScript types para todas las entidades y DTOs

## Variables de Entorno

Crea un archivo `.env` en la carpeta `frontend` con:

```env
VITE_API_URL=http://localhost:8080/api
```

## Ejecución

```bash
npm run dev
```

El dashboard estará disponible en:
- Dashboard principal: http://localhost:5173/admin
- Home pública: http://localhost:5173/

## Características del Dashboard

1. **CRUD Completo**: Crear, leer, actualizar y eliminar para todas las entidades
2. **Tablas de Datos**: Componente reutilizable con acciones de editar/eliminar
3. **Modales**: Formularios modales para crear y editar
4. **Estadísticas**: Dashboard principal con métricas clave
5. **Navegación**: Sidebar colapsable con iconos
6. **Responsive**: Diseño adaptable a móviles y tablets
7. **Loading States**: Estados de carga para mejorar UX
8. **Confirmaciones**: Confirmaciones antes de eliminar datos

## Backend Endpoints Requeridos

El frontend espera los siguientes endpoints en el backend:

```
GET    /api/stats/dashboard
GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
GET    /api/roles
GET    /api/pistas
POST   /api/pistas
PUT    /api/pistas/:id
DELETE /api/pistas/:id
GET    /api/bookings
DELETE /api/bookings/:id
GET    /api/classes
DELETE /api/classes/:id
GET    /api/teams
DELETE /api/teams/:id
GET    /api/tournaments
DELETE /api/tournaments/:id
GET    /api/subscriptions
GET    /api/payments
GET    /api/opening-hours
PUT    /api/opening-hours/:id
```

## Notas Importantes

1. **Autenticación**: El servicio incluye un interceptor que agrega el token JWT desde localStorage
2. **Moneda**: Todos los precios se manejan en céntimos en el backend y se convierten a euros en el frontend
3. **Fechas**: Todas las fechas se guardan en UTC y se formatean según la zona horaria local
4. **Soft Deletes**: Los DELETE usan soft deletes, no eliminan físicamente los registros
