package presentation

import (
	"backend-go/shared/middleware"
	"backend-go/shared/security"

	"github.com/gofiber/fiber/v2"
)

// ======================================================================================
// USER ROUTES
// CtrlUser: getUser, update
// ======================================================================================

func RegisterRoutes(app *fiber.App, handler *UserHandler, jwtService security.JWTService) {
	// Rutas públicas
	public := app.Group("/api/users")
	public.Get("/:slug", handler.GetBySlug) // Ver perfil - Público

	// Rutas protegidas - Solo ADMIN y GESTOR
	admin := app.Group("/api/users")
	admin.Use(middleware.JWTMiddleware(jwtService))
	admin.Use(middleware.RequireRoleByName("ADMIN", "GESTOR"))
	admin.Get("", handler.GetAll) // Listar todos los usuarios - Solo ADMIN/GESTOR

	// Rutas protegidas - Autenticado (update)
	protected := app.Group("/api/users")
	protected.Use(middleware.JWTMiddleware(jwtService))
	protected.Put("/:slug", handler.Update) // Actualizar usuario - Validar en handler que es el mismo usuario
}
