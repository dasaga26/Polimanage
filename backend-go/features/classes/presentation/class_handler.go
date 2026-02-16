package presentation

import (
	"backend-go/features/classes/application"
	"backend-go/features/classes/domain"
	"net/url"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type ClassHandler struct {
	service *application.ClassService
}

func NewClassHandler(service *application.ClassService) *ClassHandler {
	return &ClassHandler{service: service}
}

// GetAll maneja GET /classes
// @Summary Listar todas las clases
// @Tags classes
// @Produce json
// @Success 200 {array} ClassResponse
// @Router /api/classes [get]
func (h *ClassHandler) GetAll(c *fiber.Ctx) error {
	classes, err := h.service.GetAllClasses()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	responses := make([]ClassResponse, len(classes))
	for i, class := range classes {
		responses[i] = ToResponse(&class)
	}

	return c.JSON(responses)
}

// GetByID maneja GET /classes/:slug
// @Summary Obtener clase por slug
// @Tags classes
// @Produce json
// @Param slug path string true "Slug de la clase"
// @Success 200 {object} ClassResponse
// @Router /api/classes/{slug} [get]
func (h *ClassHandler) GetByID(c *fiber.Ctx) error {
	slug, err := url.QueryUnescape(c.Params("slug"))
	if err != nil || slug == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Slug inválido"})
	}

	class, err := h.service.GetClassBySlug(slug)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(ToResponse(class))
}

// GetByInstructor maneja GET /classes/instructor/:instructorId
// @Summary Obtener clases por instructor
// @Tags classes
// @Produce json
// @Param instructorId path int true "ID del instructor"
// @Success 200 {array} ClassResponse
// @Router /api/classes/instructor/{instructorId} [get]
func (h *ClassHandler) GetByInstructor(c *fiber.Ctx) error {
	instructorID, err := strconv.Atoi(c.Params("instructorId"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ID de instructor inválido"})
	}

	classes, err := h.service.GetClassesByInstructor(instructorID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	responses := make([]ClassResponse, len(classes))
	for i, class := range classes {
		responses[i] = ToResponse(&class)
	}

	return c.JSON(responses)
}

// Create maneja POST /classes
// @Summary Crear una nueva clase
// @Tags classes
// @Accept json
// @Produce json
// @Param class body CreateClassRequest true "Datos de la clase"
// @Success 201 {object} ClassResponse
// @Router /api/classes [post]
func (h *ClassHandler) Create(c *fiber.Ctx) error {
	var req CreateClassRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	// TEMPORAL: Asumimos que el usuario actual es ADMIN (role_id = 1)
	// En producción, esto vendría del token JWT
	userRoleID := 1

	// Mapear Request -> Domain Entity
	class := &domain.Class{
		PistaID:      req.PistaID,
		InstructorID: req.InstructorID,
		Title:        req.Title,
		Description:  req.Description,
		StartTime:    req.StartTime.UTC(),
		EndTime:      req.EndTime.UTC(),
		MaxCapacity:  req.MaxCapacity,
		PriceCents:   req.PriceCents,
	}

	if err := h.service.CreateClass(class, userRoleID); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(ToResponse(class))
}

// Update maneja PUT /classes/:slug
// @Summary Actualizar una clase
// @Tags classes
// @Accept json
// @Produce json
// @Param slug path string true "Slug de la clase"
// @Param class body UpdateClassRequest true "Datos a actualizar"
// @Success 200 {object} ClassResponse
// @Router /api/classes/{slug} [put]
func (h *ClassHandler) Update(c *fiber.Ctx) error {
	slug, err := url.QueryUnescape(c.Params("slug"))
	if err != nil || slug == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Slug inválido"})
	}

	var req UpdateClassRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	// Obtener clase existente
	existingClass, err := h.service.GetClassBySlug(slug)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": err.Error()})
	}

	// Actualizar campos
	existingClass.PistaID = req.PistaID
	existingClass.InstructorID = req.InstructorID
	existingClass.Title = req.Title
	existingClass.Description = req.Description
	existingClass.StartTime = req.StartTime.UTC()
	existingClass.EndTime = req.EndTime.UTC()
	existingClass.MaxCapacity = req.MaxCapacity
	existingClass.PriceCents = req.PriceCents

	if req.Status != "" {
		existingClass.Status = req.Status
	}

	if err := h.service.UpdateClass(existingClass); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(ToResponse(existingClass))
}

