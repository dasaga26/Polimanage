# 🔐 Implementación V2: Sistema de Autenticación Profesional

## 📋 Resumen de Cambios

Se ha implementado exitosamente el sistema de autenticación V2 con las siguientes características:

### ✅ Backend (Go)

1. **Multi-Device Support**
   - Nueva tabla `refresh_sessions` para gestionar sesiones por dispositivo
   - Cada dispositivo tiene un `DeviceID` único
   - Soporte para múltiples sesiones concurrentes (móvil, PC, tablet)

2. **Refresh Token Rotatorio**
   - Access Token de vida corta (5-15 min según rol)
   - Refresh Token de vida larga (7-30 días según rol)
   - Rotación automática de refresh tokens (one-time use)
   - Hash SHA-256 del refresh token almacenado en DB (no plaintext)

3. **Detección de Robo de Tokens**
   - Validación de hash del refresh token contra DB
   - Detección de reuso de tokens revocados
   - Invalidación automática de toda la familia de tokens ante robo

4. **Logout Global**
   - Campo `SessionVersion` en tabla `users`
   - Incremento de versión invalida todas las sesiones
   - Útil para cambio de contraseña o compromiso de cuenta

5. **Cookies HttpOnly**
   - Refresh token enviado en cookie HttpOnly
   - Secure, SameSite=Strict
   - Inaccesible desde JavaScript

6. **Políticas por Rol (V1)**
   - **ADMIN**: Access Token 5 min, SIN refresh token  
   - **MONITOR/STAFF**: Access Token 15 min, Refresh 7 días  
   - **CLIENTE**: Access Token 15 min, Refresh 30 días

### ✅ Frontend (React + TypeScript)

1. **BroadcastChannel API**
   - Sincronización entre pestañas del navegador
   - Previene errores 401 en múltiples pestañas
   - Logout sincronizado automáticamente

2. **Axios Interceptor con Mutex**
   - Control de race conditions en refresh
   - Solo una pestaña hace refresh a la vez
   - Cola de peticiones en espera
   - Retry automático tras refresh exitoso

3. **DeviceID Management**
   - Generación automática con UUID v4
   - Persistencia en localStorage
   - Enviado en login para asociar sesión

4. **Gestión de Tokens**
   - Access token en localStorage (cliente)
   - Refresh token en cookie HttpOnly (servidor)
   - Renovación automática en interceptor

---

## 🗄️ Cambios en Base de Datos

### Nueva Tabla: `refresh_sessions`

```sql
CREATE TABLE refresh_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    device_id VARCHAR(255) NOT NULL UNIQUE,
    family_id UUID NOT NULL,
    current_token_hash VARCHAR(255) NOT NULL,
    session_version INT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    reason VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refresh_sessions_user_id ON refresh_sessions(user_id);
CREATE INDEX idx_refresh_sessions_family_id ON refresh_sessions(family_id);
CREATE INDEX idx_refresh_sessions_expires_at ON refresh_sessions(expires_at);
```

### Actualización Tabla: `users`

```sql
ALTER TABLE users ADD COLUMN session_version INT NOT NULL DEFAULT 1;
```

---

## 🔧 Instrucciones de Migración

### Backend

1. **Ejecutar Migración de Base de Datos**
   ```bash
   # Aplicar migraciones (se creará automáticamente al ejecutar el backend)
   # O manualmente:
   psql -U postgres -d polimanage < migration_v2.sql
   ```

2. **Verificar Variables de Entorno**
   ```env
   JWT_SECRET=tu_secreto_seguro_aqui
   DATABASE_URL=postgresql://user:pass@localhost:5432/polimanage
   ```

3. **Iniciar Backend**
   ```bash
   cd backend-go
   go run cmd/api/main.go
   ```

### Frontend

1. **Instalar Dependencia UUID**
   ```bash
   cd frontend
   pnpm install uuid
   pnpm install -D @types/uuid
   ```

2. **Verificar Variables de Entorno**
   ```env
   VITE_API_GO_URL=http://localhost:8080/api
   ```

3. **Iniciar Frontend**
   ```bash
   pnpm dev
   ```

---

## 🔄 Flujos de Autenticación

### Login Flow (V2)

```
Cliente                    Backend                      DB
  |                          |                          |
  |-- POST /auth/login ----->|                          |
  |   { email, password,     |                          |
  |     deviceId? }          |                          |
  |                          |-- Validar credenciales ->|
  |                          |<- Usuario ----------------| 
  |                          |-- Crear RefreshSession ->|
  |                          |<- Session ID -------------| 
  |<- Access Token ----------|                          |
  |   Cookie: RefreshToken   |                          |
  |   DeviceID               |                          |
```

