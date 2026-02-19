package presentation

import (
	"backend-go/features/bookings/application"
	"backend-go/features/bookings/domain"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type BookingHandler struct {
	service *application.BookingService
}

func NewBookingHandler(service *application.BookingService) *BookingHandler {
	return &BookingHandler{service: service}
}

// GetAll maneja GET /bookings
// @Summary Listar todas las reservas
// @Tags bookings
// @Produce json
// @Success 200 {array} BookingResponse
// @Router /api/bookings [get]
func (h *BookingHandler) GetAll(c *fiber.Ctx) error {
	bookings, err := h.service.GetAllBookings()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	responses := make([]BookingResponse, len(bookings))
	for i, b := range bookings {
		responses[i] = ToResponse(&b)
	}

	return c.JSON(responses)
}

// GetByID maneja GET /bookings/:id
// @Summary Obtener reserva por ID
// @Tags bookings
// @Produce json
// @Param id path int true "ID de la reserva"
// @Success 200 {object} BookingResponse
// @Router /api/bookings/{id} [get]
func (h *BookingHandler) GetByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ID inválido"})
	}

	booking, err := h.service.GetBookingByID(id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(ToResponse(booking))
}

// GetByPistaAndDate maneja GET /bookings/pista/:pistaId/date/:date
// @Summary Obtener reservas por pista y fecha
// @Tags bookings
// @Produce json
// @Param pistaId path int true "ID de la pista"
// @Param date path string true "Fecha (YYYY-MM-DD)"
// @Success 200 {array} BookingResponse
// @Router /api/bookings/pista/{pistaId}/date/{date} [get]
func (h *BookingHandler) GetByPistaAndDate(c *fiber.Ctx) error {
	pistaID, err := strconv.Atoi(c.Params("pistaId"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ID de pista inválido"})
	}

	dateStr := c.Params("date")
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Formato de fecha inválido (usar YYYY-MM-DD)"})
	}

	bookings, err := h.service.GetBookingsByPistaAndDate(pistaID, date)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	responses := make([]BookingResponse, len(bookings))
	for i, b := range bookings {
		responses[i] = ToResponse(&b)
	}

	return c.JSON(responses)
}

// Create maneja POST /bookings
// @Summary Crear una nueva reserva
// @Tags bookings
// @Accept json
// @Produce json
// @Param booking body CreateBookingRequest true "Datos de la reserva"
// @Success 201 {object} BookingResponse
// @Router /api/bookings [post]
func (h *BookingHandler) Create(c *fiber.Ctx) error {
	var req CreateBookingRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	// UserID Assignment
	var userID uuid.UUID
	if req.UserID != "" {
		// Si se proporciona UserID en el request, usarlo (para admins creando reservas para otros)
		parsedID, err := uuid.Parse(req.UserID)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "UserID inválido"})
		}
		userID = parsedID
	} else {
		// Si no se proporciona UserID, usar el del usuario autenticado (JWT context)
		jwtUserID := c.Locals("userID")
		if jwtUserID == nil {
			return c.Status(401).JSON(fiber.Map{"error": "No autenticado"})
		}

		// El JWT middleware guarda userID como uuid.UUID directamente
		var ok bool
		userID, ok = jwtUserID.(uuid.UUID)
		if !ok {
			return c.Status(500).JSON(fiber.Map{"error": "Error de autenticación"})
		}
	}

	// Mapear Request -> Domain Entity
	booking := &domain.Booking{
		UserID:    userID,
		PistaID:   req.PistaID,
		StartTime: req.StartTime.UTC(), // Convertir a UTC
		EndTime:   req.EndTime.UTC(),
		Notes:     req.Notes,
		// PriceSnapshotCents se calculará en el servicio consultando la pista
	}

	if err := h.service.CreateBooking(booking); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(ToResponse(booking))
}

// Update maneja PUT /bookings/:id
// @Summary Actualizar una reserva
// @Tags bookings
// @Accept json
// @Produce json
// @Param id path int true "ID de la reserva"
// @Param booking body UpdateBookingRequest true "Datos a actualizar"
// @Success 200 {object} BookingResponse
// @Router /api/bookings/{id} [put]
func (h *BookingHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ID inválido"})
	}

	var req UpdateBookingRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	// Obtener booking existente
	existingBooking, err := h.service.GetBookingByID(id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": err.Error()})
	}

	// Actualizar campos
	existingBooking.PistaID = req.PistaID
	existingBooking.StartTime = req.StartTime.UTC()
	existingBooking.EndTime = req.EndTime.UTC()
	existingBooking.Notes = req.Notes

	if req.UserID != "" {
		parsedID, err := uuid.Parse(req.UserID)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "UserID inválido"})
		}
		existingBooking.UserID = parsedID
	}

	if req.Status != "" {
		existingBooking.Status = req.Status
	}
	if req.PaymentStatus != "" {
		existingBooking.PaymentStatus = req.PaymentStatus
	}

	if err := h.service.UpdateBooking(existingBooking); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(ToResponse(existingBooking))
}

// Delete maneja DELETE /bookings/:id
// @Summary Eliminar una reserva
// @Tags bookings
// @Param id path int true "ID de la reserva"
// @Success 204
// @Router /api/bookings/{id} [delete]
func (h *BookingHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ID inválido"})
	}

	if err := h.service.DeleteBooking(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(204).Send(nil)
}

// Cancel maneja POST /bookings/:id/cancel
// @Summary Cancelar una reserva
// @Tags bookings
// @Produce json
// @Param id path int true "ID de la reserva"
// @Success 200 {object} BookingResponse
// @Router /api/bookings/{id}/cancel [post]
func (h *BookingHandler) Cancel(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ID inválido"})
	}

	if err := h.service.CancelBooking(id); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	booking, _ := h.service.GetBookingByID(id)
	return c.JSON(ToResponse(booking))
}

// ToResponse convierte una entidad de dominio a un DTO de respuesta
func ToResponse(booking *domain.Booking) BookingResponse {
	return BookingResponse{
		ID:                 booking.ID,
		UserID:             booking.UserID.String(),
		UserName:           booking.UserName,
		PistaID:            booking.PistaID,
		PistaName:          booking.PistaName,
		PistaType:          booking.PistaType,
		StartTime:          booking.StartTime,
		EndTime:            booking.EndTime,
		PriceSnapshotCents: booking.PriceSnapshotCents,
		PriceSnapshotEuros: float64(booking.PriceSnapshotCents) / 100.0, // Convertir a euros
		Status:             booking.Status,
		PaymentStatus:      booking.PaymentStatus,
		Notes:              booking.Notes,
		CreatedAt:          booking.CreatedAt,
		UpdatedAt:          booking.UpdatedAt,
	}
}
