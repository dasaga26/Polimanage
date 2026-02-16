# Arquitectura y Flujo del Frontend

## Stack Tecnológico

- **React 19** con TypeScript
- **Vite** - Build tool y dev server
- **React Router DOM v7** - Enrutamiento
- **TanStack Query (React Query) v5** - Server state management
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Styling
- **Radix UI** - Componentes UI accesibles
- **ShadCN UI** - Componentes construidos sobre Radix
- **Lucide React** - Iconos
- **SweetAlert2** - Notificaciones/alertas

## Estructura de Carpetas

```
src/
├── assets/              # Imágenes, fuentes, archivos estáticos
├── components/          # Componentes React organizados por contexto
│   ├── ui/             # Componentes base reutilizables (Button, Card, etc.)
│   ├── layout/         # Componentes de layout (Navbar, Footer, AdminLayout, etc.)
│   ├── auth/           # Componentes relacionados con autenticación
│   ├── [feature]/      # Componentes específicos por feature
│   └── ...
├── config/             # Configuraciones (queryClient, etc.)
├── context/            # React Contexts (AuthContext, etc.)
├── hooks/              # Custom hooks (useAuth, etc.)
├── lib/                # Utilidades y helpers
├── mutations/          # React Query mutations organizadas por recurso
│   ├── index.ts        # Barrel export de todas las mutations
│   └── [resource]/     # Mutations específicas por recurso
│       ├── useCreate[Resource].ts
│       ├── useUpdate[Resource].ts
│       └── useDelete[Resource].ts
├── pages/              # Componentes de página (uno por ruta)
│   ├── [Page].tsx      # Páginas públicas
│   ├── admin/          # Páginas del panel admin
│   ├── gestor/         # Páginas del panel gestor
│   └── ...
├── queries/            # React Query queries organizadas por recurso
│   ├── index.ts        # Barrel export de todas las queries
│   └── [resource]/     # Queries específicas por recurso
│       ├── use[Resources]Query.ts (lista)
│       └── use[Resource]Query.ts  (detalle)
├── routes/             # Configuración de rutas
│   └── index.tsx       # Definición de todas las rutas y guards
├── services/           # Servicios API (capa de abstracción sobre axios)
│   ├── api.ts          # Instancia de axios configurada
│   ├── authService.ts  # Servicio de autenticación
│   └── [resource]Service.ts # Servicios por recurso
├── types/              # TypeScript types e interfaces
│   └── index.ts
├── App.tsx             # Componente raíz
└── main.tsx            # Entry point
```

## Principios de Arquitectura

### 1. Separación de Responsabilidades

**Services (Capa de API)**
- Servicios puros que retornan promesas
- Un archivo por recurso del backend
- Responsables de hacer las llamadas HTTP
- No manejan estado ni UI
- Ejemplo:
```typescript
export const [resource]Service = {
    getAll[Resources]: async (): Promise<Resource[]> => {
        const response = await api.get('/resources');
        return response.data;
    },
    get[Resource]: async (id: number): Promise<Resource> => {
        const response = await api.get(`/resources/${id}`);
        return response.data;
    },
    create[Resource]: async (data: CreateResourceData) => {
        const response = await api.post('/resources', data);
        return response.data;
    },
    // ... update, delete
};
```

**Queries (React Query - Lectura)**
- Custom hooks que usan `useQuery`
- Un hook por operación de lectura
- Organizados por recurso en carpetas separadas
- Se exportan centralizadamente desde `queries/index.ts`
- Ejemplo:
```typescript
export const use[Resources]Query = () => {
    return useQuery({
        queryKey: ['resources'],
        queryFn: () => [resource]Service.getAll[Resources](),
    });
};

export const use[Resource]Query = (id: number) => {
    return useQuery({
        queryKey: ['resources', id],
        queryFn: () => [resource]Service.get[Resource](id),
        enabled: !!id,
    });
};
```

**Mutations (React Query - Escritura)**
- Custom hooks que usan `useMutation`
- Un hook por operación de escritura (create, update, delete)
- Organizados por recurso en carpetas separadas
- Se exportan centralizadamente desde `mutations/index.ts`
- Invalidan queries automáticamente después de operaciones exitosas
- Ejemplo:
```typescript
export const useCreate[Resource] = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateResourceData) => 
            [resource]Service.create[Resource](data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
        },
    });
};
```

