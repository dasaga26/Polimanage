package presentation

import "github.com/gofiber/fiber/v2"

// RegisterRoutes registra las rutas de pistas
func RegisterRoutes(app *fiber.App, handler *PistaHandler) {
	api := app.Group("/api")
	pistas := api.Group("/pistas")

	pistas.Get("/", handler.GetAll)
	pistas.Get("/:id", handler.GetByID)
	pistas.Post("/", handler.Create)
	pistas.Put("/:id", handler.Update)
	pistas.Delete("/:id", handler.Delete)
}
