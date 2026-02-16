package presentation

import (
	"backend-go/features/classes/application"
	"backend-go/features/classes/domain"
	"net/url"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type EnrollmentHandler struct {
	service *application.EnrollmentService
}

func NewEnrollmentHandler(service *application.EnrollmentService) *EnrollmentHandler {
	return &EnrollmentHandler{service: service}
}

// GetByClass maneja GET /classes/:slug/enrollments
// @Summary Obtener inscripciones de una clase
// @Tags enrollments
// @Produce json
// @Param classID query int true "ID de la clase"
// @Success 200 {array} EnrollmentResponse
// @Router /api/classes/{slug}/enrollments [get]
func (h *EnrollmentHandler) GetByClass(c *fiber.Ctx, classID int) error {
	enrollments, err := h.service.GetEnrollmentsByClass(classID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	responses := make([]EnrollmentResponse, len(enrollments))
	for i, enrollment := range enrollments {
		responses[i] = EnrollmentToResponse(&enrollment)
	}

	return c.JSON(responses)
}

// Enroll maneja POST /classes/:slug/enroll
// @Summary Inscribir usuario en una clase
// @Tags enrollments
// @Accept json
// @Produce json
// @Param slug path string true "Slug de la clase"
// @Param enrollment body EnrollUserRequest true "Datos de inscripción"
// @Success 201 {object} map[string]string
// @Router /api/classes/{slug}/enroll [post]
func (h *EnrollmentHandler) Enroll(c *fiber.Ctx) error {
	classSlug, err := url.QueryUnescape(c.Params("slug"))
	if err != nil || classSlug == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Slug de clase inválido"})
	}

	var req EnrollUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	if err := h.service.EnrollUserBySlug(classSlug, req.UserSlug); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(fiber.Map{"message": "Usuario inscrito correctamente"})
}

// Unenroll maneja DELETE /enrollments/:id
// @Summary Cancelar inscripción de un usuario
// @Tags enrollments
// @Param id path int true "ID de la inscripción"
// @Success 204
// @Router /api/enrollments/{id} [delete]
func (h *EnrollmentHandler) Unenroll(c *fiber.Ctx) error {
	enrollmentID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ID inválido"})
	}

	if err := h.service.UnenrollUser(enrollmentID); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(204).Send(nil)
}

// EnrollmentToResponse convierte una entidad de dominio a DTO
func EnrollmentToResponse(enrollment *domain.Enrollment) EnrollmentResponse {
	return EnrollmentResponse{
		ID:           enrollment.ID,
		ClassID:      enrollment.ClassID,
		ClassName:    enrollment.ClassName,
		UserID:       enrollment.UserID.String(),
		UserName:     enrollment.UserName,
		UserEmail:    enrollment.UserEmail,
		Status:       enrollment.Status,
		RegisteredAt: enrollment.RegisteredAt,
		EnrolledAt:   enrollment.RegisteredAt,
	}
}
