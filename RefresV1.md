# 🔐 Contexto: Sistema de Autenticación JWT Profesional (V1)

## 1. Estrategia de Seguridad (Core)

El sistema implementa **Access Token de vida corta** y **Refresh Token rotatorio** almacenado en **Cookies HttpOnly**.

- **Access Token:** Stateless (JWT). Se envía en el Header `Authorization: Bearer ...`.
- **Refresh Token:** Stateful (Persiste en DB). Se envía **solo** en Cookie `HttpOnly`.
- **Mecanismo:** Rotación de Refresh Token (One-time use).
- **Política de Expiración:** Ventana Deslizante (Sliding Window). Si el usuario refresca antes de caducar, se renueva el tiempo completo.

---

## 2. Reglas de Negocio por Rol

| Rol | Access Token | Refresh Token | Cookie MaxAge | Prioridad |
| :--- | :--- | :--- | :--- | :--- |
| **CLIENTE** | 15 min | **14 - 30 días** | 30 días | Experiencia de Usuario (UX) |
| **MONITOR** | 10 - 15 min | **3 - 7 días** | 7 días | Equilibrio |
| **ADMIN** | **5 min** | **NO TIENE** ❌ | N/A | Seguridad Máxima |

---

## 3. Backend (Go - Clean Architecture)

### 🏛️ Dominio (Entidades)

Archivo: `features/auth/domain/refresh_token.go`

```go
type RefreshToken struct {
    ID        uint      `gorm:"primaryKey"`
    UserID    uuid.UUID `gorm:"index"`
    TokenHash string    `gorm:"not null"` // Guardamos hash, NO el token plano
    ExpiresAt time.Time `gorm:"not null"`
    Revoked   bool      `gorm:"default:false"`
    Reason    string    // "used", "logout", "theft_detection"
    FamilyID  uuid.UUID // Opcional: Para agrupar cadenas de rotación
    CreatedAt time.Time
}
```

---

## ⚙️ Lógica de Servicio (AuthService)

### A. Login

1. Validar credenciales (email/password).
2. Generar Access Token (JWT).
3. Si rol != Admin: Generar Refresh Token, hashear y guardar en DB.
4. **Respuesta:**
   - **Body (JSON):** Access Token + User Info básica.
   - **Header (Set-Cookie):** Refresh Token (HttpOnly, Secure, SameSite=Strict).

### B. Refresh (Endpoint /api/auth/refresh)

1. Leer Cookie refreshToken.
2. Buscar token en DB.
3. **Detección de Robo:** Si Revoked == true → 🚨 Borrar TODOS los tokens del usuario (FamilyID) y devolver 401.
4. **Validación:** Si ExpiresAt < Now → 401.
5. **Rotación:**
   - Marcar token actual como Revoked = true (Razón: "replaced").
   - Crear NUEVO Refresh Token (reiniciando el contador de días).
   - Crear NUEVO Access Token.
   - Devolver nuevo par (JSON + Cookie).

### C. Logout

1. Leer Cookie.
2. Marcar token en DB como Revoked = true (Razón: "logout").
3. Borrar Cookie (MaxAge: -1).

---

## 4. Frontend (React)

### 📦 Almacenamiento

- **Access Token:** localStorage (Solo el string del token).
- **User Data:** React Query Cache (Memoria). No persistir datos sensibles en localStorage.
- **Refresh Token:** Navegador (Cookie HttpOnly). Inaccesible via JS.

### 🔄 Axios Interceptor (Auth Logic)

**Configuración global:** `withCredentials: true`.

**Flujo de Intercepción (Response):**

1. Recibe error 401 Unauthorized.
2. **¿Es la primera vez que falla este request?**
   
   **SÍ:**
   - Pausar request.
   - Llamar a /api/auth/refresh (envía cookie automáticamente).
   - **Si éxito:** Guardar nuevo accessToken en localStorage, actualizar Header Authorization, y reintentar request original.
   - **Si fallo:** Ejecutar Logout() (Limpiar storage y redirigir a Login).
   
   **NO (Ya se intentó refrescar):** Redirigir a Login.

### ⚛️ State Management

- **AuthContext:** Gestiona isAuthenticated, token (string) y métodos login/logout.
- **React Query:** Gestiona la data del usuario (useUser) y perfiles (useProfile). El Context consume a Query.

---

## 5. Casos de Seguridad Crítica

### Robo de Refresh Token (Reuso)

Si un atacante roba un Refresh Token y lo usa:

1. El sistema rota el token y entrega uno nuevo al atacante.
2. El token robado queda marcado como Revoked.
3. El usuario legítimo intenta usar su token (ahora viejo/revocado).
4. El backend detecta el intento de reuso de un token revocado.
5. **ACCIÓN:** Se invalidan inmediatamente todos los tokens activos de ese usuario. Ambos (usuario y atacante) pierden acceso.
