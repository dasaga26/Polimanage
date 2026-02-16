package presentation

import (
	"backend-go/shared/middleware"
	"backend-go/shared/security"

	"github.com/gofiber/fiber/v2"
)

// ======================================================================================
// PISTA ROUTES
// Público: GET / y GET /:id
// Admin: POST /, PUT /:id, DELETE /:id
// ======================================================================================

// RegisterRoutes registra las rutas de pistas
func RegisterRoutes(app *fiber.App, handler *PistaHandler, jwtService security.JWTService) {
	// Rutas públicas
	public := app.Group("/api/pistas")
	public.Get("/", handler.GetAll)     // Listar pistas - Público
	public.Get("/:id", handler.GetByID) // Ver pista - Público

	// Rutas protegidas - Solo ADMIN y GESTOR
	admin := app.Group("/api/pistas")
	admin.Use(middleware.JWTMiddleware(jwtService))
	admin.Use(middleware.RequireRoleByName("ADMIN", "GESTOR"))
	admin.Post("/", handler.Create)      // Crear pista - Solo ADMIN
	admin.Put("/:id", handler.Update)    // Actualizar pista - Solo ADMIN
	admin.Delete("/:id", handler.Delete) // Eliminar pista - Solo ADMIN
}
