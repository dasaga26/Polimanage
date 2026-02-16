package middleware

import (
	"github.com/gofiber/fiber/v2"
)

// ======================================================================================
// RBAC MIDDLEWARE (CONTROL DE ACCESO BASADO EN ROLES)
// ======================================================================================

// RoleChecker función que valida si un rol cumple con los requisitos
type RoleChecker func(roleID uint, roleName string) bool

// RequireRole middleware que requiere un rol específico
func RequireRole(allowedRoles ...uint) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Extraer rol del contexto (puesto por JWTMiddleware)
		roleID, ok := c.Locals("user_role_id").(uint)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "No autenticado",
			})
		}

		// Validar si el rol está permitido
		for _, allowedRole := range allowedRoles {
			if roleID == allowedRole {
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Acceso prohibido: rol insuficiente",
		})
	}
}

// RequireRoleByName middleware que requiere un rol específico por nombre
func RequireRoleByName(allowedRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		roleName, ok := c.Locals("user_role_name").(string)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "No autenticado",
			})
		}

		for _, allowedRole := range allowedRoles {
			if roleName == allowedRole {
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Acceso prohibido: rol insuficiente",
		})
	}
}

// RequireAdmin middleware que solo permite administradores (roleID = 1)
func RequireAdmin() fiber.Handler {
	return RequireRole(1)
}

// RequireProfessional middleware para profesionales (roleID = 2)
func RequireProfessional() fiber.Handler {
	return RequireRole(1, 2) // Admin o Professional
}

// CustomRoleCheck middleware con validación personalizada
func CustomRoleCheck(checker RoleChecker) fiber.Handler {
	return func(c *fiber.Ctx) error {
		roleID, _ := c.Locals("user_role_id").(uint)
		roleName, _ := c.Locals("user_role_name").(string)

		if !checker(roleID, roleName) {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Acceso prohibido",
			})
		}

		return c.Next()
	}
}
