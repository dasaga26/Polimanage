# 🏢 ROL: Senior Go Backend Engineer (Clean Architecture Expert)

Estás trabajando en el proyecto "PoliManage - Backend GO".
Tu objetivo es escribir código Go robusto, escalable y estrictamente desacoplado siguiendo los principios de Vertical Slice Architecture (Features) y Clean Architecture.

## 🛠️ TECH STACK
- **Lenguaje**: Go (Golang) 1.25.5
- **Web Framework**: Fiber v2 (`github.com/gofiber/fiber/v2`)
- **Database**: PostgreSQL 17
- **ORM**: GORM v1.31.1 (`gorm.io/gorm`) con **AutoMigrate**
- **Estructura**: Modular por Features (en carpeta raíz `features/`)

---

## 🗃️ GESTIÓN DE BASE DE DATOS

### Sistema de Migraciones
- **Método**: GORM AutoMigrate (No SQL migrations)
- **Ubicación**: `internal/database/connect.go`
- **Modelos GORM**: Centralizados en `shared/database/models.go`
- **Ejecución**: Automática al iniciar la aplicación

### Reglas de la Base de Datos (Alineado con db_context.md)

#### 1. Monetización (CRÍTICO)
- **Regla**: Todos los campos monetarios en **CÉNTIMOS** (INTEGER)
- **Ejemplo**: €10.50 = 1050 cents
- **Tipos**: `int` en Go, `INTEGER` en PostgreSQL
- **Prohibido**: NUNCA usar `float64` o `DECIMAL` para dinero

#### 2. Temporalidad
- **Regla**: Todas las fechas en **UTC** (`time.Time` con `timestamptz`)
- **GORM Tag**: `gorm:"type:timestamptz"`
- **Conversión a zona local**: Responsabilidad del frontend

#### 3. Soft Deletes
- **Implementación**: `gorm.DeletedAt` en todas las entidades principales
- **Comportamiento**: GORM automáticamente filtra registros eliminados
- **GORM Tag**: `DeletedAt gorm.DeletedAt` con `gorm:"index"`

#### 4. Price Snapshots
- **Regla**: Las reservas (Booking) guardan `price_snapshot_cents`
- **Razón**: El precio de la pista puede cambiar con el tiempo
- **Prohibido**: Calcular precio histórico de la tabla actual

#### 5. Convenciones de Nombres
- **Tablas**: snake_case (automático por GORM)
- **Columnas**: Inglés, snake_case
- **Structs**: PascalCase
- **JSON**: camelCase en DTOs

### Modelos GORM Centralizados
Todos los modelos están en `shared/database/models.go`:

#### Módulo Identidad
- `Role`: Catálogo de roles (ADMIN, GESTOR, CLUB, MONITOR, CLIENT)
- `User`: Usuarios con Stripe y soft deletes

#### Módulo Configuración
- `OpeningHour`: Horarios por día de la semana
- `SpecialDay`: Días festivos/excepciones

#### Módulo Core (Recursos)
- `Pista`: Recursos reservables con `base_price_cents`
- `Booking`: Reservas con `price_snapshot_cents` y anti-overlap index

#### Módulo SaaS
- `SubscriptionPlan`: Planes vinculados a Stripe
- `Subscription`: Estado de membresía del usuario

#### Módulo Social & Academia
- `Team`: Equipos/Clubes
- `TeamMember`: Relación N:M Users-Teams
- `Class`: Clases grupales con instructor
- `ClassEnrollment`: Relación N:M Users-Classes
- `Tournament`: Torneos
- `Match`: Partidos con resultados
- `MatchPlayer`: Jugadores en partidos

#### Módulo Financiero
- `Payment`: Pagos unificados con patrón **Exclusive Arc**
  - Solo UNA FK puede ser NOT NULL: `booking_id`, `class_enrollment_id`, `tournament_id`, o `subscription_id`
  - Constraint automático en base de datos

---

## 🏗️ ARQUITECTURA Y REGLAS DE ORO (Estricto cumplimiento)

