package presentation

import (
	"backend-go/shared/middleware"
	"backend-go/shared/security"

	"github.com/gofiber/fiber/v2"
)

// ======================================================================================
// BOOKING ROUTES
// Admin: GET / (todas las reservas)
// Autenticado: POST / (crear), PUT /:id (modificar), DELETE /:id, POST /:id/cancel
// Público: GET /pista/:pistaId/date/:date (ver disponibilidad)
// ======================================================================================

// RegisterRoutes registra las rutas del módulo de bookings
func RegisterRoutes(app *fiber.App, handler *BookingHandler, jwtService security.JWTService) {
	// Rutas públicas - Ver disponibilidad
	public := app.Group("/api/bookings")
	public.Get("/pista/:pistaId/date/:date", handler.GetByPistaAndDate) // Ver reservas por pista/fecha - Público

	// Rutas protegidas - Solo ADMIN y GESTOR (ver todas las reservas)
	admin := app.Group("/api/bookings")
	admin.Use(middleware.JWTMiddleware(jwtService))
	admin.Use(middleware.RequireRoleByName("ADMIN", "GESTOR"))
	admin.Get("/", handler.GetAll)     // Todas las reservas - Solo ADMIN
	admin.Get("/:id", handler.GetByID) // Ver reserva específica - Solo ADMIN

	// Rutas protegidas - Autenticado (gestionar reservas)
	protected := app.Group("/api/bookings")
	protected.Use(middleware.JWTMiddleware(jwtService))
	protected.Post("/", handler.Create)           // Crear reserva - Autenticado
	protected.Put("/:id", handler.Update)         // Modificar reserva - Validar usuario en handler
	protected.Delete("/:id", handler.Delete)      // Eliminar reserva - Validar usuario en handler
	protected.Post("/:id/cancel", handler.Cancel) // Cancelar reserva - Validar usuario en handler
}
