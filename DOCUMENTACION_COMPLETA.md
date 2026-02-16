# PoliManage - Documentación Completa del Sistema

**Fecha:** Febrero 2026  
**Versión:** 1.0  
**Sistema de Gestión:** Instalaciones Deportivas (Polideportivo)

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Backend Go - Servicio Principal](#backend-go---servicio-principal)
5. [Backend Python - Servicio de Pistas](#backend-python---servicio-de-pistas)
6. [Frontend React](#frontend-react)
7. [Base de Datos PostgreSQL](#base-de-datos-postgresql)
8. [Infraestructura Docker](#infraestructura-docker)
9. [Módulos Funcionales Detallados](#módulos-funcionales-detallados)
10. [Flujos de Trabajo](#flujos-de-trabajo)
11. [Configuración y Deployment](#configuración-y-deployment)

---

## 🎯 Visión General

### ¿Qué es PoliManage?

PoliManage es un sistema integral de gestión para instalaciones deportivas que permite administrar:

- **Recursos físicos**: Pistas deportivas (tenis, pádel, fútbol, etc.)
- **Reservas**: Sistema de booking con control de disponibilidad
- **Clases grupales**: Programación y gestión de inscripciones
- **Clubs deportivos**: Membresías y gestión de socios
- **Usuarios**: Sistema multi-rol (ADMIN, GESTOR, CLUB, MONITOR, CLIENTE)
- **Pagos**: Integración preparada con Stripe (placeholder)

### Tecnologías Core

- **Backend Principal**: Go 1.25 + Fiber + GORM
- **Backend Secundario**: Python 3.12 + FastAPI + SQLAlchemy
- **Frontend**: React 19 + TypeScript + Vite + TanStack Query
- **Base de Datos**: PostgreSQL 16
- **Containerización**: Docker + Docker Compose
- **UI**: Tailwind CSS + shadcn/ui
- **Documentación API**: Swagger/OpenAPI

### Características Principales

✅ **Arquitectura de Microservicios**: Separación por lenguaje y responsabilidad  
✅ **Clean Architecture**: DDD en backend Go con capas domain/application/infrastructure/presentation  
✅ **Type-Safe**: TypeScript en frontend, tipos fuertemente tipados en Go  
✅ **API REST**: Endpoints documentados con Swagger  
✅ **Gestión de Estado**: TanStack Query (React Query) con invalidación automática  
✅ **Responsive**: UI adaptativa mobile-first  
✅ **Validaciones**: Backend (domain layer) + Frontend (react-hook-form)  
✅ **Soft Deletes**: Eliminación lógica con `deleted_at`  
✅ **Timestamps Automáticos**: `created_at` y `updated_at` en todas las entidades

---

## 🏗️ Arquitectura del Sistema

### Vista de Alto Nivel

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│              React 19 + TypeScript + Vite               │
│                   http://localhost:80                   │
└──────────────────┬────────────────┬─────────────────────┘
                   │                │
                   ▼                ▼
┌──────────────────────────┐ ┌─────────────────────────┐
│    BACKEND GO (Fiber)    │ │  BACKEND PYTHON (FastAPI)│
│   http://localhost:8080  │ │  http://localhost:8000   │
│                          │ │                          │
│ • Users & Auth           │ │ • Pistas CRUD            │
│ • Bookings               │ │ • Deportes               │
│ • Classes & Enrollments  │ │                          │
│ • Clubs & Memberships    │ │                          │
│ • Roles                  │ │                          │
│ • Availability Service   │ │                          │
│ • Swagger UI             │ │                          │
└──────────┬───────────────┘ └───────────┬─────────────┘
           │                             │
           └──────────┬──────────────────┘
                      ▼
           ┌─────────────────────┐
           │  POSTGRESQL 16      │
           │  Port: 5432         │
           │                     │
           │  Database: polimgmt │
           └─────────────────────┘
```

### Patrones Arquitectónicos

#### Backend Go - Clean Architecture (DDD)

```
features/
  └── [module]/
      ├── domain/          # Entidades + Interfaces (Contratos)
      ├── application/     # Casos de Uso + Lógica de Negocio
      ├── infrastructure/  # Implementaciones (Repos, Mappers)
      └── presentation/    # HTTP Handlers + DTOs
```

**Flujo de Datos:**
```
HTTP Request → Handler (presentation)
                  ↓
           Service (application) → Validaciones
                  ↓
           Repository Interface (domain)
                  ↓
           Repository Implementation (infrastructure)
                  ↓
                GORM → PostgreSQL
```

#### Frontend - Feature-Based Architecture

```
src/
  ├── components/     # UI Components (admin/layout/ui)
  ├── features/       # Feature-specific logic
  ├── pages/          # Route Pages (solo queries)
  ├── queries/        # TanStack Query hooks (GET)
  ├── mutations/      # TanStack Query mutations (POST/PUT/DELETE)
  ├── services/       # API clients (axios)
  ├── types/          # TypeScript interfaces
  └── lib/            # Utilities
```

**Separación de Responsabilidades:**
- **Pages**: Solo usan queries, renderizan componentes
- **Components**: Contienen mutations y lógica de UI
- **Queries**: Fetching y caching de datos
- **Mutations**: Operaciones de escritura con invalidación

---

## 📂 Estructura del Proyecto

### Raíz del Proyecto

```
PoliManage/
├── backend-go/           # Servicio principal en Go
├── backend-python/       # Servicio de pistas en Python
├── frontend/             # Aplicación React
├── db_init.sql           # Schema + Seeds SQL
├── docker-compose.yml    # Orquestación de servicios
├── start.ps1             # Script de inicio (Windows)
├── CONTEXT.md            # Contexto del proyecto
├── db_context.md         # Documentación de BD
└── PROJECT_STATUS.md     # Estado del proyecto
```

### Backend Go - Estructura Detallada

```
backend-go/
├── cmd/
│   └── api/
│       └── main.go                    # Entry point, DI, routing
├── internal/
│   ├── database/
│   │   └── connect.go                 # Conexión DB, AutoMigrate, Seeds
│   └── scheduler/
│       └── cleanup_scheduler.go       # Cron job para cleanup
├── shared/
│   ├── availability/
│   │   └── availability_service.go    # Servicio compartido de disponibilidad
│   └── database/
│       └── models.go                  # GORM models (212 líneas)
├── features/
│   ├── users/
│   │   ├── domain/
│   │   │   └── user.go                # Entity + Repository Interface
│   │   ├── application/
│   │   │   ├── user_service.go        # CRUD + Business Logic
│   │   │   └── user_provider.go       # Providers para otros módulos
│   │   ├── infrastructure/
│   │   │   └── user_repository_impl.go
│   │   └── presentation/
│   │       ├── user_handler.go        # HTTP Handlers
│   │       ├── user_dto.go            # Request/Response DTOs
│   │       └── user_routes.go         # Route registration
│   ├── roles/
│   │   └── [similar structure]
│   ├── bookings/
│   │   └── [similar structure]
│   ├── classes/
│   │   ├── domain/
│   │   ├── application/
│   │   │   ├── class_service.go
│   │   │   ├── enrollment_service.go  # Sub-agregado
│   │   │   └── class_provider.go
│   │   └── [infrastructure + presentation]
│   ├── clubs/
│   │   ├── domain/
│   │   │   ├── club.go
│   │   │   └── club_membership.go     # Sub-agregado
│   │   ├── application/
│   │   │   ├── club_service.go
│   │   │   └── club_membership_service.go
│   │   └── [infrastructure + presentation]
│   └── pista/
│       └── [solo domain para shared models]
├── docs/                              # Swagger generated
│   ├── docs.go
│   ├── swagger.json
│   └── swagger.yaml
├── go.mod                             # Dependencies
├── go.sum
├── Dockerfile
└── entrypoint.sh
```

### Backend Python - Estructura Detallada

```
backend-python/
├── main.py                            # FastAPI entry point
├── application/
│   └── services/
│       └── pista_service.py           # Business logic
├── domain/
│   ├── entities/
│   │   └── pista.py                   # Domain entity
│   ├── dtos/
│   │   └── pista_dto.py               # Data Transfer Objects
│   └── repositories/
│       └── pista_repository.py        # Repository interface
├── infrastructure/
│   ├── database/
│   │   ├── connection.py              # SQLAlchemy config
│   │   └── models.py                  # ORM models
│   ├── mappers/
│   │   └── pista_mapper.py            # Entity ↔ Model
│   └── repositories/
│       └── pista_repository_impl.py   # Repository implementation
├── presentation/
│   └── controllers/
│       └── pista_controller.py        # HTTP endpoints
├── requirements.txt
├── Dockerfile
└── entrypoint.sh
```

### Frontend - Estructura Detallada

```
frontend/
├── src/
│   ├── main.tsx                       # Entry point
│   ├── App.tsx                        # Router + QueryClient
│   ├── index.css                      # Tailwind imports
│   ├── components/
│   │   ├── ui/                        # shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   └── [30+ components]
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── admin/
│   │   │   ├── users/
│   │   │   │   ├── UserTable.tsx
│   │   │   │   ├── CreateUserModal.tsx
│   │   │   │   └── EditUserModal.tsx
│   │   │   ├── pistas/
│   │   │   │   └── [similar structure]
│   │   │   ├── bookings/
│   │   │   │   └── [similar structure]
│   │   │   ├── classes/
│   │   │   │   ├── ClassesTable.tsx
│   │   │   │   ├── EnrollmentManagerModal.tsx
│   │   │   │   └── [forms]
│   │   │   └── clubs/
│   │   │       ├── ClubsHeader.tsx
│   │   │       ├── ClubStats.tsx
│   │   │       ├── ClubFilters.tsx
│   │   │       ├── ClubsTable.tsx
│   │   │       ├── CreateClubModal.tsx
│   │   │       ├── EditClubModal.tsx
│   │   │       └── MembersModal.tsx
│   │   ├── footer2.tsx
│   │   └── logo.tsx
│   ├── pages/
│   │   └── admin/
│   │       ├── DashboardPage.tsx
│   │       ├── UsersPage.tsx
│   │       ├── PistasPage.tsx
│   │       ├── BookingsPage.tsx
│   │       ├── ClassesPage.tsx
│   │       └── ClubsPage.tsx
│   ├── queries/
│   │   ├── users/
│   │   │   └── useUsersQuery.ts
│   │   ├── pistas/
│   │   │   └── usePistasQuery.ts
│   │   ├── bookings/
│   │   │   └── useBookingsQuery.ts
│   │   ├── classes/
│   │   │   ├── useClassesQuery.ts
│   │   │   └── useEnrollmentsQuery.ts
│   │   └── clubs/
│   │       └── useClubsQuery.ts
│   ├── mutations/
│   │   ├── users/
│   │   │   ├── useCreateUser.ts
│   │   │   ├── useUpdateUser.ts
│   │   │   └── useDeleteUser.ts
│   │   ├── pistas/
│   │   │   └── [similar structure]
│   │   ├── bookings/
│   │   │   └── [similar structure]
│   │   ├── classes/
│   │   │   ├── useCreateClass.ts
│   │   │   ├── useEnrollUser.ts
│   │   │   └── useUnenrollUser.ts
│   │   └── clubs/
│   │       ├── useCreateClub.ts
│   │       ├── useUpdateClub.ts
│   │       ├── useDeleteClub.ts
│   │       ├── useAddMember.ts
│   │       └── useRemoveMember.ts
│   ├── services/
│   │   ├── userService.ts
│   │   ├── pistaService.ts
│   │   ├── bookingService.ts
│   │   ├── classService.ts
│   │   └── clubService.ts
│   ├── types/
│   │   ├── userTypes.ts
│   │   ├── pistaTypes.ts
│   │   ├── bookingTypes.ts
│   │   ├── classTypes.ts
│   │   └── clubTypes.ts
│   ├── config/
│   │   └── axios.ts                   # apiGo + apiPython instances
│   ├── lib/
│   │   ├── alerts.ts                  # SweetAlert2 wrappers
│   │   └── utils.ts                   # cn() helper
│   ├── context/
│   │   └── [future auth context]
│   └── routes/
│       └── [route definitions]
├── public/
├── components.json                    # shadcn/ui config
├── package.json
├── pnpm-lock.yaml
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── Dockerfile
└── nginx.conf
```

---

## 🔧 Backend Go - Servicio Principal

### Responsabilidades

- **Gestión de Usuarios**: CRUD completo, roles, autenticación (preparado para JWT)
- **Reservas (Bookings)**: Sistema de reservas con validación de disponibilidad
- **Clases Grupales**: CRUD de clases + sistema de inscripciones (enrollments)
- **Clubs Deportivos**: Gestión de clubs + membresías de usuarios
- **Roles**: Catálogo de roles del sistema
- **Disponibilidad**: Servicio compartido para validar horarios

### Tecnologías y Librerías

```go
// go.mod (principales)
github.com/gofiber/fiber/v2          // Web framework
gorm.io/gorm                         // ORM
gorm.io/driver/postgres              // PostgreSQL driver
github.com/swaggo/swag               // Swagger generator
github.com/swaggo/fiber-swagger      // Swagger UI
github.com/joho/godotenv             // Environment variables
golang.org/x/crypto                  // Argon2 password hashing
```

### Características Técnicas

#### 1. Clean Architecture Layers

**Domain Layer** (`domain/`)
- Entidades de negocio puras (sin dependencias externas)
- Interfaces de repositorios (contratos)
- Constantes de dominio (estados, roles, etc.)

```go
// Ejemplo: features/clubs/domain/club.go
type Club struct {
    ID              int
    OwnerID         *int
    Slug            string
    Name            string
    Description     *string
    MaxMembers      int
    MonthlyFeeCents int
    Status          string      // "ACTIVE" | "INACTIVE" | "FULL"
    // ... más campos
}

type ClubRepository interface {
    FindAll() ([]Club, error)
    FindByID(id int) (*Club, error)
    Create(club *Club) error
    Update(club *Club) error
    Delete(id int) error
}
```

**Application Layer** (`application/`)
- Services con lógica de negocio
- Validaciones de dominio
- Orquestación entre repositorios
- Providers para comunicación cross-module

```go
// Ejemplo: features/clubs/application/club_service.go
type ClubService struct {
    repo           domain.ClubRepository
    membershipRepo domain.ClubMembershipRepository
}

func (s *ClubService) CreateClub(club *domain.Club) error {
    // Validaciones
    if club.Name == "" {
        return errors.New("el nombre es obligatorio")
    }
    
    // Generar slug único
    club.Slug = s.generateUniqueSlug(club.Name)
    
    // Delegar a repositorio
    return s.repo.Create(club)
}
```

**Infrastructure Layer** (`infrastructure/`)
- Implementaciones de repositorios con GORM
- Mappers: Domain Entity ↔ GORM Model
- Lógica de persistencia

```go
// Ejemplo: features/clubs/infrastructure/club_repository_impl.go
type ClubRepositoryImpl struct {
    db *gorm.DB
}

func (r *ClubRepositoryImpl) Create(club *domain.Club) error {
    model := FromEntity(club)  // Mapper
    return r.db.Create(model).Error
}
```

**Presentation Layer** (`presentation/`)
- HTTP Handlers (controllers)
- DTOs (Request/Response)
- Route registration
- Swagger annotations

```go
// Ejemplo: features/clubs/presentation/club_handler.go
type ClubHandler struct {
    service           *application.ClubService
    membershipService *application.ClubMembershipService
    userProvider      application.UserProvider
}

// @Summary Lista todos los clubs
// @Tags Clubs
// @Produce json
// @Success 200 {array} ClubResponse
// @Router /clubs [get]
func (h *ClubHandler) GetAll(c *fiber.Ctx) error {
    clubs, err := h.service.GetAllClubs()
    // ... mapeo a DTOs y respuesta
}
```

#### 2. Dependency Injection (Manual)

En `cmd/api/main.go`:

```go
func main() {
    // 1. Conectar DB
    database.Connect()
    
    // 2. Crear repositorios
    userRepo := userInfra.NewUserRepository(database.DB)
    clubRepo := clubInfra.NewClubRepository(database.DB)
    
    // 3. Crear servicios
    userService := userApp.NewUserService(userRepo)
    clubService := clubApp.NewClubService(clubRepo, membershipRepo)
    
    // 4. Crear providers (cross-module)
    userProvider := userApp.NewClubUserProvider(userRepo)
    
    // 5. Crear handlers
    clubHandler := clubPres.NewClubHandler(clubService, membershipService, userProvider)
    
    // 6. Registrar rutas
    clubPres.RegisterRoutes(app.Group("/api/clubs"), clubHandler)
}
```

#### 3. GORM Models vs Domain Entities

**Separación clara entre capas:**

```go
// shared/database/models.go (GORM)
type Club struct {
    ID              uint           `gorm:"primaryKey"`
    OwnerID         *uint          `gorm:"index"`
    Slug            string         `gorm:"type:varchar(120);uniqueIndex"`
    // ... tags GORM, relaciones
    CreatedAt       time.Time
    UpdatedAt       time.Time
    DeletedAt       gorm.DeletedAt `gorm:"index"`
    
    Owner       *User            `gorm:"foreignKey:OwnerID"`
    Memberships []ClubMembership `gorm:"foreignKey:ClubID"`
}

// features/clubs/domain/club.go (Domain)
type Club struct {
    ID              int
    OwnerID         *int
    Slug            string
    // ... sin tags, sin dependencias externas
    
    // Campos calculados/expandidos
    OwnerName   *string
    MemberCount int
}
```

**Mappers en Infrastructure:**

```go
func ToEntity(model *database.Club) *domain.Club {
    club := &domain.Club{
        ID:   int(model.ID),
        Name: model.Name,
        // ... conversiones
    }
    
    if model.Owner != nil {
        club.OwnerName = &model.Owner.FullName
    }
    
    return club
}
```

#### 4. Servicios Compartidos

**AvailabilityService** (`shared/availability/`)
- Valida disponibilidad de pistas en rangos horarios
- Usado por Bookings y Classes
- Previene reservas solapadas

```go
type AvailabilityService struct {
    db *gorm.DB
}

func (s *AvailabilityService) IsPistaAvailable(
    pistaID int, 
    start, end time.Time,
) (bool, error) {
    // Consulta DB para buscar conflictos
}
```

**UserProvider** (pattern Provider)
- Permite que Clubs y Classes obtengan info de usuarios sin acoplarse
- Dos implementaciones: `ClassUserProvider`, `ClubUserProvider`

```go
// features/classes/application/enrollment_service.go
type UserProvider interface {
    GetUserBySlug(slug string) (UserInfo, error)
}

// Implementado en features/users/application/user_provider.go
type ClassUserProvider struct {
    userRepo userDomain.UserRepository
}
```

#### 5. Gestión de Slugs Únicos

```go
// features/clubs/application/club_service.go
func (s *ClubService) generateUniqueSlug(name string) string {
    baseSlug := generateClubSlug(name)  // "club-de-tenis"
    slug := baseSlug
    counter := 1
    
    // Buscar hasta encontrar slug disponible
    for {
        _, err := s.repo.FindBySlug(slug)
        if err != nil {
            break  // No existe, usar este
        }
        slug = fmt.Sprintf("%s-%d", baseSlug, counter)
        counter++
    }
    
    return slug  // "club-de-tenis" o "club-de-tenis-1"
}
```

#### 6. Soft Deletes

Todas las entidades principales tienen `deleted_at`:

```go
// GORM automáticamente filtra registros eliminados
db.Find(&clubs)  // WHERE deleted_at IS NULL

// Para eliminar lógicamente
db.Delete(&club)  // UPDATE clubs SET deleted_at = NOW()

// Para incluir eliminados
db.Unscoped().Find(&clubs)
```

#### 7. Swagger Documentation

```go
// @title PoliManage API
// @version 1.0
// @host localhost:8080
// @BasePath /api

// En cada handler:
// @Summary Crea un nuevo club
// @Tags Clubs
// @Accept json
// @Produce json
// @Param club body CreateClubRequest true "Datos del club"
// @Success 201 {object} ClubResponse
// @Router /clubs [post]
func (h *ClubHandler) Create(c *fiber.Ctx) error {
    // ...
}
```

Generar documentación:
```bash
swag init -g cmd/api/main.go
```

Acceder: `http://localhost:8080/swagger/`

---

## 🐍 Backend Python - Servicio de Pistas

### Responsabilidades

- **CRUD de Pistas**: Creación, lectura, actualización, eliminación
- **Gestión de Deportes**: Catálogo de deportes disponibles
- **Validaciones**: Superficie, tipo, precios

### Tecnologías

```python
# requirements.txt
fastapi==0.115.12
uvicorn==0.34.0
sqlalchemy==2.0.37
psycopg2-binary==2.9.10
pydantic==2.10.6
python-dotenv==1.0.1
```

### Arquitectura (Clean Architecture)

Similar al backend Go pero con sintaxis Python:

```python
# domain/entities/pista.py
@dataclass
class Pista:
    id: Optional[int]
    nombre: str
    tipo: str
    superficie: Optional[str]
    precio_base_cents: int
    esta_activa: bool

# application/services/pista_service.py
class PistaService:
    def __init__(self, repository: PistaRepository):
        self.repository = repository
    
    def crear_pista(self, pista: Pista) -> Pista:
        # Validaciones
        if not pista.nombre:
            raise ValueError("El nombre es obligatorio")
        return self.repository.crear(pista)

# infrastructure/repositories/pista_repository_impl.py
class PistaRepositoryImpl(PistaRepository):
    def __init__(self, db: Session):
        self.db = db
    
    def crear(self, pista: Pista) -> Pista:
        model = PistaMapper.to_model(pista)
        self.db.add(model)
        self.db.commit()
        return PistaMapper.to_entity(model)

# presentation/controllers/pista_controller.py
@router.post("/", response_model=PistaDTO)
def crear_pista(pista_dto: CrearPistaDTO):
    pista = PistaMapper.dto_to_entity(pista_dto)
    resultado = pista_service.crear_pista(pista)
    return PistaMapper.entity_to_dto(resultado)
```

### Integración con Go Backend

- Ambos backends **comparten la misma base de datos**
- Python maneja tabla `pistas`, Go la consulta vía GORM
- Comunicación indirecta vía BD (no hay HTTP entre backends)

---

## ⚛️ Frontend React

### Tecnologías y Librerías

```json
// package.json (principales)
"dependencies": {
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^7.1.3",
  "@tanstack/react-query": "^5.62.15",
  "react-hook-form": "^7.71.1",
  "axios": "^1.7.9",
  "sweetalert2": "^11.15.10",
  "lucide-react": "^0.469.0",
  "tailwindcss": "^3.4.17",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.6.0"
}
```

### Arquitectura de Componentes

#### 1. Separación Pages vs Components

**Pages** (Solo lectura + renderizado):
```tsx
// src/pages/admin/ClubsPage.tsx
export function ClubsPage() {
  // Solo queries (GET)
  const { data: clubs, isLoading } = useClubsQuery();
  
  // Estado local UI
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Filtrado en memoria
  const filteredClubs = useMemo(() => 
    clubs?.filter(c => c.name.includes(searchTerm)) || []
  , [clubs, searchTerm]);
  
  // Solo renderiza componentes
  return (
    <>
      <ClubsHeader onCreateClick={() => setIsCreateModalOpen(true)} />
      <ClubStats clubs={clubs} />
      <ClubFilters onSearch={setSearchTerm} />
      <ClubsTable clubs={filteredClubs} />
      <CreateClubModal isOpen={isCreateModalOpen} onClose={...} />
    </>
  );
}
```

**Components** (Con mutations):
```tsx
// src/components/admin/clubs/ClubsTable.tsx
export function ClubsTable({ clubs }: ClubsTableProps) {
  const deleteMutation = useDeleteClub();  // ← Mutation aquí
  
  const handleDelete = async (slug: string) => {
    const confirmed = await showConfirm(...);
    if (confirmed) {
      await deleteMutation.mutateAsync(slug);
    }
  };
  
  return (
    <table>
      {clubs.map(club => (
        <tr key={club.id}>
          <td>{club.name}</td>
          <td>
            <Button onClick={() => handleDelete(club.slug)}>
              Eliminar
            </Button>
          </td>
        </tr>
      ))}
    </table>
  );
}
```

#### 2. TanStack Query (React Query)

**Queries** (GET requests):
```typescript
// src/queries/clubs/useClubsQuery.ts
export const useClubsQuery = () => {
  return useQuery({
    queryKey: ['clubs'],
    queryFn: () => clubService.getAll(),
    staleTime: 5 * 60 * 1000,  // 5 min
  });
};

export const useClubMembersQuery = (clubSlug: string) => {
  return useQuery({
    queryKey: ['club-members', clubSlug],
    queryFn: () => clubService.getMembers(clubSlug),
    enabled: !!clubSlug,
  });
};
```

**Mutations** (POST/PUT/DELETE):
```typescript
// src/mutations/clubs/useCreateClub.ts
export const useCreateClub = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateClubData) => clubService.create(data),
    onSuccess: () => {
      // Invalidar queries para refetch automático
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
  });
};

// src/mutations/clubs/useAddMember.ts
export const useAddMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ clubSlug, userSlug }) => 
      clubService.addMember(clubSlug, userSlug),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      // Invalidar query específica
      queryClient.invalidateQueries({ 
        queryKey: ['club-members', variables.clubSlug] 
      });
    },
  });
};
```

**Ventajas:**
- ✅ Cache automático
- ✅ Refetch en background
- ✅ Invalidación granular
- ✅ Loading/error states
- ✅ Deduplicación de requests

#### 3. Axios Configuration

```typescript
// src/config/axios.ts
import axios from 'axios';

export const apiGo = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

export const apiPython = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Preparado para interceptors (JWT futuro)
// apiGo.interceptors.request.use(config => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });
```

#### 4. Services Layer

```typescript
// src/services/clubService.ts
import { apiGo } from '@/config/axios';
import type { Club, CreateClubData, UpdateClubData } from '@/types/clubTypes';

export const clubService = {
  async getAll(): Promise<Club[]> {
    const { data } = await apiGo.get('/clubs');
    return data;
  },
  
  async getBySlug(slug: string): Promise<Club> {
    const { data } = await apiGo.get(`/clubs/${slug}`);
    return data;
  },
  
  async create(clubData: CreateClubData): Promise<Club> {
    const { data } = await apiGo.post('/clubs', clubData);
    return data;
  },
  
  async update(slug: string, clubData: UpdateClubData): Promise<Club> {
    const { data } = await apiGo.put(`/clubs/${slug}`, clubData);
    return data;
  },
  
  async delete(slug: string): Promise<void> {
    await apiGo.delete(`/clubs/${slug}`);
  },
  
  async getMembers(clubSlug: string): Promise<ClubMembership[]> {
    const { data } = await apiGo.get(`/clubs/${clubSlug}/members`);
    return data;
  },
  
  async addMember(clubSlug: string, userSlug: string): Promise<ClubMembership> {
    const { data } = await apiGo.post(`/clubs/${clubSlug}/members`, { userSlug });
    return data;
  },
  
  async removeMember(membershipId: number): Promise<void> {
    await apiGo.delete(`/clubs/memberships/${membershipId}`);
  },
};
```

#### 5. TypeScript Types

```typescript
// src/types/clubTypes.ts
export type ClubStatus = 'ACTIVE' | 'INACTIVE' | 'FULL';

export interface Club {
  id: number;
  ownerId?: number;
  ownerSlug?: string;
  ownerName?: string;
  slug: string;
  name: string;
  description?: string;
  logoUrl?: string;
  maxMembers: number;
  monthlyFeeCents: number;
  monthlyFeeEuros: number;
  status: ClubStatus;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClubData {
  ownerSlug?: string;
  name: string;
  description?: string;
  logoUrl?: string;
  maxMembers: number;
  monthlyFeeCents: number;
  isActive: boolean;
}

export interface UpdateClubData extends CreateClubData {
  status: ClubStatus;
}

export type MembershipStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED';

export interface ClubMembership {
  id: number;
  clubId: number;
  clubSlug: string;
  clubName: string;
  userId: number;
  userSlug: string;
  userName: string;
  userEmail: string;
  status: MembershipStatus;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### 6. React Hook Form + Validation

```tsx
// src/components/admin/clubs/CreateClubModal.tsx
import { useForm, Controller } from 'react-hook-form';

export function CreateClubModal({ isOpen, onClose }: Props) {
  const createMutation = useCreateClub();
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateClubData>({
    defaultValues: {
      monthlyFeeCents: 0,
      maxMembers: 50,
      isActive: true,
    },
  });
  
  const onSubmit = async (data: CreateClubData) => {
    try {
      // Filtrar valores especiales (Select no permite value="")
      const submitData = {
        ...data,
        ownerSlug: data.ownerSlug === '__none__' ? undefined : data.ownerSlug,
      };
      
      await createMutation.mutateAsync(submitData);
      showSuccess('Club creado');
      reset();
      onClose();
    } catch (error: any) {
      showError('Error', error?.response?.data?.error);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register('name', { 
            required: 'El nombre es obligatorio' 
          })}
        />
        {errors.name && <p className="text-red-600">{errors.name.message}</p>}
        
        {/* Select con Controller para componentes controlados */}
        <Controller
          name="ownerSlug"
          control={control}
          render={({ field }) => (
            <Select value={field.value || '__none__'} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sin propietario</SelectItem>
                {owners.map(owner => (
                  <SelectItem key={owner.slug} value={owner.slug}>
                    {owner.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        
        <Button type="submit">Crear</Button>
      </form>
    </Dialog>
  );
}
```

#### 7. UI Components (shadcn/ui)

Basados en Radix UI + Tailwind:

```tsx
// src/components/ui/button.tsx
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

// Uso:
<Button variant="outline" size="sm" onClick={handleClick}>
  Click me
</Button>
```

Componentes disponibles:
- Button, Input, Textarea, Select, Checkbox, Switch
- Dialog, Sheet, Popover, Tooltip
- Table, Card, Badge, Avatar
- Alert, Toast (via SweetAlert2)
- Dropdown, Tabs, Accordion
- Y más...

#### 8. Alerts con SweetAlert2

```typescript
// src/lib/alerts.ts
import Swal from 'sweetalert2';

export const showSuccess = (title: string, text?: string) => {
  Swal.fire({
    icon: 'success',
    title,
    text,
    timer: 2000,
    showConfirmButton: false,
  });
};

export const showError = (title: string, text?: string) => {
  Swal.fire({
    icon: 'error',
    title,
    text,
  });
};

export const showConfirm = async (
  title: string,
  text: string
): Promise<boolean> => {
  const result = await Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
  });
  return result.isConfirmed;
};

// Uso:
const handleDelete = async () => {
  const confirmed = await showConfirm(
    '¿Eliminar club?',
    'Esta acción no se puede deshacer'
  );
  
  if (confirmed) {
    try {
      await deleteMutation.mutateAsync(clubSlug);
      showSuccess('Club eliminado');
    } catch (error: any) {
      showError('Error', error?.response?.data?.error);
    }
  }
};
```

#### 9. Layout y Routing

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="pistas" element={<PistasPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="clubs" element={<ClubsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// src/components/layout/DashboardLayout.tsx
export function DashboardLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />  {/* Renderiza rutas hijas */}
        </main>
      </div>
    </div>
  );
}
```

---

## 💾 Base de Datos PostgreSQL

### Schema Completo

#### Módulo 1: Identidad y Autenticación

**roles**
```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, 
    description VARCHAR(255)
);

-- Roles del sistema:
-- 1: ADMIN      - Administrador con acceso completo
-- 2: GESTOR     - Personal del polideportivo con permisos de gestión
-- 3: CLUB       - Dueño/Gestor de club deportivo
-- 4: MONITOR    - Monitor de clases y entrenamientos
-- 5: CLIENTE    - Usuario externo del polideportivo
```

**users**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL DEFAULT 5 REFERENCES roles(id),
    slug VARCHAR(120) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,  -- Argon2id
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    stripe_customer_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Módulo 2: Configuración

**opening_hours**
```sql
CREATE TABLE opening_hours (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT FALSE,
    notes TEXT
);

-- 0=Domingo, 1=Lunes, ..., 6=Sábado
-- Seed: Lunes-Viernes 09:00-23:00, Sábado 09:00-22:00, Domingo 09:00-21:00
```

#### Módulo 3: Recursos y Reservas

**pistas**
```sql
CREATE TABLE pistas (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(120) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,  -- TENIS, PADEL, FUTBOL_SALA, etc.
    superficie VARCHAR(50),     -- TIERRA_BATIDA, CESPED_ARTIFICIAL, etc.
    ubicacion VARCHAR(100),
    esta_activa BOOLEAN DEFAULT TRUE,
    estado VARCHAR(50) DEFAULT 'AVAILABLE',  -- AVAILABLE, MAINTENANCE
    precio_base_cents INTEGER NOT NULL CHECK (precio_base_cents >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_pistas_tipo ON pistas(tipo);
CREATE INDEX idx_pistas_slug ON pistas(slug);
```

**bookings**
```sql
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    pista_id INTEGER NOT NULL REFERENCES pistas(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL,
    total_price_cents INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'CONFIRMED',  -- CONFIRMED, CANCELLED, COMPLETED
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_bookings_dates ON bookings(start_time, end_time);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_pista ON bookings(pista_id);

-- Prevenir solapamientos
CREATE UNIQUE INDEX idx_booking_overlap ON bookings (pista_id, start_time) 
    WHERE status != 'CANCELLED' AND deleted_at IS NULL;
```

#### Módulo 4: Clases Grupales

**classes**
```sql
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    pista_id INTEGER NOT NULL REFERENCES pistas(id),
    instructor_id INTEGER NOT NULL REFERENCES users(id),
    slug VARCHAR(120) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL,
    max_participants INTEGER NOT NULL DEFAULT 10,
    price_cents INTEGER NOT NULL DEFAULT 0,
    difficulty_level VARCHAR(50) DEFAULT 'BEGINNER',  -- BEGINNER, INTERMEDIATE, ADVANCED
    status VARCHAR(50) DEFAULT 'SCHEDULED',  -- SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(50),  -- WEEKLY, BIWEEKLY, MONTHLY
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_classes_dates ON classes(start_time, end_time);
CREATE INDEX idx_classes_instructor ON classes(instructor_id);
```

**class_enrollments**
```sql
CREATE TABLE class_enrollments (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'CONFIRMED',  -- CONFIRMED, WAITLIST, CANCELLED
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_class_user UNIQUE (class_id, user_id)
);

CREATE INDEX idx_enrollments_class ON class_enrollments(class_id);
CREATE INDEX idx_enrollments_user ON class_enrollments(user_id);
```

#### Módulo 5: Clubs Deportivos

**clubs**
```sql
CREATE TABLE clubs (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES users(id),  -- Usuario tipo CLUB
    slug VARCHAR(120) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    logo_url TEXT,
    max_members INTEGER NOT NULL DEFAULT 50,
    monthly_fee_cents INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',  -- ACTIVE, INACTIVE, FULL
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_clubs_slug ON clubs(slug);
CREATE INDEX idx_clubs_owner ON clubs(owner_id);
```

**club_memberships**
```sql
CREATE TABLE club_memberships (
    id SERIAL PRIMARY KEY,
    club_id INTEGER NOT NULL REFERENCES clubs(id),
    user_id INTEGER NOT NULL REFERENCES users(id),  -- Solo CLIENTE (role_id=5)
    status VARCHAR(50) DEFAULT 'ACTIVE',  -- ACTIVE, SUSPENDED, EXPIRED, CANCELLED
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_club_user UNIQUE (club_id, user_id)
);

CREATE INDEX idx_memberships_club ON club_memberships(club_id);
CREATE INDEX idx_memberships_user ON club_memberships(user_id);
```

#### Módulo 6: Pagos (Preparado para Stripe)

**payments**
```sql
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    booking_id INTEGER REFERENCES bookings(id),
    club_membership_id INTEGER REFERENCES club_memberships(id),
    amount_cents INTEGER NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'STRIPE',
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PENDING',  -- PENDING, COMPLETED, FAILED, REFUNDED
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_stripe ON payments(stripe_payment_intent_id);
```

### Triggers y Funciones

```sql
-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicado a todas las tablas principales
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_pistas_modtime BEFORE UPDATE ON pistas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
-- ... (y así sucesivamente para cada tabla)
```

### Seeds Iniciales

```sql
-- Roles
INSERT INTO roles (id, name, description) VALUES 
(1, 'ADMIN', 'Administrador con acceso completo al sistema'), 
(2, 'GESTOR', 'Personal del polideportivo con permisos de gestión'), 
(3, 'CLUB', 'Dueño/Gestor de club deportivo'),
(4, 'MONITOR', 'Monitor de clases y entrenamientos'),
(5, 'CLIENTE', 'Usuario externo del polideportivo');

-- Horarios
INSERT INTO opening_hours (day_of_week, open_time, close_time) VALUES
(1, '09:00', '23:00'), (2, '09:00', '23:00'), (3, '09:00', '23:00'), 
(4, '09:00', '23:00'), (5, '09:00', '23:00'), (6, '09:00', '22:00'), 
(0, '09:00', '21:00');

-- Pistas de ejemplo
INSERT INTO pistas (nombre, slug, tipo, superficie, precio_base_cents) VALUES
('Pista Central de Tenis', 'pista-central-de-tenis', 'TENIS', 'TIERRA_BATIDA', 1500),
('Pádel 1', 'padel-1', 'PADEL', 'CESPED_ARTIFICIAL', 1200),
('Fútbol Sala Principal', 'futbol-sala-principal', 'FUTBOL_SALA', 'PARQUET', 2500);
```

### Índices para Performance

```sql
-- Búsquedas frecuentes
CREATE INDEX idx_bookings_dates ON bookings(start_time, end_time);
CREATE INDEX idx_classes_dates ON classes(start_time, end_time);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);

-- Soft deletes
CREATE INDEX idx_users_deleted ON users(deleted_at);
CREATE INDEX idx_pistas_deleted ON pistas(deleted_at);
CREATE INDEX idx_clubs_deleted ON clubs(deleted_at);

-- Relaciones
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_pista ON bookings(pista_id);
CREATE INDEX idx_enrollments_class ON class_enrollments(class_id);
CREATE INDEX idx_memberships_club ON club_memberships(club_id);
```

---

## 🐳 Infraestructura Docker

### docker-compose.yml

```yaml
services:
  # Base de datos PostgreSQL
  postgres:
    image: postgres:16-alpine
    container_name: polimanage-postgres
    environment:
      POSTGRES_DB: polimgmt
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: adminpassword
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db_init.sql:/docker-entrypoint-initdb.d/01-init.sql
    networks:
      - polimanage-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d polimgmt"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend Go (Servicio principal)
  backend-go:
    build:
      context: ./backend-go
      dockerfile: Dockerfile
    container_name: polimanage-backend-go
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: polimgmt
      DB_USER: admin
      DB_PASSWORD: adminpassword
      PORT: 8080
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - polimanage-network
    volumes:
      - ./backend-go:/app
    restart: unless-stopped

  # Backend Python (Servicio de pistas)
  backend-python:
    build:
      context: ./backend-python
      dockerfile: Dockerfile
    container_name: polimanage-backend-python
    environment:
      DATABASE_URL: postgresql://admin:adminpassword@postgres:5432/polimgmt
      PORT: 8000
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - polimanage-network
    volumes:
      - ./backend-python:/app
    restart: unless-stopped

  # Frontend React
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: polimanage-frontend
    ports:
      - "80:80"
    depends_on:
      - backend-go
      - backend-python
    networks:
      - polimanage-network
    restart: unless-stopped

  # PgAdmin (opcional, para gestión de BD)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: polimanage-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@polimanage.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres
    networks:
      - polimanage-network
    restart: unless-stopped

networks:
  polimanage-network:
    driver: bridge

volumes:
  postgres_data:
```

### Dockerfiles

**Backend Go:**
```dockerfile
FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/api

FROM alpine:latest
RUN apk --no-cache add ca-certificates postgresql-client bash
WORKDIR /root/
COPY --from=builder /app/main .
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["./entrypoint.sh"]
```

**Backend Python:**
```dockerfile
FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y postgresql-client
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN chmod +x entrypoint.sh
EXPOSE 8000
ENTRYPOINT ["./entrypoint.sh"]
```

**Frontend:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Scripts de Inicio

**start.ps1** (Windows):
```powershell
param([switch]$Clean)

Write-Host "🔷 PoliManage - Inicio de Servicios" -ForegroundColor Cyan

# Detener contenedores
docker compose down

if ($Clean) {
    Write-Host "🧹 Limpiando volúmenes..." -ForegroundColor Yellow
    docker compose down -v
}

# Construir imágenes
Write-Host "🔨 Construyendo imágenes..." -ForegroundColor Yellow
docker compose build

# Iniciar servicios
Write-Host "🚀 Iniciando servicios..." -ForegroundColor Green
docker compose up -d

Write-Host "✅ Servicios iniciados" -ForegroundColor Green
Write-Host "📊 Frontend: http://localhost" -ForegroundColor Cyan
Write-Host "🔧 Backend Go: http://localhost:8080" -ForegroundColor Cyan
Write-Host "🐍 Backend Python: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 Swagger: http://localhost:8080/swagger/" -ForegroundColor Cyan
Write-Host "🗄️  PgAdmin: http://localhost:5050" -ForegroundColor Cyan
```

---

## 🧩 Módulos Funcionales Detallados

### 1. Módulo Users (Usuarios)

**Responsabilidades:**
- CRUD de usuarios
- Gestión de roles
- Hash de contraseñas (Argon2id)
- Generación de slugs
- Providers para otros módulos

**Endpoints:**
```
GET    /api/users              # Lista todos los usuarios
GET    /api/users/:slug        # Obtiene usuario por slug
POST   /api/users              # Crea nuevo usuario
PUT    /api/users/:slug        # Actualiza usuario
DELETE /api/users/:slug        # Elimina usuario (soft delete)
```

**Entidad Domain:**
```go
type User struct {
    ID               int
    RoleID           int
    Slug             string
    Email            string
    PasswordHash     string
    FullName         string
    Phone            *string
    AvatarURL        *string
    StripeCustomerID *string
    IsActive         bool
    LastLoginAt      *time.Time
    CreatedAt        time.Time
    UpdatedAt        time.Time
}
```

**Validaciones:**
- Email único y formato válido
- Password mínimo 6 caracteres (hasheado con Argon2id)
- FullName obligatorio
- Slug generado del email (antes de @)
- RoleID entre 1-5

**Providers:**
```go
// ClassUserProvider - para enrollments
func (p *ClassUserProvider) GetUserBySlug(slug string) (UserInfo, error)

// ClubUserProvider - para memberships
func (p *ClubUserProvider) GetUserBySlug(slug string) (UserInfo, error)

type UserInfo struct {
    ID     int
    RoleID int
}
```

### 2. Módulo Pistas

**Responsabilidades:**
- CRUD de pistas deportivas
- Gestión de disponibilidad
- Tipos y superficies
- Precios base

**Endpoints (Python):**
```
GET    /api/pistas             # Lista todas las pistas
GET    /api/pistas/:id         # Obtiene pista por ID
POST   /api/pistas             # Crea nueva pista
PUT    /api/pistas/:id         # Actualiza pista
DELETE /api/pistas/:id         # Elimina pista
```

**Tipos de Pista:**
- TENIS
- PADEL
- FUTBOL_SALA
- BALONCESTO
- VOLEIBOL
- SQUASH

**Superficies:**
- TIERRA_BATIDA
- CESPED_ARTIFICIAL
- CESPED_NATURAL
- PARQUET
- TARTAN
- HORMIGON

### 3. Módulo Bookings (Reservas)

**Responsabilidades:**
- Sistema de reservas de pistas
- Validación de disponibilidad
- Prevención de solapamientos
- Cálculo de precios
- Estados de reserva

**Endpoints:**
```
GET    /api/bookings                    # Lista todas las reservas
GET    /api/bookings/:id                # Obtiene reserva por ID
POST   /api/bookings                    # Crea nueva reserva
PUT    /api/bookings/:id                # Actualiza reserva
DELETE /api/bookings/:id                # Cancela reserva
GET    /api/bookings/pista/:id/check    # Verifica disponibilidad
```

**Flujo de Creación:**
1. Cliente selecciona pista, fecha y hora
2. Frontend llama `checkAvailability` (opcional)
3. Backend valida con `AvailabilityService`
4. Se crea `Booking` con estado `CONFIRMED`
5. Se calcula precio: `duration_minutes * (precio_base / 60)`

**Validaciones:**
- Pista existe y está activa
- Horario dentro de `opening_hours`
- No hay solapamientos (índice único)
- Usuario existe

**Estados:**
- `CONFIRMED` - Reserva confirmada
- `CANCELLED` - Cancelada por usuario/admin
- `COMPLETED` - Finalizada

### 4. Módulo Classes (Clases Grupales)

**Responsabilidades:**
- Gestión de clases programadas
- Sistema de inscripciones (enrollments)
- Validación de capacidad
- Asignación de instructores
- Niveles de dificultad

**Endpoints:**
```
# Clases
GET    /api/classes              # Lista todas las clases
GET    /api/classes/:slug        # Obtiene clase por slug
POST   /api/classes              # Crea nueva clase
PUT    /api/classes/:slug        # Actualiza clase
DELETE /api/classes/:slug        # Elimina clase

# Inscripciones
GET    /api/classes/:slug/enrollments      # Lista inscritos en clase
POST   /api/classes/:slug/enroll           # Inscribir usuario
DELETE /api/enrollments/:id                # Desinscribir usuario
```

**Entidades:**
```go
type Class struct {
    ID               int
    PistaID          int
    InstructorID     int
    Slug             string
    Title            string
    Description      *string
    StartTime        time.Time
    EndTime          time.Time
    DurationMinutes  int
    MaxParticipants  int
    PriceCents       int
    DifficultyLevel  string  // BEGINNER, INTERMEDIATE, ADVANCED
    Status           string  // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    IsRecurring      bool
    RecurrencePattern *string // WEEKLY, BIWEEKLY, MONTHLY
}

type ClassEnrollment struct {
    ID          int
    ClassID     int
    UserID      int
    Status      string  // CONFIRMED, WAITLIST, CANCELLED
    RegisteredAt time.Time
}
```

**Flujo de Inscripción:**
1. Usuario (CLIENTE) solicita inscripción
2. Backend verifica capacidad disponible
3. Si hay espacio: estado `CONFIRMED`
4. Si lleno: podría ir a `WAITLIST` (futuro)
5. Se invalidan queries en frontend

**Validaciones:**
- Clase existe y no está cancelada
- Usuario es CLIENTE (roleId=5)
- No supera capacidad máxima
- No duplicar inscripción (unique constraint)
- Horario no solapa con pista (usa AvailabilityService)

**Provider Pattern:**
```go
// ClassProvider - para que Enrollments obtenga info de clases
type ClassProvider interface {
    GetClassBySlug(slug string) (ClassInfo, error)
}

// UserProvider - para obtener info de usuarios
type UserProvider interface {
    GetUserBySlug(slug string) (UserInfo, error)
}
```

### 5. Módulo Clubs

**Responsabilidades:**
- Gestión de clubs deportivos
- Sistema de membresías
- Validación de capacidad
- Asignación de propietarios (usuarios CLUB)
- Generación de slugs únicos

**Endpoints:**
```
# Clubs
GET    /api/clubs                    # Lista todos los clubs
GET    /api/clubs/:slug              # Obtiene club por slug
POST   /api/clubs                    # Crea nuevo club
PUT    /api/clubs/:slug              # Actualiza club
DELETE /api/clubs/:slug              # Elimina club

# Memberships
GET    /api/clubs/:slug/members      # Lista miembros del club
POST   /api/clubs/:slug/members      # Añade miembro al club
DELETE /api/clubs/memberships/:id    # Elimina membresía
```

**Entidades:**
```go
type Club struct {
    ID              int
    OwnerID         *int      // Usuario con rol CLUB (roleId=3)
    Slug            string
    Name            string
    Description     *string
    LogoURL         *string
    MaxMembers      int
    MonthlyFeeCents int
    Status          string    // ACTIVE, INACTIVE, FULL
    IsActive        bool
    
    // Campos expandidos
    OwnerSlug   *string
    OwnerName   *string
    MemberCount int
}

type ClubMembership struct {
    ID        int
    ClubID    int
    UserID    int       // Solo CLIENTE (roleId=5)
    Status    string    // ACTIVE, SUSPENDED, EXPIRED, CANCELLED
    StartDate time.Time
    EndDate   *time.Time
    IsActive  bool
    
    // Campos expandidos
    ClubSlug  string
    ClubName  string
    UserSlug  string
    UserName  string
    UserEmail string
}
```

**Generación de Slugs Únicos:**
```go
func (s *ClubService) generateUniqueSlug(name string) string {
    baseSlug := "club-de-tenis"
    slug := baseSlug
    counter := 1
    
    for {
        _, err := s.repo.FindBySlug(slug)
        if err != nil {
            break  // No existe, usar este
        }
        slug = fmt.Sprintf("%s-%d", baseSlug, counter)
        counter++
    }
    
    return slug  // "club-de-tenis" o "club-de-tenis-1"
}
```

**Validaciones:**
- Nombre obligatorio
- Capacidad mínima 1
- Cuota mensual no negativa
- Owner debe ser usuario con rol CLUB (roleId=3)
- Miembros deben ser CLIENTE (roleId=5)
- No permitir eliminación con miembros activos

**Estados:**
- `ACTIVE` - Club operativo
- `INACTIVE` - Temporalmente cerrado
- `FULL` - Capacidad alcanzada (calculado)

**Frontend - Componentes:**
```
ClubsPage (queries only)
├── ClubsHeader (botón crear)
├── ClubStats (total, activos, miembros, revenue)
├── ClubFilters (búsqueda + filtro estado)
└── ClubsTable (mutations)
    ├── CreateClubModal (react-hook-form)
    ├── EditClubModal (react-hook-form)
    └── MembersModal
        ├── Lista miembros
        ├── Añadir miembro (Select de CLIENTES)
        └── Eliminar miembro (confirmación)
```

### 6. Módulo Roles

**Responsabilidades:**
- Catálogo de roles del sistema
- Solo lectura (no se crean/editan/eliminan roles)

**Endpoints:**
```
GET    /api/roles               # Lista todos los roles
```

**Roles del Sistema:**
```
1 - ADMIN    - Administrador con acceso completo
2 - GESTOR   - Personal del polideportivo con permisos de gestión
3 - CLUB     - Dueño/Gestor de club deportivo
4 - MONITOR  - Monitor de clases y entrenamientos
5 - CLIENTE  - Usuario externo del polideportivo
```

---

## 🔄 Flujos de Trabajo

### Flujo: Crear Usuario

```
1. Usuario admin abre UsersPage
   ↓
2. Frontend: useUsersQuery() carga usuarios
   ↓
3. Admin click "Nuevo Usuario"
   ↓
4. CreateUserModal se abre
   ↓
5. Admin completa form (react-hook-form)
   - Email, Password, FullName, Role
   ↓
6. Submit → useCreateUser mutation
   ↓
7. Frontend → POST /api/users
   ↓
8. Backend Go:
   - Handler valida request
   - Service hashea password (Argon2id)
   - Service genera slug (email)
   - Repository crea en DB
   ↓
9. Success → mutation onSuccess
   ↓
10. queryClient.invalidateQueries(['users'])
   ↓
11. useUsersQuery refetch automático
   ↓
12. Lista se actualiza con nuevo usuario
   ↓
13. Modal se cierra, toast de éxito
```

### Flujo: Reservar Pista

```
1. Cliente selecciona pista y horario
   ↓
2. Frontend valida horarios (opening_hours)
   ↓
3. (Opcional) Check availability
   GET /api/bookings/pista/:id/check?start=...&end=...
   ↓
4. useCreateBooking mutation
   POST /api/bookings
   {
     pistaId: 1,
     startTime: "2026-02-05T10:00:00Z",
     endTime: "2026-02-05T11:00:00Z"
   }
   ↓
5. Backend Go:
   - Handler extrae userId (temporal: hardcoded admin)
   - Service valida:
     * Pista existe y activa
     * AvailabilityService.IsPistaAvailable()
     * Horario dentro de opening_hours
   - Service calcula precio
   - Repository crea booking
   ↓
6. Si conflicto (solapamiento):
   ERROR 400: "La pista ya está reservada en ese horario"
   ↓
7. Si OK:
   SUCCESS 201: BookingResponse
   ↓
8. Frontend invalida queries, refetch, toast éxito
```

### Flujo: Inscribir Usuario en Clase

```
1. Admin abre ClassesPage
   ↓
2. Click "Gestionar Inscritos" en clase
   ↓
3. EnrollmentManagerModal se abre
   ↓
4. useEnrollmentsQuery(classSlug) carga inscritos
   useUsersQuery() carga todos usuarios
   ↓
5. Admin selecciona usuario CLIENTE en Select
   ↓
6. Click "Inscribir"
   ↓
7. useEnrollUser mutation
   POST /api/classes/:slug/enroll
   { userSlug: "juan-perez" }
   ↓
8. Backend Go:
   - Handler obtiene clase por slug
   - UserProvider.GetUserBySlug() obtiene usuario
   - EnrollmentService valida:
     * Usuario es CLIENTE (roleId=5)
     * Clase no llena (count < maxParticipants)
     * No duplicar inscripción
   - Repository crea enrollment
   ↓
9. Success → invalidateQueries(['enrollments', classSlug])
   ↓
10. Lista se actualiza, usuario aparece
   ↓
11. Select se resetea, puede añadir más
```

### Flujo: Añadir Miembro a Club

```
1. Admin abre ClubsPage
   ↓
2. Click "Ver Miembros" en club
   ↓
3. MembersModal se abre
   ↓
4. useClubMembersQuery(clubSlug) carga miembros
   useUsersQuery() carga todos usuarios
   ↓
5. Frontend filtra:
   - clients = users.filter(u => u.roleId === 5)
   - availableClients = clients.filter(c => !memberUserSlugs.includes(c.slug))
   ↓
6. Admin selecciona cliente disponible
   ↓
7. Click "Añadir"
   ↓
8. useAddMember mutation
   POST /api/clubs/:slug/members
   { userSlug: "maria-lopez" }
   ↓
9. Backend Go:
   - Handler obtiene club por slug
   - UserProvider.GetUserBySlug() obtiene usuario
   - ClubMembershipService valida:
     * Usuario es CLIENTE (roleId=5)
     * Club no lleno (memberCount < maxMembers)
     * No duplicar membresía
   - Repository crea membership
   ↓
10. Success → invalidateQueries:
    - ['clubs']  (actualizar memberCount)
    - ['club-members', clubSlug]  (actualizar lista)
   ↓
11. Queries refetch automático
   ↓
12. Lista se actualiza, nuevo miembro aparece
   ↓
13. Select se resetea (selectedUserSlug = '')
   ↓
14. availableClients se recalcula (excluye nuevo miembro)
   ↓
15. Select muestra clientes disponibles restantes
```

---

## ⚙️ Configuración y Deployment

### Variables de Entorno

**Backend Go (.env):**
```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=polimgmt
DB_USER=admin
DB_PASSWORD=adminpassword
PORT=8080
```

**Backend Python (.env):**
```env
DATABASE_URL=postgresql://admin:adminpassword@postgres:5432/polimgmt
PORT=8000
```

### Comandos Docker

```bash
# Iniciar servicios
docker compose up -d

# Ver logs
docker compose logs -f backend-go
docker compose logs -f frontend

# Reconstruir imágenes
docker compose build
docker compose up -d --build

# Limpiar y empezar desde cero
docker compose down -v
docker compose up -d --build

# Detener servicios
docker compose stop

# Eliminar todo
docker compose down --rmi all -v
```

### Desarrollo Local (sin Docker)

**Backend Go:**
```bash
cd backend-go
go mod download
go run cmd/api/main.go
# Swagger: http://localhost:8080/swagger/
```

**Backend Python:**
```bash
cd backend-python
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
pnpm install
pnpm dev
# http://localhost:5173
```

### Regenerar Swagger

```bash
cd backend-go
swag init -g cmd/api/main.go
# Genera docs/docs.go, swagger.json, swagger.yaml
```

### Migraciones de BD

Actualmente usa **AutoMigrate** de GORM:

```go
// internal/database/connect.go
func Connect() {
    // ... conexión
    
    // AutoMigrate crea/actualiza tablas
    database.DB.AutoMigrate(
        &database.Role{},
        &database.User{},
        &database.Pista{},
        &database.Booking{},
        &database.Class{},
        &database.ClassEnrollment{},
        &database.Club{},
        &database.ClubMembership{},
        &database.Payment{},
    )
    
    // Seed data
    SeedData()
}
```

**Para producción:** Considerar migrador como `golang-migrate`.

### Backups

```bash
# Backup DB
docker exec -t polimanage-postgres pg_dump -U admin polimgmt > backup.sql

# Restore
cat backup.sql | docker exec -i polimanage-postgres psql -U admin polimgmt
```

---

## 📊 Métricas y Estado Actual

### Módulos Implementados

✅ **Users** - Completo (CRUD, roles, providers)  
✅ **Roles** - Completo (solo lectura)  
✅ **Pistas** - Completo (CRUD Python)  
✅ **Bookings** - Completo (reservas, validaciones)  
✅ **Classes** - Completo (clases, enrollments, providers)  
✅ **Clubs** - Completo (clubs, memberships, owner, slugs únicos)  
⚠️ **Payments** - Schema preparado, lógica pendiente  
⚠️ **Auth/JWT** - Sin implementar (placeholder)  
❌ **Tournaments** - Schema existe, sin lógica  
❌ **Teams** - Schema existe, sin lógica  
❌ **Subscriptions** - Schema existe, sin lógica  

### Líneas de Código (Aproximado)

```
Backend Go:       ~4,500 líneas
Backend Python:   ~800 líneas
Frontend:         ~6,000 líneas
SQL:              ~300 líneas
Docker/Config:    ~200 líneas
-----------------------------------
TOTAL:            ~11,800 líneas
```

### Endpoints Disponibles

```
Backend Go:       ~40 endpoints
Backend Python:   ~5 endpoints
Swagger UI:       Documentado
-----------------------------------
TOTAL:            ~45 endpoints
```

### Componentes React

```
Pages:            6 (Dashboard, Users, Pistas, Bookings, Classes, Clubs)
UI Components:    35+ (shadcn/ui)
Feature Comps:    25+ (modals, tables, forms)
Queries:          10
Mutations:        18
-----------------------------------
TOTAL:            90+ componentes
```

---

## 🔮 Roadmap Futuro

### Corto Plazo
- [ ] Implementar autenticación JWT
- [ ] Sistema de pagos con Stripe
- [ ] Dashboard con estadísticas
- [ ] Filtros avanzados en todas las páginas
- [ ] Exportación de datos (Excel/PDF)

### Medio Plazo
- [ ] Módulo de Torneos
- [ ] Módulo de Equipos
- [ ] Sistema de notificaciones (email/push)
- [ ] Calendario interactivo
- [ ] App móvil (React Native)

### Largo Plazo
- [ ] Sistema de mensajería interna
- [ ] Integración con wearables
- [ ] Machine Learning para recomendaciones
- [ ] Multi-tenant (varios polideportivos)
- [ ] API pública para integraciones

---

## 📝 Notas de Desarrollo

### Convenciones de Código

**Go:**
- Nombres en PascalCase (exportados) y camelCase (privados)
- Errores siempre retornados explícitamente
- Interfaces en `-er` (Repository, Provider, Service)
- Sin `panic()` en producción

**TypeScript:**
- camelCase para variables/funciones
- PascalCase para componentes/tipos
- Prefijo `use` para hooks
- Prefijo `I` opcional para interfaces

**SQL:**
- snake_case para columnas/tablas
- Plural para tablas (users, bookings)
- Timestamps siempre con zona (TIMESTAMPTZ)

### Debugging

**Backend Go:**
```bash
# Ver logs detallados
docker compose logs -f backend-go

# Conectar a DB desde container
docker exec -it polimanage-postgres psql -U admin polimgmt
```

**Frontend:**
```bash
# React Query Devtools (incluido)
# Abrir en navegador: pestañita en esquina inferior

# Ver network requests
# Chrome DevTools → Network tab
```

---

## 🎓 Recursos y Documentación

### Tecnologías Principales

- **Go**: https://go.dev/doc/
- **Fiber**: https://docs.gofiber.io/
- **GORM**: https://gorm.io/docs/
- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/
- **TanStack Query**: https://tanstack.com/query/latest
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/

### Patrones y Arquitectura

- **Clean Architecture**: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- **DDD**: https://martinfowler.com/tags/domain%20driven%20design.html
- **Repository Pattern**: https://martinfowler.com/eaaCatalog/repository.html

---

**Documento creado:** Febrero 2026  
**Mantenido por:** Equipo PoliManage  
**Última actualización:** Sistema Clubs completo con owner y memberships
