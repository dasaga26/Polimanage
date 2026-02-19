# 🔐 Contexto: Auth System V2 (Multi-Device & Rotation)

## 1. Resumen de Arquitectura

Evolución del sistema JWT para soportar sesiones concurrentes seguras, detección de robo de tokens y sincronización entre pestañas.

**Modelo:** Access Token (Stateless) + Refresh Token (Stateful & Rotatorio).

**Transporte:**

- **Access Token:** Header `Authorization: Bearer ...` (LocalStorage).
- **Refresh Token:** Cookie HttpOnly (Secure, SameSite=Strict).

**Características V2:**

- ✅ **Multi-Device:** Sesiones independientes (móvil, PC, tablet).
- ✅ **Reuse Detection:** Bloqueo automático si se detecta robo de token.
- ✅ **Global Logout:** Invalidación instantánea de todos los dispositivos.
- ✅ **Tab Synchronization:** Uso de BroadcastChannel para evitar errores 401 en múltiples pestañas.

---

## 2. Base de Datos (Infraestructura GORM)

### 👤 Tabla users (Actualización)

Se añade un contador global para invalidar todas las sesiones de golpe (ej. al cambiar contraseña).

```go
type User struct {
    ID             uuid.UUID `gorm:"primaryKey"`
    // ... campos estándar ...
    SessionVersion int       `gorm:"default:1;not null"` // 👈 Critical: Global Logout Switch
}
```

### 🔄 Tabla refresh_sessions (Nueva)

Sustituye a una tabla simple de tokens. Representa una sesión viva en un dispositivo específico.

```go
type RefreshSession struct {
    ID               uint      `gorm:"primaryKey"`
    UserID           uuid.UUID `gorm:"index;not null"`

    // Identifica UNA sesión específica (navegador + dispositivo).
    // Cada navegador/app es un dispositivo diferente (Chrome ≠ Firefox ≠ App móvil).
    // Generado por el frontend (uuid) en el Login. NO se reutiliza.
    // Usado para: "Cerrar sesión en este dispositivo específico".
    DeviceID         string    `gorm:"index;not null;unique"` 

    // Identifica la "cadena" de rotación de tokens.
    // Login crea una nueva Family. Refresh mantiene la misma Family.
    // Usado para: Detección de reuso de tokens (seguridad).
    // Si hay robo, se revoca la Family entera.
    FamilyID         uuid.UUID `gorm:"index;not null"` 

    // Hash del ÚNICO token válido actualmente para esta familia.
    CurrentTokenHash string    `gorm:"not null"` 

    // Instantánea de la versión del usuario al momento de crear/rotar.
    SessionVersion   int       `gorm:"not null"` 

    ExpiresAt        time.Time `gorm:"not null;index"`
    Revoked          bool      `gorm:"default:false;not null"`
    Reason           string    // "logout", "reuse_detection", "replaced"
    
    CreatedAt        time.Time
    UpdatedAt        time.Time
}
```

---

## 3. Lógica del Backend (AuthService)

### 🟢 Login (Nueva Sesión)

**Input:** Email, Password.

**Proceso:**

1. Validar credenciales.
2. Generar DeviceID (nuevo UUID único para esta sesión).
3. Generar FamilyID (nuevo UUID para la cadena de rotación).
4. Emitir Access Token y Refresh Token.
5. **Crear nueva sesión en DB:** Insertar nueva fila con (UserID, DeviceID, FamilyID, CurrentTokenHash, SessionVersion).
   - Cada login crea una nueva sesión, incluso si es el mismo navegador.

**Output:** JSON (Access + DeviceID) + Cookie (Refresh).

### 🔄 Refresh (Rotación & Seguridad)

**Input:** Cookie refreshToken.

**Algoritmo de Validación:**

1. Decodificar JWT → Obtener FamilyID.
2. Buscar sesión en DB por FamilyID.
3. **Check 1 (Revocada):** ¿Session.Revoked == true?
   - 🚨 **ALERTA:** Retornar 401 (Posible intento de hacking con token muerto).
4. **Check 2 (Reuso/Robo):** ¿Hash(TokenEntrante) != Session.CurrentTokenHash?
   - 🚨 **ALERTA CRÍTICA:** Alguien usó el token antes que el usuario legítimo.
   - **ACCIÓN:** Repo.RevokeSession(Session.ID) (Matar la familia entera).
   - Retornar 401.
5. **Check 3 (Logout Global):** ¿Session.SessionVersion != User.SessionVersion?
   - ❌ Retornar 401 (Sesión invalidada por cambio de pass o admin).

**Éxito (Rotación):**

1. Generar nuevos tokens (mismo FamilyID).
2. Actualizar DB: CurrentTokenHash = Hash(Nuevo), ExpiresAt = Now + 14d (Sliding Window).
3. Enviar nuevos tokens.

### 🔴 Logout

- **Logout Dispositivo:** Marcar Revoked = true en la sesión del DeviceID actual.
- **Logout Global:** Incrementar User.SessionVersion en tabla users. (Invalida todas las familias instantáneamente).

---

## 4. Lógica del Frontend (React - Advanced)

### 🚦 El Problema de las "Race Conditions"

Si el usuario abre 3 pestañas y el Access Token caduca, las 3 pestañas intentarán hacer /refresh a la vez.

- Pestaña 1 refresca → Token A rota a Token B.
- Pestaña 2 intenta refrescar con Token A (que ahora es viejo) → Backend detecta Reuso → 💥 Bloquea la cuenta.

### 🛡️ La Solución: Mutex + BroadcastChannel

**Implementación en el Interceptor de Axios.**

**Semáforo (isRefreshing):** Variable local para controlar llamadas concurrentes en el mismo hilo.

**BroadcastChannel API:** Comunicación entre pestañas.

- **Nombre canal:** 'auth_channel'.
- **Mensajes:** 'REFRESH_SUCCESS', 'LOGOUT'.

**Flujo del Interceptor (Error 401):**

1. **¿isRefreshing es true?**
   - Pausar petición y añadir a una cola (failedQueue).
   - Esperar a que se resuelva la promesa principal.

2. **Si soy el primero (isRefreshing = false):**
   - Poner isRefreshing = true.
   - Llamar a POST /api/auth/refresh.
   
   **Éxito:**
   - Guardar nuevo Access Token.
   - Emitir evento: `authChannel.postMessage({ type: 'REFRESH_SUCCESS', token: ... })`.
   - Procesar cola de espera.
   
   **Error:**
   - Emitir `authChannel.postMessage({ type: 'LOGOUT' })`.
   - Redirigir a /login.

3. **Listener (Otras pestañas):**
   - Al recibir 'REFRESH_SUCCESS': Actualizar token localmente y reintentar peticiones sin llamar a la API de refresh.

---

## 5. Resumen de Identificadores

| ID | Ubicación | Propósito | Comportamiento |
| :--- | :--- | :--- | :--- |
| **UserID** | users.id | Identidad del usuario. | Inmutable. |
| **DeviceID** | refresh_sessions | Identifica UNA sesión específica (navegador + dispositivo). Cada navegador/app = dispositivo diferente. | Generado en Login. NO se reutiliza. Usado para logout de dispositivo específico. |
| **FamilyID** | refresh_sessions | Agrupa una cadena de tokens rotados. Usado para detección de reuso. | Nace en Login. Muere en Logout o Robo. |
| **SessionVersion** | users & sessions | Control de validez global. | Si UserVersion > SessionVersion → Token inválido. |