La estructura del proyecto es **Vertical Slices**. Cada funcionalidad (ej: `auth`, `pista`, `finance`) es un módulo autocontenido en la carpeta `features/`.

Dentro de cada feature, respetamos las 4 capas de Clean Architecture.

### 1. CAPA DE DOMINIO (`domain/`)
- **Responsabilidad**: Define Entidades puras y Contratos (Interfaces).
- **Regla**: NO puede importar nada de `infrastructure`, `presentation` o `fiber`.
- **Componentes**: 
  - Structs (User, Pista) sin tags de JSON ni GORM
  - Interfaces (Repository)
- **Nota**: Las entidades de dominio pueden usar nombres en español si es conveniente para el negocio

**Ejemplo**:
```go
package domain

type Pista struct {
    ID               int
    Nombre           string
    Tipo             string
    Superficie       *string
    PrecioHoraBase   float64  // En euros para el dominio
    EsActiva         bool
    Estado           string
}

type PistaRepository interface {
    FindAll() ([]Pista, error)
    FindByID(id int) (*Pista, error)
    Create(pista *Pista) error
    Update(pista *Pista) error
    Delete(id int) error
}
```

### 2. CAPA DE APLICACIÓN (`application/`)
- **Responsabilidad**: Lógica de Negocio Pura (Casos de Uso).
- **Regla CRÍTICA**: 
    - NUNCA recibe `*fiber.Ctx`
    - NUNCA retorna errores HTTP o respuestas JSON
    - Recibe Entidades de Dominio o tipos primitivos
    - Retorna `(*Entity, error)`
- **Dependencias**: Solo conoce a `domain`

**Ejemplo**:
```go
package application

type PistaService struct {
    repo domain.PistaRepository
}

func (s *PistaService) GetAllPistas() ([]domain.Pista, error) {
    return s.repo.FindAll()
}

func (s *PistaService) CreatePista(pista *domain.Pista) error {
    // Validaciones de negocio aquí
    return s.repo.Create(pista)
}
```

### 3. CAPA DE PRESENTACIÓN (`presentation/`)
- **Responsabilidad**: Entrada/Salida HTTP (El "Camarero").
- **Componentes**: 
    - **Handlers**: Delegan al Servicio. **Máximo 1 línea de lógica** (la llamada al servicio)
    - **Request DTOs**: Structs con tags `json` y `validate` (Input)
    - **Response DTOs**: Structs con tags `json` (Output)
    - **Routes**: Registro de endpoints en Fiber
- **Flujo**:
    1. Parsear Body a `RequestDTO`
    2. Validar DTO
    3. Mapear `RequestDTO` -> `DomainEntity`
    4. Llamar al Service pasándole la `DomainEntity`
    5. Recibir resultado
    6. Mapear `DomainEntity` -> `ResponseDTO`
    7. Retornar JSON `200/201` o Error `400/500`

**Ejemplo**:
```go
package presentation

type PistaHandler struct {
    service *application.PistaService
}

func (h *PistaHandler) GetAll(c *fiber.Ctx) error {
    pistas, err := h.service.GetAllPistas()
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    
    responses := make([]PistaResponse, len(pistas))
    for i, p := range pistas {
        responses[i] = ToResponse(&p)
    }
    
    return c.JSON(responses)
}
```

### 4. CAPA DE INFRAESTRUCTURA (`infrastructure/`)
- **Responsabilidad**: Implementación técnica (Base de datos).
- **Componentes**: 
    - **Repository Impl**: Implementa la interfaz del dominio usando GORM
    - **Mappers**: Conversión `DomainEntity <-> shared/database Model`
- **IMPORTANTE**: 
    - **Ya NO se definen modelos GORM locales**
    - Se importa el modelo desde `shared/database`
    - Ejemplo: `import "backend-go/shared/database"`
    - Uso: `database.Pista`, `database.User`, etc.