### Refresh Flow (V2)

```
Cliente                    Backend                      DB
  |                          |                          |
  |-- POST /auth/refresh --->|                          |
  |   Cookie: RefreshToken   |                          |
  |                          |-- Validar JWT ---------->|
  |                          |-- Buscar por FamilyID -->|
  |                          |<- Session ---------------| 
  |                          |-- Validar Hash --------->|
  |                          |-- Check Revoked -------->|
  |                          |-- Check SessionVersion ->|
  |                          |-- Rotar Token ---------->|
  |                          |<- Updated Session -------| 
  |<- Nuevo Access Token ----|                          |
  |   Cookie: Nuevo Refresh  |                          |
```

### Detección de Robo

```
Atacante                   Backend                      Usuario Legítimo
  |                          |                             |
  |-- Roba RefreshToken ---->|                             |
  |-- POST /refresh -------->|                             |
  |                          |-- Rotar Token ------------->|-- Revoked = True
  |<- Nuevo Token -----------|                             |
  |                          |                             |
  |                          |<- POST /refresh (token viejo)|
  |                          |-- Detecta Reuso ----------->|
  |                          |-- Revoca FamilyID --------->|
  |                          |                             |
  |<- 401 (sesión revocada) -|-> 401 (sesión revocada) ----| 
```

---

## 📝 Testing

### Endpoints Disponibles

```bash
# Login
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "deviceId": "optional-uuid"
}

# Refresh
POST http://localhost:8080/api/auth/refresh
# Usa cookie automáticamente

# Me
GET http://localhost:8080/api/auth/me
Authorization: Bearer <access-token>

# Logout
POST http://localhost:8080/api/auth/logout
Content-Type: application/json

{
  "deviceId": "uuid-del-dispositivo"
}

# Logout All
POST http://localhost:8080/api/auth/logout-all
Authorization: Bearer <access-token>
```

---

## 🔐 Seguridad

### Características de Seguridad Implementadas

✅ Access Token de vida corta (5-15 min)  
✅ Refresh Token rotatorio (one-time use)  
✅ Tokens hasheados en DB (SHA-256)  
✅ Cookies HttpOnly + Secure + SameSite  
✅ Detección de reuso de tokens  
✅ Logout global (SessionVersion)  
✅ CORS configurado correctamente  
✅ Validación de firma JWT (HMAC-SHA256)  
✅ Multi-device con sesiones independientes  
✅ Sincronización entre pestañas (BroadcastChannel)  

### Mejores Prácticas Aplicadas

- ✅ Separation of Concerns (Clean Architecture)
- ✅ Repository Pattern
- ✅ Dependency Injection
- ✅ DTOs para Request/Response
- ✅ Error Handling centralizado
- ✅ Password hashing con Argon2id
- ✅ Token hashing con SHA-256

---

## 🐛 Troubleshooting

### Error: "refresh token expirado"
**Solución**: El usuario debe hacer login nuevamente. Esto es normal si no ha usado la app en más de 7-30 días.

### Error: "detección de robo: token reusado"
**Solución**: Se detectó un intento de usar un token ya utilizado. Todas las sesiones fueron revocadas por seguridad. Hacer login nuevamente.

### Error: "sesión invalidada globalmente"
**Solución**: Se incrementó el SessionVersion (cambio de contraseña, etc.). Hacer login nuevamente.

### Frontend: Múltiples errores 401
**Solución**: Verificar que BroadcastChannel esté funcionando. Revisar consola del navegador.

---

## 📚 Referencias

- RefreshV1.md - Especificación V1 (base)
- RefreshV2.md - Especificación V2 (multi-device)
- [RFC 6749 - OAuth 2.0](https://tools.ietf.org/html/rfc6749)
- [OWASP - Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## ✨ Próximas Mejoras

- [ ] Cron job para limpieza de sesiones expiradas
- [ ] Dashboard de sesiones activas para usuarios
- [ ] Notificación de nuevos logins
- [ ] Rate limiting en endpoints de auth
- [ ] 2FA (Two-Factor Authentication)
- [ ] Magic links para login sin contraseña
- [ ] Social login (Google, GitHub, etc.)

---

**🎉 Sistema V2 implementado exitosamente!**

Fecha: Febrero 2026  
Autor: Implementación basada en especificaciones RefreshV1.md y RefreshV2.md