**Components**
- Consumen queries y mutations
- Responsables solo de la UI y la interacción del usuario
- No contienen lógica de negocio compleja
- Ejemplo:
```typescript
const MyComponent = () => {
    const { data, isLoading } = use[Resources]Query();
    const createMutation = useCreate[Resource]();

    const handleCreate = async (formData) => {
        try {
            await createMutation.mutateAsync(formData);
            // Opcional: mostrar mensaje de éxito
        } catch (error) {
            // Manejar error
        }
    };

    if (isLoading) return <LoadingSpinner />;
    
    return <UI data={data} onCreate={handleCreate} />;
};
```

### 2. React Query como Estado del Servidor

**Configuración del QueryClient**
```typescript
// config/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,  // No refetch al volver a la ventana
      retry: 1,                       // Reintentar solo 1 vez
      staleTime: 5 * 60 * 1000,      // 5 minutos de cache
    },
  },
});
```

**Convenciones de Query Keys**
- Lista de recursos: `['resources']`
- Recurso individual: `['resources', id]`
- Recursos filtrados: `['resources', { filter: 'value' }]`
- Recursos anidados: `['parent', parentId, 'children']`

**Invalidación de Cache**
- Después de create: invalidar lista
- Después de update: invalidar lista y detalle
- Después de delete: invalidar lista
- Usar `queryClient.invalidateQueries()` en mutations

### 3. Sistema de Autenticación

**AuthContext**
- Proveedor global de autenticación
- Maneja estado del usuario y operaciones de auth
- Expone: `usuario`, `loading`, `isAuthenticated`, `login`, `register`, `logout`, `updateProfile`
- Persiste token en localStorage
- Verifica autenticación al montar la app

**Hook useAuth**
```typescript
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};
```

**Interceptores de Axios**
```typescript
// Request: añadir token automáticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response: manejar errores 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Lógica de logout automático (excepto rutas públicas)
        }
        return Promise.reject(error);
    }
);
```

### 4. Sistema de Rutas y Protección

**Organización de Rutas**
- Rutas públicas: accesibles sin autenticación
- Rutas de invitados: solo para usuarios NO autenticados (login, register)
- Rutas protegidas: requieren autenticación
- Rutas por rol: requieren autenticación + rol específico

**Componentes de Protección**

```typescript
// ProtectedRoute: requiere autenticación y opcionalmente roles
const ProtectedRoute = ({ 
    children, 
    allowedRoles,      // Array de IDs de roles permitidos
    requireAuth = true,
    redirectTo = '/'
}) => {
    const { isAuthenticated, loading, usuario } = useAuth();

    if (loading) return <LoadingScreen />;
    if (requireAuth && !isAuthenticated) return <Navigate to="/login" />;
    if (allowedRoles && !allowedRoles.includes(usuario.rol_id)) {
        return <Navigate to={redirectTo} />;
    }

    return children;
};

// GuestRoute: solo para NO autenticados (redirige si ya está logueado)
const GuestRoute = ({ children }) => {
    const { isAuthenticated, loading, usuario } = useAuth();

    if (loading) return <LoadingScreen />;
    if (isAuthenticated) {
        // Redirigir según el rol del usuario
        return <Navigate to={getRoleBasedRedirect(usuario.rol_id)} />;
    }

    return children;
};

// PublicRoute: accesible por todos, pero con lógica de redirección especial
const PublicRoute = ({ children }) => {
    const { isAuthenticated, usuario } = useAuth();
    
    // Redirigir usuarios con roles especiales a sus dashboards
    if (isAuthenticated && hasSpecialRole(usuario.rol_id)) {
        return <Navigate to={getDashboard(usuario.rol_id)} />;
    }

    return children;
};
```

**Estructura de Rutas**
```typescript
<Routes>
    {/* Públicas */}
    <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
    
    {/* Solo invitados */}
    <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
    
    {/* Protegidas (cualquier autenticado) */}
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    
    {/* Por rol */}
    <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminLayout />
        </ProtectedRoute>
    } />
</Routes>
```

### 5. Layouts Anidados

**Concepto**
- Layouts reutilizan estructura común (sidebar, header, etc.)
- Usan `<Outlet />` de React Router para renderizar rutas hijas
- Cada panel (admin, gestor) tiene su propio layout

**Ejemplo de Layout**
```typescript
const AdminLayout = () => {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1">
                <Header />
                <div className="p-6">
                    <Outlet /> {/* Renderiza las rutas hijas */}
                </div>
            </main>
        </div>
    );
};
```

