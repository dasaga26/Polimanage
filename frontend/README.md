# PoliManage Frontend

Frontend de la aplicación PoliManage construido con React, TypeScript, Vite y Tailwind CSS.

## 🛠️ Stack Tecnológico

- **Framework**: React 19
- **Lenguaje**: TypeScript
- **Build Tool**: Vite
- **Estilos**: Tailwind CSS
- **Gestión de Estado**: TanStack Query (React Query)
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **UI Components**: Radix UI + shadcn/ui

## 📁 Estructura del Proyecto

```
src/
├── components/       # Componentes reutilizables
│   ├── admin/       # Componentes del dashboard admin
│   │   ├── modals/  # Modales para CRUD
│   │   ├── users/   # Gestión de usuarios
│   │   ├── pistas/  # Gestión de pistas
│   │   └── ...
│   ├── layout/      # Componentes de layout (Navbar, Footer)
│   └── ui/          # Componentes UI base (shadcn)
├── pages/           # Páginas de la aplicación
│   ├── admin/       # Páginas del panel admin
│   └── home/        # Página principal
├── queries/         # React Query hooks (GET)
├── mutations/       # React Query hooks (POST, PUT, DELETE)
├── services/        # Servicios API (axios)
├── routes/          # Definición de rutas
├── types/           # Definiciones de TypeScript
├── lib/             # Utilidades
└── config/          # Configuración (QueryClient)
```

## 🔧 Configuración de API

El frontend se comunica con dos backends:

- **Backend Go** (puerto 8080): Usuarios, Roles, Pagos
- **Backend Python** (puerto 8000): Pistas (legacy)

Las URLs se configuran mediante variables de entorno:

```bash
VITE_API_GO_URL=http://localhost:8080/api
VITE_API_PYTHON_URL=http://localhost:8000/api
```

## 🚀 Desarrollo

### Instalación

```bash
# Instalar pnpm (si no lo tienes)
npm install -g pnpm

# Instalar dependencias
pnpm install
```

### Comandos

```bash
# Desarrollo (puerto 5173)
pnpm dev

# Build para producción
pnpm build

# Preview del build
pnpm preview

# Linting
pnpm lint
```

## 🐳 Docker

### Build de la imagen

```bash
docker-compose build frontend
```

### Ejecutar con Docker Compose

```bash
# Levantar todos los servicios
docker-compose up -d

# Solo el frontend
docker-compose up -d frontend
```

El frontend estará disponible en: http://localhost:5173

## 📋 Funcionalidades Implementadas

### Dashboard Admin

- ✅ **Usuarios**: CRUD completo de usuarios con roles
- ✅ **Pistas**: CRUD completo de pistas deportivas
- ✅ **Reservas**: Listado y gestión de reservas
- ✅ **Pagos**: Historial de pagos
- ✅ **Horarios**: Configuración de horarios de apertura
- ⏳ **Clases**: Estructura básica (requiere backend)
- ⏳ **Equipos**: Estructura básica (requiere backend)
- ⏳ **Torneos**: Estructura básica (requiere backend)
- ⏳ **Suscripciones**: Estructura básica (requiere backend)

### Página Pública

- ✅ Vista de pistas disponibles
- ⏳ Sistema de reservas (requiere autenticación)

## 🎨 Componentes UI

El proyecto utiliza **shadcn/ui** para componentes base:

- `Button`
- `Card`
- `Input`
- `Select`
- `Dialog/Modal`
- `Table`

Todos personalizados con Tailwind CSS.

## 📝 Convenciones de Código

### Imports

```typescript
// Alias @ apunta a src/
import { Component } from '@/components/Component';
import { useQuery } from '@/queries';
import { userService } from '@/services/userService';
```

### Tipos

```typescript
// Tipos de dominio en src/types/
import type { User } from '@/types/admin';

// Tipos de servicios inline
export interface CreateUserDTO {
  email: string;
  password: string;
  // ...
}
```

### Queries y Mutations

```typescript
// Query (GET)
const { data, isLoading, error } = useUsersQuery();

// Mutation (POST/PUT/DELETE)
const mutation = useCreateUser();
mutation.mutate(userData, {
  onSuccess: () => {
    // Refrescar datos
  },
});
```

## 🔒 Autenticación (Pendiente)

El sistema de autenticación está pendiente de implementación. Se planea usar:

- JWT Tokens
- Context API para estado global
- Protected Routes
- Roles: ADMIN, STAFF, CLIENT

## 🐛 Troubleshooting

### El build falla

```bash
# Limpiar y reinstalar
rm -rf node_modules dist .vite
pnpm install
pnpm build
```

### Error de tipo TypeScript

Verificar que los tipos en `src/types/admin.ts` coincidan con los datos del backend.

### Error de CORS

Verificar que los backends tengan CORS configurado correctamente para permitir `http://localhost:5173`.

## 📚 Recursos

- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