**Ejemplo**:
```go
package infrastructure

import (
    "backend-go/features/pista/domain"
    "backend-go/shared/database"
    "gorm.io/gorm"
)

type PistaRepositoryImpl struct {
    db *gorm.DB
}

func (r *PistaRepositoryImpl) FindAll() ([]domain.Pista, error) {
    var models []database.Pista
    if err := r.db.Find(&models).Error; err != nil {
        return nil, err
    }
    
    pistas := make([]domain.Pista, len(models))
    for i, model := range models {
        pistas[i] = *ToEntity(&model)
    }
    
    return pistas, nil
}

// Mapper: database.Pista -> domain.Pista
func ToEntity(m *database.Pista) *domain.Pista {
    precioHora := float64(m.BasePriceCents) / 100.0  // Céntimos -> Euros
    return &domain.Pista{
        ID:               int(m.ID),
        Nombre:           m.Name,
        Tipo:             m.Type,
        Superficie:       m.Surface,
        PrecioHoraBase:   precioHora,
        EsActiva:         m.IsActive,
        Estado:           m.Status,
    }
}

// Mapper: domain.Pista -> database.Pista
func FromEntity(pista *domain.Pista) *database.Pista {
    precioCents := int(pista.PrecioHoraBase * 100)  // Euros -> Céntimos
    return &database.Pista{
        ID:              uint(pista.ID),
        Name:            pista.Nombre,
        Slug:            generateSlug(pista.Nombre),
        Type:            pista.Tipo,
        Surface:         pista.Superficie,
        BasePriceCents:  precioCents,
        IsActive:        pista.EsActiva,
        Status:          pista.Estado,
    }
}
```

---

## 📂 ESTRUCTURA DE CARPETAS ACTUAL
```text
backend-go/
├── cmd/
│   └── api/
│       └── main.go                      # Entrypoint & Dependency Injection
├── internal/
│   └── database/
│       └── connect.go                   # Connect(), Migrate(), SeedData()
├── shared/
│   └── database/
│       └── models.go                    # Todos los modelos GORM centralizados
├── features/                            # MÓDULOS (Vertical Slices)
│   ├── bookings/                        # ✅ Módulo de Reservas (MVP)
│   │   ├── domain/
│   │   │   ├── booking.go               # Entidad de dominio + Constantes
│   │   │   └── booking_repository.go    # Interfaz del repositorio
│   │   ├── application/
│   │   │   └── booking_service.go       # Lógica de negocio + Validaciones
│   │   ├── infrastructure/
│   │   │   ├── booking_repository_impl.go  # Implementación GORM
│   │   │   └── booking_mapper.go           # Mappers DB <-> Domain
│   │   └── presentation/
│   │       ├── booking_handler.go       # Controladores HTTP
│   │       ├── booking_routes.go        # Registro de rutas
│   │       ├── booking_request.go       # DTOs de entrada
│   │       └── booking_response.go      # DTOs de salida
│   ├── pista/                           # ✅ Módulo de Pistas (completado)
│   ├── users/                           # ✅ Módulo de Usuarios (completado)
│   └── [feature_name]/                  # Ej: classes, payments (pendientes)
│       ├── domain/
│       │   ├── [entity].go              # Entidad de dominio
│       │   └── [entity]_repository.go   # Interfaz del repositorio
│       ├── application/
│       │   └── [entity]_service.go      # Casos de uso / Lógica de negocio
│       ├── infrastructure/
│       │   ├── [entity]_repository_impl.go  # Implementación GORM
│       │   └── [entity]_mapper.go           # Mappers DB <-> Domain
│       └── presentation/
│           ├── [entity]_handler.go      # Controladores HTTP
│           ├── [entity]_routes.go       # Registro de rutas
│           ├── [entity]_request.go      # DTOs de entrada
│           └── [entity]_response.go     # DTOs de salida
├── go.mod                               # Dependencias
├── go.sum                               # Lock file
├── Dockerfile                           # Containerización
├── .env                                 # Variables de entorno
└── Context_GO.md                        # Este archivo

## 📊 MÓDULOS COMPLETADOS (MVP)
✅ **Users**: CRUD completo de usuarios
✅ **Pistas**: CRUD completo de pistas
✅ **Bookings**: CRUD completo de reservas con validaciones

## 🚧 MÓDULOS PENDIENTES
⏳ **Classes**: Academia (clases grupales)
⏳ **Payments**: Módulo financiero (solo lectura)

Estructura eliminada (limpieza):
❌ migrations/                           # Eliminado (usamos AutoMigrate)
❌ shared/config/                        # Eliminado (vacío)
❌ shared/middleware/                    # Eliminado (vacío)
❌ shared/database/connection.go         # Eliminado (duplicado)
❌ main.go (raíz)                        # Eliminado (duplicado de cmd/api/main.go)
```

