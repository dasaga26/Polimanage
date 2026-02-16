package security

import (
	"time"

	"github.com/google/uuid"
)

// ======================================================================================
// INTERFAZ JWT SERVICE (SHARED - UTILIDAD GLOBAL)
// Servicio compartido para manejo de tokens JWT
// Usado por: AUTH (generación), Middleware (validación)
// ======================================================================================

// JWTClaims representa los claims personalizados del token
type JWTClaims struct {
	UserID   uuid.UUID
	Email    string
	RoleID   uint
	RoleName string
}

// JWTService define el contrato para manejo de tokens JWT
// Si quieres cambiar de HS256 a RS256, solo modifica jwt_service_impl.go
type JWTService interface {
	// GenerateToken genera un nuevo token JWT
	GenerateToken(claims JWTClaims, expiresIn time.Duration) (string, error)
	
	// ValidateToken valida y extrae los claims del token JWT
	// Realiza validación completa en 7 pasos:
	// 1. ¿Existe token?
	// 2. ¿Formato correcto? (Bearer xxx.yyy.zzz)
	// 3. ¿Firma válida?
	// 4. ¿No está expirado?
	// 5. ¿Claims requeridos existen?
	// 6. Parsing de UserID UUID válido
	// 7. Token NO se confía ciegamente
	ValidateToken(token string) (*JWTClaims, error)
	
	// RefreshToken genera un nuevo token a partir de uno existente válido
	RefreshToken(oldToken string) (string, error)
}
