package middleware

import (
	"github.com/gofiber/fiber/v2"
)

// ======================================================================================
// MIDDLEWARE ADMIN - Control de acceso por rol administrativo
// Debe usarse DESPUÉS de AuthMiddleware (requiere claims en contexto)
// ======================================================================================

// AdminMiddleware permite el acceso únicamente a usuarios con rol ADMIN o GESTOR.
// Si el usuario no tiene el rol requerido, devuelve 403 Forbidden.
func AdminMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		roleName, ok := c.Locals("roleName").(string)
		if !ok || roleName == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "No autenticado",
			})
		}

		if roleName != "ADMIN" && roleName != "GESTOR" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Acceso prohibido: se requiere rol de administrador",
			})
		}

		return c.Next()
	}
}

// RequireAdmin es un alias de AdminMiddleware para compatibilidad con código existente.
func RequireAdmin() fiber.Handler {
	return AdminMiddleware()
}

// RequireRoleByName permite el acceso a uno o más roles indicados por nombre.
func RequireRoleByName(allowedRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		roleName, ok := c.Locals("roleName").(string)
		if !ok || roleName == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "No autenticado",
			})
		}

		for _, allowed := range allowedRoles {
			if roleName == allowed {
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Acceso prohibido: rol insuficiente",
		})
	}
}
