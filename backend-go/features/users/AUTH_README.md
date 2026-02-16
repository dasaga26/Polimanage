# 🔐 Módulo de Autenticación y Usuarios

## 📚 Arquitectura Clean Architecture (4 Capas)

### 🏛️ 1. DOMINIO (Domain Layer)
**Entidades puras sin dependencias externas**

#### Archivos:
- `user.go` - Entidad User y Profile
- `errors.go` - Excepciones de dominio
- `user_repository.go` - Interfaz del repositorio
- `crypto_service.go` - Interfaz para encriptación
- `jwt_service.go` - Interfaz para JWT
- `avatar_service.go` - Interfaz para avatares

#### Responsabilidades:
- ✅ Definir entidades de negocio
- ✅ Definir excepciones de dominio
- ✅ Definir interfaces (contratos)
- ❌ **NUNCA** importar Fiber, GORM u otras librerías externas

---

### 🔧 2. INFRAESTRUCTURA (Infrastructure Layer)
**Implementaciones concretas de las interfaces del dominio**

#### Archivos:
- `user_repository_impl.go` - Implementación del repositorio con GORM
- `user_mapper.go` - Mapeo entre modelos de BD y entidades de dominio
- `crypto_service_impl.go` - Implementación de Argon2id
- `jwt_service_impl.go` - Implementación de JWT con golang-jwt
- `avatar_service_impl.go` - Implementación con Pravatar.cc

#### Responsabilidades:
- ✅ Implementar persistencia en base de datos (GORM)
- ✅ Implementar servicios externos (Pravatar)
- ✅ Implementar encriptación (Argon2id)
- ✅ Implementar generación de tokens (JWT)
- ❌ **NUNCA** contener lógica de negocio

---

### 💼 3. APLICACIÓN (Application Layer)
**Lógica de negocio y orquestación**

#### Archivos:
- `user_service.go` - Servicio de usuarios (CRUD)
- `auth_service.go` - Servicio de autenticación (Register, Login)

#### Responsabilidades:
- ✅ Orquestar casos de uso
- ✅ Validar reglas de negocio
- ✅ Coordinar repositorios y servicios
- ❌ **NUNCA** depender de Fiber (HTTP)
- ❌ **NUNCA** conocer detalles de implementación (Argon2, JWT)

#### UserService:
```go
- GetAll() - Obtener todos los usuarios
- GetByID() - Obtener usuario por ID
- GetBySlug() - Obtener usuario por slug
- UpdateBySlug() - Actualizar usuario
- Delete() - Eliminar usuario
- UpdatePassword() - Cambiar contraseña
- GenerateSlug() - Generar slug único
```

#### AuthService:
```go
- Register() - Registrar nuevo usuario
- Login() - Autenticar usuario
- RefreshToken() - Renovar token
- ValidateToken() - Validar token JWT
- GetCurrentUser() - Obtener usuario desde token
```

---

### 🎨 4. PRESENTACIÓN (Presentation Layer)
**Controladores HTTP (Fiber) y DTOs**

#### Archivos:
- `user_handler.go` - Controlador de usuarios
- `auth_handler.go` - Controlador de autenticación
- `user_request.go` - DTOs de entrada
- `user_response.go` - DTOs de salida
- `auth_request.go` - DTOs de auth (entrada)
- `auth_response.go` - DTOs de auth (salida)
- `user_routes.go` - Definición de rutas de usuarios
- `auth_routes.go` - Definición de rutas de auth

#### Responsabilidades:
- ✅ Recibir peticiones HTTP (Fiber)
- ✅ Parsear y validar DTOs
- ✅ Invocar servicios de aplicación
- ✅ Convertir errores de dominio a respuestas HTTP
- ❌ **NUNCA** contener lógica de negocio (Anti-Fat Controller)

---

## 🔒 Sistema de Seguridad

### JWT Middleware (7 Pasos de Validación)
`shared/middleware/jwt_middleware.go`

