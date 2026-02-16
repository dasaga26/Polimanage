package presentation

import (
	"backend-go/shared/middleware"
	"backend-go/shared/security"

	"github.com/gofiber/fiber/v2"
)

// ======================================================================================
// PAYMENT ROUTES
// Admin: GET /:id (ver pago específico), POST /refund (reembolso)
// Autenticado: POST / (procesar pago), GET /user/:user_id (mis pagos)
// ======================================================================================

// RegisterRoutes registra todas las rutas de pagos
func RegisterRoutes(app *fiber.App, handler *PaymentHandler, jwtService security.JWTService) {
	// Rutas protegidas - Solo ADMIN y GESTOR (reembolsos y ver pagos específicos)
	admin := app.Group("/api/payments")
	admin.Use(middleware.JWTMiddleware(jwtService))
	admin.Use(middleware.RequireRoleByName("ADMIN", "GESTOR"))
	admin.Post("/refund", handler.RefundPayment) // Reembolso - Solo ADMIN
	admin.Get("/:id", handler.GetPaymentByID)    // Ver pago por ID - Solo ADMIN

	// Rutas protegidas - Autenticado (procesar pagos y ver mis pagos)
	protected := app.Group("/api/payments")
	protected.Use(middleware.JWTMiddleware(jwtService))
	protected.Post("/", handler.ProcessPayment)               // Procesar pago genérico - Autenticado
	protected.Post("/booking", handler.ProcessBookingPayment) // Pago de reserva - Autenticado
	protected.Post("/class", handler.ProcessClassPayment)     // Pago de clase - Autenticado
	protected.Post("/club", handler.ProcessClubPayment)       // Pago de club - Autenticado
	protected.Get("/user/:user_id", handler.GetUserPayments)  // Mis pagos - Validar usuario en handler
}
