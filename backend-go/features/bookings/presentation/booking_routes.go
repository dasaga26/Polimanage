package presentation

import "github.com/gofiber/fiber/v2"

// RegisterRoutes registra las rutas del módulo de bookings
func RegisterRoutes(app *fiber.App, handler *BookingHandler) {
	bookings := app.Group("/api/bookings")

	bookings.Get("/", handler.GetAll)
	bookings.Get("/:id", handler.GetByID)
	bookings.Get("/pista/:pistaId/date/:date", handler.GetByPistaAndDate)
	bookings.Post("/", handler.Create)
	bookings.Put("/:id", handler.Update)
	bookings.Delete("/:id", handler.Delete)
	bookings.Post("/:id/cancel", handler.Cancel)
}
