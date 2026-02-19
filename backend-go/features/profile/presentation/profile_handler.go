package presentation

import (
	"backend-go/features/profile/application"
	"backend-go/features/profile/domain"
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// ======================================================================================
// PROFILE HANDLER (PRESENTACIÓN - ANTI-FAT CONTROLLER)
// ======================================================================================

type ProfileHandler struct {
	profileService *application.ProfileService
}

func NewProfileHandler(profileService *application.ProfileService) *ProfileHandler {
	return &ProfileHandler{
		profileService: profileService,
	}
}

// GetMyProfile maneja GET /profile/me
// @Summary Obtener mi perfil
// @Tags profile
// @Security BearerAuth
// @Produce json
// @Success 200 {object} ProfileResponse
// @Router /api/profile/me [get]
func (h *ProfileHandler) GetMyProfile(c *fiber.Ctx) error {
	// Obtener userID del contexto (inyectado por JWT middleware)
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Usuario no autenticado",
		})
	}

	// Obtener perfil
	profile, err := h.profileService.GetMyProfile(userID)
	if err != nil {
		return handleProfileError(c, err)
	}

	return c.JSON(ToProfileResponse(profile))
}

// UpdateMyProfile maneja PUT /profile/me
// @Summary Actualizar mi perfil
// @Tags profile
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param body body UpdateProfileRequest true "Datos a actualizar"
// @Success 200 {object} ProfileResponse
// @Router /api/profile/me [put]
func (h *ProfileHandler) UpdateMyProfile(c *fiber.Ctx) error {
	// Obtener userID del contexto
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Usuario no autenticado",
		})
	}

	// Parsear request
	var req UpdateProfileRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Datos inválidos",
		})
	}

	// Convertir a domain
	updateData := &domain.UpdateProfileData{
		Phone: req.Phone,
		DNI:   req.DNI,
	}

	// Solo actualizar fullName si se proporciona
	if req.FullName != "" {
		updateData.FullName = &req.FullName
	}

	// Actualizar perfil
	profile, err := h.profileService.UpdateMyProfile(userID, updateData)
	if err != nil {
		return handleProfileError(c, err)
	}

	return c.JSON(ToProfileResponse(profile))
}

// ChangePassword maneja POST /profile/change-password
// @Summary Cambiar contraseña
// @Tags profile
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param body body ChangePasswordRequest true "Contraseñas"
// @Success 200 {object} map[string]string
// @Router /api/profile/change-password [post]
func (h *ProfileHandler) ChangePassword(c *fiber.Ctx) error {
	// Obtener userID del contexto
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Usuario no autenticado",
		})
	}

	// Parsear request
	var req ChangePasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Datos inválidos",
		})
	}

	// Validar que las contraseñas coincidan
	if req.NewPassword != req.ConfirmPassword {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Las contraseñas no coinciden",
		})
	}

	// Convertir a domain
	passwordData := &domain.ChangePasswordData{
		CurrentPassword: req.CurrentPassword,
		NewPassword:     req.NewPassword,
	}

	// Cambiar contraseña
	if err := h.profileService.ChangePassword(userID, passwordData); err != nil {
		return handleProfileError(c, err)
	}

	return c.JSON(fiber.Map{
		"message": "Contraseña actualizada correctamente",
	})
}

// ======================================================================================
// UTILIDADES
// ======================================================================================

// handleProfileError maneja errores de dominio y los convierte a respuestas HTTP
func handleProfileError(c *fiber.Ctx, err error) error {
	switch {
	case errors.Is(err, domain.ErrProfileNotFound):
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Perfil no encontrado",
		})
	case errors.Is(err, domain.ErrInvalidUserID):
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ID de usuario inválido",
		})
	case errors.Is(err, domain.ErrInvalidPassword):
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Contraseña actual incorrecta",
		})
	case errors.Is(err, domain.ErrWeakPassword):
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "La contraseña debe tener al menos 8 caracteres",
		})
	case errors.Is(err, domain.ErrUpdateFailed):
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error al actualizar el perfil",
		})
	case errors.Is(err, domain.ErrPasswordChangeFailed):
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error al cambiar la contraseña",
		})
	default:
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error interno del servidor",
		})
	}
}
