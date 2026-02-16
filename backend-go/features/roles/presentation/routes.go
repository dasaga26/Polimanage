package presentation

import (
	"backend-go/shared/middleware"
	"backend-go/shared/security"

	"github.com/gofiber/fiber/v2"
)

// ======================================================================================
// ROLE ROUTES - Solo ADMIN puede gestionar roles
// ======================================================================================

func RegisterRoutes(app *fiber.App, handler *RoleHandler, jwtService security.JWTService) {
	roles := app.Group("/api/roles")
	roles.Use(middleware.JWTMiddleware(jwtService))
	roles.Use(middleware.RequireRoleByName("ADMIN", "GESTOR"))

	roles.Get("/", handler.GetAllRoles) // Listar roles - Solo ADMIN
}
