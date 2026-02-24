package middleware

import (
	"backend-go/shared/security"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// ======================================================================================
// MIDDLEWARE AUTH - Validación de autenticación JWT
// Verifica que el token Bearer sea válido antes de continuar
// ======================================================================================

// AuthMiddleware valida el token JWT del header Authorization.
// Si el token es inválido o está ausente, devuelve 401 Unauthorized.
func AuthMiddleware(jwtService security.JWTService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Extraer header Authorization
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Token no proporcionado",
			})
		}

		// Validar formato "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Formato de token inválido (debe ser: Bearer <token>)",
			})
		}

		token := parts[1]
		if token == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Token vacío",
			})
		}

		// Validar firma, expiración y claims
		claims, err := jwtService.ValidateAccessToken(token)
		if err != nil {
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

		if claims.UserID.String() == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Token sin información de usuario",
			})
		}

		// Guardar claims en contexto para handlers posteriores
		c.Locals("userID", claims.UserID)
		c.Locals("email", claims.Email)
		c.Locals("roleID", claims.RoleID)
		c.Locals("roleName", claims.RoleName)
		c.Locals("sessionVersion", claims.SessionVersion)

		return c.Next()
	}
}

// JWTMiddleware es un alias de AuthMiddleware para compatibilidad con código existente.
func JWTMiddleware(jwtService security.JWTService) fiber.Handler {
	return AuthMiddleware(jwtService)
}

// OptionalJWTMiddleware valida el token si está presente, pero permite continuar sin él.
// Útil para endpoints que pueden funcionar con o sin autenticación.
func OptionalJWTMiddleware(jwtService security.JWTService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Next()
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Next()
		}

		token := parts[1]
		claims, err := jwtService.ValidateAccessToken(token)
		if err != nil {
			return c.Next()
		}

		c.Locals("userID", claims.UserID)
		c.Locals("email", claims.Email)
		c.Locals("roleID", claims.RoleID)
		c.Locals("roleName", claims.RoleName)

		return c.Next()
	}
}
