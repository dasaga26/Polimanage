package presentation

import (
	"github.com/gofiber/fiber/v2"
)

// ======================================================================================
// PROFILE ROUTES
// CtrlProfile: getProfile
// ======================================================================================

func RegisterProfileRoutes(app *fiber.App, handler *ProfileHandler) {
	profiles := app.Group("/api/profiles")

	// Rutas públicas
	profiles.Get("/:username", handler.GetProfile)
}
