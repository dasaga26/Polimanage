package security

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// ======================================================================================
// IMPLEMENTACIÓN DE JWTSERVICE CON HS256 (V2)
// 🔒 Si quieres cambiar a RS256 (clave pública/privada), reemplaza esta implementación
// V2: Soporta Access Token (corto) y Refresh Token (largo) con multi-device
// ======================================================================================

var (
	// ErrTokenExpired se retorna cuando el token ha expirado
	ErrTokenExpired = errors.New("token ha expirado")

	// ErrInvalidToken se retorna cuando el token no es válido
	ErrInvalidToken = errors.New("token inválido")
)

type JWTServiceImpl struct {
	secretKey []byte
}

// NewJWTService crea una nueva instancia del servicio JWT
func NewJWTService(secretKey string) *JWTServiceImpl {
	return &JWTServiceImpl{
		secretKey: []byte(secretKey),
	}
}

// AccessTokenClaims estructura de claims para Access Token
type AccessTokenClaims struct {
	UserID         string `json:"user_id"`
	Email          string `json:"email"`
	RoleID         uint   `json:"role_id"`
	RoleName       string `json:"role_name"`
	SessionVersion int    `json:"session_version"` // V2
	jwt.RegisteredClaims
}

// RefreshTokenClaimsJWT estructura de claims para Refresh Token
type RefreshTokenClaimsJWT struct {
	UserID         string `json:"user_id"`
	FamilyID       string `json:"family_id"`       // V2
	DeviceID       string `json:"device_id"`       // V2
	SessionVersion int    `json:"session_version"` // V2
	TokenType      string `json:"token_type"`      // "refresh"
	jwt.RegisteredClaims
}

// GenerateAccessToken genera un nuevo Access Token (vida corta)
func (s *JWTServiceImpl) GenerateAccessToken(claims JWTClaims, expiresIn time.Duration) (string, error) {
	now := time.Now()

	jwtClaims := AccessTokenClaims{
		UserID:         claims.UserID.String(),
		Email:          claims.Email,
		RoleID:         claims.RoleID,
		RoleName:       claims.RoleName,
		SessionVersion: claims.SessionVersion,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(expiresIn)),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			Subject:   "access",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwtClaims)

	tokenString, err := token.SignedString(s.secretKey)
	if err != nil {
		return "", fmt.Errorf("error firmando access token: %w", err)
	}

	return tokenString, nil
}

// GenerateRefreshToken genera un nuevo Refresh Token (vida larga)
// Retorna el token JWT y su hash (para almacenar en DB)
func (s *JWTServiceImpl) GenerateRefreshToken(claims RefreshTokenClaims, expiresIn time.Duration) (token string, hash string, err error) {
	now := time.Now()

	jwtClaims := RefreshTokenClaimsJWT{
		UserID:         claims.UserID.String(),
		FamilyID:       claims.FamilyID.String(),
		DeviceID:       claims.DeviceID,
		SessionVersion: claims.SessionVersion,
		TokenType:      "refresh",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(expiresIn)),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			Subject:   "refresh",
		},
	}

	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwtClaims)

	tokenString, err := jwtToken.SignedString(s.secretKey)
	if err != nil {
		return "", "", fmt.Errorf("error firmando refresh token: %w", err)
	}

	// Generar hash del token para almacenar en DB
	tokenHash := s.HashToken(tokenString)

	return tokenString, tokenHash, nil
}

// ValidateAccessToken valida y extrae los claims del Access Token
// 🧠 VALIDACIÓN EN 7 PASOS - El backend NO confía ciegamente en el JWT
func (s *JWTServiceImpl) ValidateAccessToken(tokenString string) (*JWTClaims, error) {
	// Parse con validación de firma
	token, err := jwt.ParseWithClaims(tokenString, &AccessTokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Paso 3: ¿Firma válida? - Validar algoritmo HMAC
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de firma inesperado: %v", token.Header["alg"])
		}
		return s.secretKey, nil
	})

	if err != nil {
		// Paso 4: ¿No está expirado?
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrTokenExpired
		}
		return nil, ErrInvalidToken
	}

	if !token.Valid {
		return nil, ErrInvalidToken
	}

	// Paso 5: ¿Claims requeridos existen?
	claims, ok := token.Claims.(*AccessTokenClaims)
	if !ok {
		return nil, ErrInvalidToken
	}

	// Verificar que es un Access Token
	if claims.Subject != "access" {
		return nil, fmt.Errorf("token no es de tipo access")
	}

	// Paso 6: Convertir UserID de string a UUID
	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		return nil, fmt.Errorf("user_id inválido en token: %w", err)
	}

	// Paso 7: Devolver claims - El controlador hará validaciones adicionales
	return &JWTClaims{
		UserID:         userID,
		Email:          claims.Email,
		RoleID:         claims.RoleID,
		RoleName:       claims.RoleName,
		SessionVersion: claims.SessionVersion,
	}, nil
}

// ValidateRefreshToken valida y extrae los claims del Refresh Token
func (s *JWTServiceImpl) ValidateRefreshToken(tokenString string) (*RefreshTokenClaims, error) {
	// Parse con validación de firma
	token, err := jwt.ParseWithClaims(tokenString, &RefreshTokenClaimsJWT{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de firma inesperado: %v", token.Header["alg"])
		}
		return s.secretKey, nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrTokenExpired
		}
		return nil, ErrInvalidToken
	}

	if !token.Valid {
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(*RefreshTokenClaimsJWT)
	if !ok {
		return nil, ErrInvalidToken
	}

	// Verificar que es un Refresh Token
	if claims.TokenType != "refresh" || claims.Subject != "refresh" {
		return nil, fmt.Errorf("token no es de tipo refresh")
	}

	// Convertir UUIDs
	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		return nil, fmt.Errorf("user_id inválido en refresh token: %w", err)
	}

	familyID, err := uuid.Parse(claims.FamilyID)
	if err != nil {
		return nil, fmt.Errorf("family_id inválido en refresh token: %w", err)
	}

	return &RefreshTokenClaims{
		UserID:         userID,
		FamilyID:       familyID,
		DeviceID:       claims.DeviceID,
		SessionVersion: claims.SessionVersion,
	}, nil
}

// HashToken genera un hash SHA-256 del token (para almacenar en DB)
func (s *JWTServiceImpl) HashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

// GetRefreshTokenExpiry retorna la duración de expiración según el rol
// V1 + V2: Políticas de expiración por rol
func (s *JWTServiceImpl) GetRefreshTokenExpiry(roleID uint) time.Duration {
	switch roleID {
	case 1: // ADMIN
		return 0 // Sin refresh token (solo access token de 5 min)
	case 2, 3, 4: // MONITOR, INSTRUCTOR, STAFF
		return 7 * 24 * time.Hour // 7 días
	case 5: // CLIENTE
		return 30 * 24 * time.Hour // 30 días
	default:
		return 14 * 24 * time.Hour // 14 días por defecto
	}
}

// GetAccessTokenExpiry retorna la duración de expiración del Access Token según el rol
func (s *JWTServiceImpl) GetAccessTokenExpiry(roleID uint) time.Duration {
	switch roleID {
	case 1: // ADMIN
		return 5 * time.Minute // Máxima seguridad
	case 2, 3, 4: // MONITOR, INSTRUCTOR, STAFF
		return 15 * time.Minute // Equilibrio
	case 5: // CLIENTE
		return 15 * time.Minute // Experiencia de usuario
	default:
		return 15 * time.Minute
	}
}
