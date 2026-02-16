package presentation

import (
	"backend-go/features/profile/application"
	"backend-go/features/profile/domain"
	"errors"

	"github.com/gofiber/fiber/v2"
)

// ======================================================================================
// PROFILE HANDLER (PRESENTACIÓN - ANTI-FAT CONTROLLER)
// CtrlProfile: getProfile
// ======================================================================================

type ProfileHandler struct {
	profileService *application.ProfileService
}

func NewProfileHandler(profileService *application.ProfileService) *ProfileHandler {
	return &ProfileHandler{
		profileService: profileService,
	}
}

// GetProfile maneja GET /profiles/:username
// @Summary Obtener perfil de usuario
// @Tags profile
// @Produce json
// @Param username path string true "Username/slug"
// @Success 200 {object} ProfileResponse
// @Router /api/profiles/{username} [get]
func (h *ProfileHandler) GetProfile(c *fiber.Ctx) error {
	username := c.Params("username")

	// Obtener perfil
	profile, err := h.profileService.GetProfileByUsername(username)
	if err != nil {
		return handleProfileError(c, err)
	}

	return c.JSON(ToProfileResponse(profile))
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
	case errors.Is(err, domain.ErrInvalidUsername):
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Nombre de usuario inválido",
		})
	default:
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error interno del servidor",
		})
	}
}
