package security

import (
	"time"

	"github.com/google/uuid"
)

// ======================================================================================
// INTERFAZ JWT SERVICE (SHARED - UTILIDAD GLOBAL)
// Servicio compartido para manejo de tokens JWT
// Usado por: AUTH (generación), Middleware (validación)
// V2: Soporta Access y Refresh Tokens con multi-device
// ======================================================================================

// JWTClaims representa los claims personalizados del Access Token
type JWTClaims struct {
	UserID         uuid.UUID
	Email          string
	RoleID         uint
	RoleName       string
	SessionVersion int // V2: Para validar logout global
}

// RefreshTokenClaims representa los claims del Refresh Token
type RefreshTokenClaims struct {
	UserID         uuid.UUID
	FamilyID       uuid.UUID // V2: Agrupa cadenas de rotación
	DeviceID       string    // V2: Identifica dispositivo único
	SessionVersion int       // V2: Para validar logout global
}

// JWTService define el contrato para manejo de tokens JWT
// Si quieres cambiar de HS256 a RS256, solo modifica jwt_service_impl.go
type JWTService interface {
	// GenerateAccessToken genera un nuevo Access Token (vida corta)
	GenerateAccessToken(claims JWTClaims, expiresIn time.Duration) (string, error)

	// GenerateRefreshToken genera un nuevo Refresh Token (vida larga)
	// Retorna el token JWT y su hash (para almacenar en DB)
	GenerateRefreshToken(claims RefreshTokenClaims, expiresIn time.Duration) (token string, hash string, err error)

	// ValidateAccessToken valida y extrae los claims del Access Token
	// Realiza validación completa en 7 pasos:
	// 1. ¿Existe token?
	// 2. ¿Formato correcto? (Bearer xxx.yyy.zzz)
	// 3. ¿Firma válida?
	// 4. ¿No está expirado?
	// 5. ¿Claims requeridos existen?
	// 6. Parsing de UserID UUID válido
	// 7. Token NO se confía ciegamente
	ValidateAccessToken(token string) (*JWTClaims, error)

	// ValidateRefreshToken valida y extrae los claims del Refresh Token
	ValidateRefreshToken(token string) (*RefreshTokenClaims, error)

	// HashToken genera un hash SHA-256 del token (para almacenar en DB)
	HashToken(token string) string

	// GetRefreshTokenExpiry retorna la duración de expiración según el rol
	GetRefreshTokenExpiry(roleID uint) time.Duration

	// GetAccessTokenExpiry retorna la duración de expiración del Access Token según el rol
	GetAccessTokenExpiry(roleID uint) time.Duration
}