1. ✅ Extrae header `Authorization`
2. ✅ Valida formato `Bearer <token>`
3. ✅ Valida que el token no esté vacío
4. ✅ Valida firma y estructura
5. ✅ Distingue token expirado vs inválido
6. ✅ Valida claims de usuario
7. ✅ Guarda claims en contexto de Fiber

### RBAC Middleware (Control de Acceso por Roles)
`shared/middleware/rbac_middleware.go`

```go
// Requiere rol específico por ID
RequireRole(1, 2) // Admin o Professional

// Requiere rol específico por nombre
RequireRoleByName("admin", "professional")

// Solo administradores
RequireAdmin()

// Administradores o profesionales
RequireProfessional()

// Validación personalizada
CustomRoleCheck(func(roleID uint, roleName string) bool {
    return roleID == 1 || roleName == "admin"
})
```

---

## 🚀 Endpoints Disponibles

### Autenticación (Públicos)
```http
POST /api/auth/register
POST /api/auth/login
```

### Autenticación (Protegidos - Requieren JWT)
```http
GET  /api/auth/me
POST /api/auth/refresh
POST /api/auth/logout
```

### Usuarios
```http
GET    /api/users          # Listar usuarios
GET    /api/users/:slug    # Obtener usuario por slug
POST   /api/users          # Crear usuario
PUT    /api/users/:slug    # Actualizar usuario
DELETE /api/users/:slug    # Eliminar usuario
```

---

## 📝 Ejemplos de Uso

### Registro de Usuario
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123",
    "fullName": "Juan Pérez",
    "phone": "+34 123 456 789"
  }'
```

**Respuesta:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "juan",
    "email": "juan@example.com",
    "fullName": "Juan Pérez",
    "avatarUrl": "https://i.pravatar.cc/150?img=42",
    "isActive": true,
    "roleName": "User"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
```

### Obtener Usuario Actual (Requiere Token)
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🛡️ Seguridad Implementada

### Encriptación de Contraseñas
- **Algoritmo:** Argon2id (ganador de Password Hashing Competition)
- **Parámetros:**
  - Memory: 64 MB
  - Iterations: 3
  - Parallelism: 2
  - Key Length: 32 bytes
  - Salt Length: 16 bytes

### Tokens JWT
- **Algoritmo:** HS256 (HMAC-SHA256)
- **Expiración:** 24 horas
- **Claims personalizados:**
  - `user_id` - UUID del usuario
  - `email` - Email del usuario
  - `role_id` - ID del rol
  - `role_name` - Nombre del rol

### Avatares por Defecto
- **Servicio:** Pravatar.cc
- **Estrategia:** Determinístico por email (MD5)
- **Fallback:** Avatar aleatorio

---

## 🏗️ Inyección de Dependencias

Ver `cmd/api/main.go`:

```go
// 1. Infraestructura
userRepo := userInfra.NewUserRepository(database.DB)
cryptoService := userInfra.NewArgon2CryptoService()
jwtService := userInfra.NewJWTService("secret-key")
avatarService := userInfra.NewPravatarService()

// 2. Aplicación
userService := userApp.NewUserService(userRepo, cryptoService)
authService := userApp.NewAuthService(
    userRepo, 
    cryptoService, 
    jwtService, 
    avatarService, 
    userService,
)

// 3. Presentación
userHandler := userPres.NewUserHandler(userService)
authHandler := userPres.NewAuthHandler(authService)

// 4. Rutas públicas
userPres.RegisterAuthRoutes(app, authHandler)

// 5. Rutas protegidas
protectedAuth := app.Group("/api/auth")
protectedAuth.Use(sharedMiddleware.JWTMiddleware(jwtService))
userPres.RegisterProtectedAuthRoutes(protectedAuth, authHandler)
```

---

## ✅ Principios Aplicados

### ✨ Clean Architecture
- ✅ Independencia de frameworks
- ✅ Testabilidad
- ✅ Independencia de UI
- ✅ Independencia de base de datos