// Delete maneja DELETE /classes/:slug
// @Summary Eliminar una clase
// @Tags classes
// @Param slug path string true "Slug de la clase"
// @Success 204
// @Router /api/classes/{slug} [delete]
func (h *ClassHandler) Delete(c *fiber.Ctx) error {
	slug, err := url.QueryUnescape(c.Params("slug"))
	if err != nil || slug == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Slug inválido"})
	}

	if err := h.service.DeleteClassBySlug(slug); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(204).Send(nil)
}

// Cancel maneja POST /classes/:slug/cancel
// @Summary Cancelar una clase
// @Tags classes
// @Produce json
// @Param slug path string true "Slug de la clase"
// @Success 200 {object} ClassResponse
// @Router /api/classes/{slug}/cancel [post]
func (h *ClassHandler) Cancel(c *fiber.Ctx) error {
	slug, err := url.QueryUnescape(c.Params("slug"))
	if err != nil || slug == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Slug inválido"})
	}

	if err := h.service.CancelClassBySlug(slug); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	class, _ := h.service.GetClassBySlug(slug)
	return c.JSON(ToResponse(class))
}

// GetEnrollments maneja GET /classes/:slug/enrollments
// @Summary Obtener inscripciones de una clase
// @Tags classes
// @Produce json
// @Param slug path string true "Slug de la clase"
// @Success 200 {array} EnrollmentResponse
// @Router /api/classes/{slug}/enrollments [get]
func (h *ClassHandler) GetEnrollments(c *fiber.Ctx) error {
	slug, err := url.QueryUnescape(c.Params("slug"))
	if err != nil || slug == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Slug inválido"})
	}

	// Obtener la clase para tener su ID
	class, err := h.service.GetClassBySlug(slug)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": err.Error()})
	}

	enrollments, err := h.service.GetEnrollments(class.ID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	// Convertir a EnrollmentResponse usando datos del dominio de classes
	responses := make([]EnrollmentResponse, len(enrollments))
	for i, enrollment := range enrollments {
		responses[i] = ClassEnrollmentToResponse(&enrollment)
	}

	return c.JSON(responses)
}

// ToResponse convierte una entidad de dominio a un DTO de respuesta
func ToResponse(class *domain.Class) ClassResponse {
	response := ClassResponse{
		ID:             class.ID,
		Slug:           class.Slug,
		PistaID:        class.PistaID,
		PistaName:      class.PistaName,
		InstructorID:   class.InstructorID,
		InstructorName: class.InstructorName,
		Title:          class.Title,
		Description:    class.Description,
		StartTime:      class.StartTime,
		EndTime:        class.EndTime,
		Capacity:       class.MaxCapacity,
		PriceCents:     class.PriceCents,
		PriceEuros:     float64(class.PriceCents) / 100.0,
		Status:         class.Status,
		EnrolledCount:  class.EnrolledCount,
		CreatedAt:      class.CreatedAt,
		UpdatedAt:      class.UpdatedAt,
	}

	// Incluir enrollments si existen
	if len(class.Enrollments) > 0 {
		response.Enrollments = make([]EnrollmentResponse, len(class.Enrollments))
		for i, enrollment := range class.Enrollments {
			response.Enrollments[i] = ClassEnrollmentToResponse(&enrollment)
		}
	}

	return response
}

// ClassEnrollmentToResponse convierte una inscripción de dominio a DTO (desde classes)
func ClassEnrollmentToResponse(enrollment *domain.ClassEnrollment) EnrollmentResponse {
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
