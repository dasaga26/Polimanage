package presentation

import (
	"github.com/gofiber/fiber/v2"
)

// RegisterRoutes registra todas las rutas de pagos
func RegisterRoutes(app *fiber.App, handler *PaymentHandler) {
	payments := app.Group("/api/payments")

	payments.Post("/", handler.ProcessPayment)
	payments.Post("/booking", handler.ProcessBookingPayment)
	payments.Post("/class", handler.ProcessClassPayment)
	payments.Post("/club", handler.ProcessClubPayment)
	payments.Post("/refund", handler.RefundPayment)
	payments.Get("/user/:user_id", handler.GetUserPayments)
	payments.Get("/:id", handler.GetPaymentByID)
}
