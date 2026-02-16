package presentation

import (
	"backend-go/features/payments/application"
	"backend-go/features/payments/domain"
	"errors"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type PaymentHandler struct {
	service *application.PaymentService
}

func NewPaymentHandler(service *application.PaymentService) *PaymentHandler {
	return &PaymentHandler{service: service}
}

// ProcessPayment maneja la creación de un pago genérico
// @Summary Procesar un pago
// @Tags payments
// @Accept json
// @Produce json
// @Param payment body CreatePaymentRequest true "Datos del pago"
// @Success 201 {object} PaymentResponse
// @Router /api/payments [post]
func (h *PaymentHandler) ProcessPayment(c *fiber.Ctx) error {
	var req CreatePaymentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	payment, err := h.service.ProcessPayment(userID, req.AmountCents, req.CustomerID, req.Description)
	if err != nil {
		if errors.Is(err, domain.ErrInvalidAmount) {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(ToPaymentResponse(payment))
}

// ProcessBookingPayment maneja el pago de una reserva
// @Summary Procesar pago de reserva
// @Tags payments
// @Accept json
// @Produce json
// @Param payment body CreateBookingPaymentRequest true "Datos del pago de reserva"
// @Success 201 {object} PaymentResponse
// @Router /api/payments/booking [post]
func (h *PaymentHandler) ProcessBookingPayment(c *fiber.Ctx) error {
	var req CreateBookingPaymentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	payment, err := h.service.ProcessBookingPayment(userID, req.BookingID, req.AmountCents, req.CustomerID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(ToPaymentResponse(payment))
}

// ProcessClassPayment maneja el pago de una inscripción a clase
// @Summary Procesar pago de clase
// @Tags payments
// @Accept json
// @Produce json
// @Param payment body CreateClassPaymentRequest true "Datos del pago de clase"
// @Success 201 {object} PaymentResponse
// @Router /api/payments/class [post]
func (h *PaymentHandler) ProcessClassPayment(c *fiber.Ctx) error {
	var req CreateClassPaymentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	payment, err := h.service.ProcessClassPayment(userID, req.EnrollmentID, req.AmountCents, req.CustomerID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(ToPaymentResponse(payment))
}

// ProcessClubPayment maneja el pago de una membresía a club
// @Summary Procesar pago de membresía
// @Tags payments
// @Accept json
// @Produce json
// @Param payment body CreateClubPaymentRequest true "Datos del pago de membresía"
// @Success 201 {object} PaymentResponse
// @Router /api/payments/club [post]
func (h *PaymentHandler) ProcessClubPayment(c *fiber.Ctx) error {
	var req CreateClubPaymentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	payment, err := h.service.ProcessClubPayment(userID, req.MembershipID, req.AmountCents, req.CustomerID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(ToPaymentResponse(payment))
}

// GetUserPayments obtiene todos los pagos de un usuario
// @Summary Obtener pagos de usuario
// @Tags payments
// @Produce json
// @Param user_id path int true "User ID"
// @Success 200 {array} PaymentResponse
// @Router /api/payments/user/{user_id} [get]
func (h *PaymentHandler) GetUserPayments(c *fiber.Ctx) error {
	userID, err := strconv.ParseUint(c.Params("user_id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	payments, err := h.service.GetUserPayments(uint(userID))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	response := make([]PaymentResponse, len(payments))
	for i := range payments {
		response[i] = ToPaymentResponse(&payments[i])
	}

	return c.JSON(response)
}

// GetPaymentByID obtiene un pago por ID
// @Summary Obtener pago por ID
// @Tags payments
// @Produce json
// @Param id path int true "Payment ID"
// @Success 200 {object} PaymentResponse
// @Router /api/payments/{id} [get]
func (h *PaymentHandler) GetPaymentByID(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid payment ID"})
	}

	payment, err := h.service.GetPaymentByID(uint(id))
	if err != nil {
		if errors.Is(err, domain.ErrPaymentNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(ToPaymentResponse(payment))
}

// RefundPayment procesa un reembolso
// @Summary Reembolsar un pago
// @Tags payments
// @Accept json
// @Produce json
// @Param refund body RefundPaymentRequest true "Datos del reembolso"
// @Success 200 {object} MessageResponse
// @Router /api/payments/refund [post]
func (h *PaymentHandler) RefundPayment(c *fiber.Ctx) error {
	var req RefundPaymentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	if err := h.service.RefundPayment(req.PaymentID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Reembolso procesado exitosamente"})
}