**Uso en Rutas**
```typescript
<Route path="/admin" element={
    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <AdminLayout />
    </ProtectedRoute>
}>
    {/* Rutas hijas se renderizan en <Outlet /> */}
    <Route index element={<Navigate to="dashboard" />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="users" element={<Users />} />
</Route>
```

### 6. Componentes UI Reutilizables

**Organización**
- `components/ui/`: componentes base (Button, Card, Badge, etc.)
- Construidos sobre Radix UI para accesibilidad
- Estilizados con Tailwind CSS y class-variance-authority
- Tipado fuerte con TypeScript

**Patrón de Composición**
```typescript
// Uso típico de componentes UI
<Card>
    <CardHeader>
        <CardTitle>Título</CardTitle>
        <CardDescription>Descripción</CardDescription>
    </CardHeader>
    <CardContent>
        {/* Contenido */}
    </CardContent>
    <CardFooter>
        <Button variant="default">Acción</Button>
    </CardFooter>
</Card>
```

### 7. Manejo de Errores y Loading States

**En Queries**
```typescript
const { data, isLoading, isError, error } = useResourcesQuery();

if (isLoading) return <LoadingSpinner />;
if (isError) return <ErrorMessage error={error} />;

return <ResourcesList data={data} />;
```

**En Mutations**
```typescript
const createMutation = useCreateResource();

const handleSubmit = async (data) => {
    try {
        await createMutation.mutateAsync(data);
        Swal.fire('Éxito', 'Recurso creado', 'success');
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
};

// O usar estados de mutation
const { mutate, isPending, isError } = createMutation;
```

### 8. TypeScript e Inferencia de Tipos

**Types Centralizados**
- Todos los tipos en `types/index.ts`
- Interfaces para entidades del dominio
- Types para requests y responses
- Enums para valores constantes

**Tipado en Servicios**
```typescript
// Service typed
export const resourceService = {
    getAll: async (): Promise<Resource[]> => { ... },
    create: async (data: CreateResourceData): Promise<Resource> => { ... },
};
```

**Tipado en Queries/Mutations**
```typescript
// TanStack Query infiere tipos automáticamente del service
export const useResourcesQuery = () => {
    return useQuery({
        queryKey: ['resources'],
        queryFn: () => resourceService.getAll(), // Tipo inferido: Resource[]
    });
};
```

## Flujo de Datos

### Flujo de Lectura (Query)
```
Component → useQuery Hook → Service → API → Backend
                ↓
            Cache (QueryClient)
                ↓
            Component (data)
```

### Flujo de Escritura (Mutation)
```
Component → useMutation Hook → Service → API → Backend
                                            ↓
                                    onSuccess callback
                                            ↓
                                invalidateQueries(['resource'])
                                            ↓
                                    Re-fetch automático
                                            ↓
                                    Component actualizado
```

### Flujo de Autenticación
```
Login Form → authService.login() → Backend → Receive token
                                                ↓
                                    localStorage.setItem('token')
                                                ↓
                                        Update AuthContext
                                                ↓
                                        Redirect by role
```

## Convenciones de Código

### Naming Conventions

**Archivos**
- Componentes: PascalCase (`UserCard.tsx`)
- Services: camelCase (`authService.ts`)
- Hooks: camelCase con prefijo `use` (`useAuth.ts`)
- Types: PascalCase (`index.ts` con exports)

**Variables y Funciones**
- camelCase para variables y funciones
- PascalCase para componentes y types
- UPPER_CASE para constantes

**Queries y Mutations**
- Queries: `use[Resource]Query` o `use[Resources]Query`
- Mutations: `useCreate[Resource]`, `useUpdate[Resource]`, `useDelete[Resource]`
- Services: `[resource]Service`

### Estructura de Componentes

```typescript
// 1. Imports
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

// 2. Types/Interfaces
interface MyComponentProps {
    id: number;
    onSuccess?: () => void;
}

// 3. Componente
export const MyComponent = ({ id, onSuccess }: MyComponentProps) => {
    // 3.1. Hooks de React Query
    const { data, isLoading } = useResourceQuery(id);
    const createMutation = useCreateResource();
    
    // 3.2. State local
    const [localState, setLocalState] = useState(false);
    
    // 3.3. Handlers
    const handleAction = async () => {
        // Lógica
    };
    
    // 3.4. Early returns
    if (isLoading) return <LoadingSpinner />;
    if (!data) return null;
    
    // 3.5. Render
    return (
        <div>
            {/* JSX */}
        </div>
    );
};
```

### Barrel Exports