### 🎯 SOLID
- ✅ **S**ingle Responsibility (cada capa tiene una responsabilidad)
- ✅ **O**pen/Closed (abierto a extensión, cerrado a modificación)
- ✅ **L**iskov Substitution (interfaces intercambiables)
- ✅ **I**nterface Segregation (interfaces específicas)
- ✅ **D**ependency Inversion (dependemos de abstracciones)

### 🚫 Anti-Patrones Evitados
- ❌ **Fat Controllers** - Los handlers NO tienen lógica de negocio
- ❌ **God Objects** - Servicios pequeños y cohesivos
- ❌ **Spaghetti Code** - Separación clara de responsabilidades
- ❌ **Tight Coupling** - Uso de interfaces (Dependency Inversion)

---

## 🔄 Flujo de una Petición

```
┌─────────────────────────────────────────────────────────────┐
│                    1. HTTP REQUEST                          │
│              POST /api/auth/register                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           2. PRESENTACIÓN (auth_handler.go)                 │
│  - Parsear JSON                                             │
│  - Validar formato                                          │
│  - Convertir a RegisterRequest                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           3. APLICACIÓN (auth_service.go)                   │
│  - Validar reglas de negocio                                │
│  - Verificar email duplicado                                │
│  - Generar slug                                             │
│  - Coordinar servicios                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
┌──────────────────┐  ┌─────────────────────────┐
│ 4a. INFRAESTRUCTURA │  │ 4b. INFRAESTRUCTURA     │
│ crypto_service_impl │  │ avatar_service_impl     │
│ - Hashear password │  │ - Obtener avatar        │
└──────────┬───────────┘  └─────────┬───────────────┘
          │                     │
          └──────────┬──────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│      5. INFRAESTRUCTURA (user_repository_impl.go)           │
│  - Mapear entidad → modelo GORM                             │
│  - Ejecutar INSERT en PostgreSQL                            │
│  - Mapear modelo GORM → entidad                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│      6. INFRAESTRUCTURA (jwt_service_impl.go)               │
│  - Generar token JWT                                        │
│  - Firmar con HS256                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           7. PRESENTACIÓN (auth_handler.go)                 │
│  - Convertir User → UserResponse (DTO)                      │
│  - Enviar respuesta HTTP 201 Created                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing (Futuro)

La arquitectura facilita testing en cada capa:

```go
// Test de Dominio (sin dependencias)
func TestUserValidation(t *testing.T) { ... }

// Test de Aplicación (con mocks)
func TestAuthService_Register(t *testing.T) {
    mockRepo := &MockUserRepository{}
    mockCrypto := &MockCryptoService{}
    service := NewAuthService(mockRepo, mockCrypto, ...)
    // ...
}

// Test de Infraestructura (con DB de test)
func TestUserRepository_Create(t *testing.T) { ... }

// Test de Presentación (con Fiber test)
func TestAuthHandler_Register(t *testing.T) { ... }
```

---

## 📦 Dependencias

```go
require (
    github.com/gofiber/fiber/v2 v2.52.11       // HTTP framework
    github.com/google/uuid v1.6.0               // UUID generation
    github.com/golang-jwt/jwt/v5 v5.3.1         // JWT tokens
    golang.org/x/crypto v0.47.0                 // Argon2id
    gorm.io/gorm v1.31.1                        // ORM
    gorm.io/driver/postgres v1.6.0              // PostgreSQL driver
)
```

---

## 🎓 Conclusión

Esta implementación sigue **estrictamente Clean Architecture** con:
- ✅ 4 capas bien definidas
- ✅ Inversión de dependencias
- ✅ Separación total de responsabilidades
- ✅ Anti-Fat Controller pattern
- ✅ JWT con validación estricta en 7 pasos
- ✅ RBAC para autorización
- ✅ Encriptación segura (Argon2id)
- ✅ Código mantenible y testeable

**Cada capa conoce SOLO lo que debe conocer.**
**El dominio es completamente independiente.**
**La infraestructura es intercambiable.**
