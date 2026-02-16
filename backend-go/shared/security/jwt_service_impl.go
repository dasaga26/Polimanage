package security

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// ======================================================================================
// IMPLEMENTACIÓN DE JWTSERVICE CON HS256
// 🔒 Si quieres cambiar a RS256 (clave pública/privada), reemplaza esta implementación
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

// CustomClaims estructura de claims personalizados
type CustomClaims struct {
	UserID   string `json:"user_id"`
	Email    string `json:"email"`
	RoleID   uint   `json:"role_id"`
	RoleName string `json:"role_name"`
	jwt.RegisteredClaims
}

// GenerateToken genera un nuevo token JWT
func (s *JWTServiceImpl) GenerateToken(claims JWTClaims, expiresIn time.Duration) (string, error) {
	now := time.Now()
	
	jwtClaims := CustomClaims{
		UserID:   claims.UserID.String(),
		Email:    claims.Email,
		RoleID:   claims.RoleID,
		RoleName: claims.RoleName,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(expiresIn)),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwtClaims)
	
	tokenString, err := token.SignedString(s.secretKey)
	if err != nil {
		return "", fmt.Errorf("error firmando token: %w", err)
	}

	return tokenString, nil
}

// ValidateToken valida y extrae los claims del token
// 🧠 VALIDACIÓN EN 7 PASOS - El backend NO confía ciegamente en el JWT
func (s *JWTServiceImpl) ValidateToken(tokenString string) (*JWTClaims, error) {
	// Parse con validación de firma
	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
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
	claims, ok := token.Claims.(*CustomClaims)
	if !ok {
		return nil, ErrInvalidToken
	}

	// Paso 6: Convertir UserID de string a UUID
	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		return nil, fmt.Errorf("user_id inválido en token: %w", err)
	}

	// Paso 7: Devolver claims - El controlador hará validaciones adicionales
	return &JWTClaims{
		UserID:   userID,
		Email:    claims.Email,
		RoleID:   claims.RoleID,
		RoleName: claims.RoleName,
	}, nil
}

// RefreshToken genera un nuevo token a partir de uno existente
func (s *JWTServiceImpl) RefreshToken(oldToken string) (string, error) {
	// Validar el token actual
	claims, err := s.ValidateToken(oldToken)
	if err != nil {
		// Si expiró pero es válido, permitir refresh
		if !errors.Is(err, ErrTokenExpired) {
			return "", err
		}
	}

	// Generar nuevo token con mismos claims pero nueva expiración
	return s.GenerateToken(*claims, 24*time.Hour)
}