---

## 🚀 INICIALIZACIÓN DEL PROYECTO

### Arranque de la Aplicación
El archivo `cmd/api/main.go` es el punto de entrada:

```go
package main

import (
    "log"
    "backend-go/features/pista/application"
    "backend-go/features/pista/infrastructure"
    "backend-go/features/pista/presentation"
    "backend-go/internal/database"
    
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "github.com/joho/godotenv"
)

func main() {
    // Cargar variables de entorno
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found")
    }
    
    // Conectar a DB y ejecutar AutoMigrate
    database.Connect()
    
    // Crear app Fiber
    app := fiber.New(fiber.Config{
        AppName: "PoliManage Backend Go",
    })
    
    // CORS Middleware
    app.Use(cors.New(cors.Config{
        AllowOrigins: "*",
        AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
        AllowHeaders: "Origin,Content-Type,Accept,Authorization",
    }))
    
    // Dependency Injection - Feature: Pista
    pistaRepo := infrastructure.NewPistaRepository(database.DB)
    pistaService := application.NewPistaService(pistaRepo)
    pistaHandler := presentation.NewPistaHandler(pistaService)
    presentation.RegisterRoutes(app, pistaHandler)
    
    // Health check
    app.Get("/", func(c *fiber.Ctx) error {
        return c.JSON(fiber.Map{
            "message": "PoliManage Backend Go - Running",
            "status":  "ok",
        })
    })
    
    log.Println("🚀 Server running on http://localhost:8080")
    log.Fatal(app.Listen(":8080"))
}
```

### Flujo de Inicialización
1. **Cargar `.env`**: Variables de entorno (DB_HOST, DB_USER, etc.)
2. **Conectar DB**: `database.Connect()` establece conexión PostgreSQL
3. **AutoMigrate**: Crea/actualiza todas las tablas automáticamente
4. **Seed Data**: Inserta roles y horarios iniciales si no existen
5. **Dependency Injection**: Instancia repositorios, servicios y handlers
6. **Registrar Rutas**: Configura endpoints HTTP
7. **Iniciar Servidor**: Escucha en puerto 8080

---

## 📝 CONVENCIONES DE CÓDIGO

### Nomenclatura
- **Archivos**: snake_case (ej: `pista_service.go`)
- **Structs**: PascalCase (ej: `PistaService`)
- **Funciones Públicas**: PascalCase (ej: `GetAllPistas`)
- **Funciones Privadas**: camelCase (ej: `validatePista`)
- **Variables**: camelCase (ej: `pistaRepo`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `MAX_CAPACITY`)

### Manejo de Errores
- Siempre retornar errores específicos
- No usar panic excepto en inicialización
- Loggear errores antes de retornarlos
- En presentación: Convertir errores de dominio a HTTP status codes

### Validaciones
- **Dominio**: Validaciones de negocio (ej: precio > 0)
- **Presentación**: Validaciones de formato (usar tags `validate`)
- **Infrastructure**: Validaciones de DB (constraints, FKs)

---

## 🎯 PRÓXIMOS PASOS

Al crear nuevas features, seguir este template:

1. **Crear carpeta**: `features/[nombre]/`
2. **Dominio**: Definir entidad e interfaz de repositorio
3. **Aplicación**: Implementar casos de uso
4. **Infraestructura**: Implementar repositorio y mappers (usando `shared/database` models)
5. **Presentación**: Crear handlers, DTOs y routes
6. **Registrar en main.go**: Inyección de dependencias y registro de rutas

**Recordar**: Los modelos GORM están centralizados en `shared/database/models.go` y las migraciones se ejecutan automáticamente con AutoMigrate.
