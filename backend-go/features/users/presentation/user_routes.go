package presentation

import "github.com/gofiber/fiber/v2"

// ======================================================================================
// USER ROUTES  
// CtrlUser: getUser, update
// ======================================================================================

func RegisterRoutes(app *fiber.App, handler *UserHandler) {
	api := app.Group("/api/users")

	api.Get("", handler.GetAll)            // Listar usuarios (admin)
	api.Get("/:slug", handler.GetBySlug)   // getUser - Obtener usuario por slug
	api.Put("/:slug", handler.Update)      // update - Actualizar usuario
	// DELETE eliminado - solo para admin, implementar con RBAC si es necesario
}
