package presentation

import (
	"backend-go/shared/middleware"
	"backend-go/shared/security"

	"github.com/gofiber/fiber/v2"
)

// ======================================================================================
// BOOKING ROUTES
// Admin: GET / (todas las reservas), GET /:id
// Autenticado: POST / (crear), PUT /:id (modificar), DELETE /:id, POST /:id/cancel
// Público: GET /pista/:pistaId/date/:date (ver disponibilidad)
// ======================================================================================

// RegisterRoutes registra las rutas del módulo de bookings
func RegisterRoutes(app *fiber.App, handler *BookingHandler, jwtService security.JWTService) {
	// Grupo base
	bookings := app.Group("/api/bookings")

	// Rutas públicas - Ver disponibilidad (sin middleware)
	bookings.Get("/pista/:pistaId/date/:date", handler.GetByPistaAndDate)

	// Rutas protegidas - Solo ADMIN y GESTOR
	bookings.Get("/", middleware.JWTMiddleware(jwtService), middleware.RequireRoleByName("ADMIN", "GESTOR"), handler.GetAll)
	bookings.Get("/:id", middleware.JWTMiddleware(jwtService), middleware.RequireRoleByName("ADMIN", "GESTOR"), handler.GetByID)

	// Rutas protegidas - Autenticado (cualquier usuario autenticado)
	bookings.Post("/", middleware.JWTMiddleware(jwtService), handler.Create)
	bookings.Put("/:id", middleware.JWTMiddleware(jwtService), handler.Update)
	bookings.Delete("/:id", middleware.JWTMiddleware(jwtService), handler.Delete)
	bookings.Post("/:id/cancel", middleware.JWTMiddleware(jwtService), handler.Cancel)
}
