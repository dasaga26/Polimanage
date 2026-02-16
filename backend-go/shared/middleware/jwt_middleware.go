package middleware

import (
	"backend-go/shared/security"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// ======================================================================================
// JWT MIDDLEWARE (VALIDACIÓN ESTRICTA EN 7 PASOS)
// 🧠 El backend NO confía ciegamente en el JWT
// ======================================================================================

// JWTMiddleware valida el token JWT en 7 pasos
func JWTMiddleware(jwtService security.JWTService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// PASO 1: ¿Existe token? - Extraer header Authorization
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Token no proporcionado",
			})
		}

		// PASO 2: ¿Formato correcto? - Validar formato "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Formato de token inválido (debe ser: Bearer <token>)",
			})
		}

		token := parts[1]

		// Validar que el token no esté vacío
		if token == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Token vacío",
			})
		}

		// PASO 3-5: ¿Firma válida? ¿No está expirado? ¿Claims requeridos existen?
		// Estos pasos se ejecutan dentro de ValidateToken en auth/infrastructure/jwt_service_impl.go
		claims, err := jwtService.ValidateToken(token)
		if err != nil {
			// Distinguir entre token expirado y token inválido
			if err == security.ErrTokenExpired {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"error":   "Token expirado",
					"message": "Por favor, inicia sesión nuevamente",
				})
			}
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Token inválido",
			})
		}

		// Validar que los claims contengan información del usuario
		if claims.UserID.String() == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Token sin información de usuario",
			})
		}

		// PASO 6: ¿Usuario sigue existiendo? (implementado en handlers con GetCurrentUser)
		// PASO 7: ¿Roles autorizan el endpoint? (implementado con RBAC middleware)

		// Guardar claims en el contexto para uso posterior
		c.Locals("userID", claims.UserID)
		c.Locals("email", claims.Email)
		c.Locals("roleID", claims.RoleID)
		c.Locals("roleName", claims.RoleName)

		return c.Next()
	}
}

// OptionalJWTMiddleware similar al anterior pero permite continuar sin token
// Útil para endpoints que pueden funcionar con o sin autenticación (ej: GET /profiles/:username)
func OptionalJWTMiddleware(jwtService security.JWTService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			// No hay token, pero permitir continuar
			return c.Next()
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Next()
		}

		token := parts[1]
		claims, err := jwtService.ValidateToken(token)
		if err != nil {
			return c.Next()
		}

		// Guardar claims si el token es válido
		c.Locals("userID", claims.UserID)
		c.Locals("email", claims.Email)
		c.Locals("roleID", claims.RoleID)
		c.Locals("roleName", claims.RoleName)

		return c.Next()
	}
}