**Pattern de index.ts**
```typescript
// queries/index.ts
export { useResourcesQuery } from './resources/useResourcesQuery';
export { useResourceQuery } from './resources/useResourceQuery';
// ... más exports

// Uso en componentes
import { useResourcesQuery, useResourceQuery } from '@/queries';
```

### Path Aliases

**Configuración en tsconfig.json**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Uso**
```typescript
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { resourceService } from '@/services/resourceService';
```

## Patterns Avanzados

### Optimistic Updates
```typescript
export const useUpdateResource = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => resourceService.update(data),
        onMutate: async (newData) => {
            // Cancelar queries en curso
            await queryClient.cancelQueries({ queryKey: ['resources'] });
            
            // Snapshot del valor anterior
            const previous = queryClient.getQueryData(['resources']);
            
            // Actualización optimista
            queryClient.setQueryData(['resources'], (old) => 
                old.map(item => item.id === newData.id ? newData : item)
            );
            
            return { previous };
        },
        onError: (err, newData, context) => {
            // Rollback en caso de error
            queryClient.setQueryData(['resources'], context.previous);
        },
        onSettled: () => {
            // Refetch para asegurar sincronización
            queryClient.invalidateQueries({ queryKey: ['resources'] });
        },
    });
};
```

### Infinite Queries (Paginación)
```typescript
export const useInfiniteResourcesQuery = () => {
    return useInfiniteQuery({
        queryKey: ['resources', 'infinite'],
        queryFn: ({ pageParam = 1 }) => 
            resourceService.getAll({ page: pageParam }),
        getNextPageParam: (lastPage, pages) => 
            lastPage.hasMore ? pages.length + 1 : undefined,
        initialPageParam: 1,
    });
};
```

### Dependent Queries
```typescript
export const useResourceDetails = (id: number) => {
    // Query principal
    const { data: resource } = useResourceQuery(id);
    
    // Query dependiente (solo se ejecuta si existe resource)
    const { data: relatedData } = useRelatedQuery(resource?.relatedId, {
        enabled: !!resource?.relatedId,
    });
    
    return { resource, relatedData };
};
```

## Testing Strategy

### Estructura
```
src/
└── components/
    └── MyComponent/
        ├── MyComponent.tsx
        ├── MyComponent.test.tsx  # Tests unitarios
        └── index.ts              # Barrel export
```

### Testing Queries
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useResourcesQuery } from './useResourcesQuery';

test('should fetch resources', async () => {
    const { result } = renderHook(() => useResourcesQuery(), {
        wrapper: QueryClientProvider,
    });
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
});
```

## Build y Deployment

### Scripts
```json
{
  "scripts": {
    "dev": "vite",              // Desarrollo
    "build": "tsc -b && vite build",  // Build de producción
    "preview": "vite preview",  // Preview del build
    "lint": "eslint ."          // Linting
  }
}
```

### Environment Variables
```bash
# .env.development
VITE_API_URL=http://localhost:8080/api

# .env.production
VITE_API_URL=https://api.production.com/api
```

### Uso
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
```

## Mejores Prácticas

1. **Un servicio por recurso**: cada entidad del backend tiene su propio archivo de servicio
2. **Queries y Mutations separadas**: organización clara entre lectura y escritura
3. **Invalidación automática**: después de mutaciones, invalidar queries relacionadas
4. **Componentes pequeños**: una responsabilidad por componente
5. **Types compartidos**: centralizar tipos en `types/index.ts`
6. **Loading y Error states**: siempre manejar estados de carga y error
7. **Barrel exports**: usar `index.ts` para exportaciones limpias
8. **Path aliases**: usar `@/` para imports absolutos
9. **Protección de rutas**: usar guards consistentemente
10. **Layouts reutilizables**: usar `<Outlet />` para rutas anidadas

## Resumen de Flujo Completo

```
1. Usuario interactúa con Component
2. Component usa Query Hook (lectura) o Mutation Hook (escritura)
3. Hook llama al Service correspondiente
4. Service hace request HTTP a través de axios (con interceptores)
5. Backend responde
6. Service retorna data
7. React Query cachea la respuesta
8. Component recibe data y re-renderiza
9. En mutaciones: se invalidan queries y se hace re-fetch automático
```

Esta arquitectura garantiza:
- ✅ Separación clara de responsabilidades
- ✅ Cache y sincronización automática de datos
- ✅ Type safety con TypeScript
- ✅ Código mantenible y escalable
- ✅ Autenticación y protección de rutas robusta
- ✅ UI consistente con componentes reutilizables
