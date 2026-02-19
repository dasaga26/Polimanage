package presentation

import (
	"backend-go/shared/middleware"
	"backend-go/shared/security"

	"github.com/gofiber/fiber/v2"
)

// ======================================================================================
// PROFILE ROUTES
// ======================================================================================

func RegisterProfileRoutes(app *fiber.App, handler *ProfileHandler, jwtService security.JWTService) {
	// Grupo protegido con JWT middleware
	profile := app.Group("/api/profile")
	profile.Use(middleware.JWTMiddleware(jwtService))

	// Rutas del perfil del usuario autenticado
	profile.Get("/me", handler.GetMyProfile)
	profile.Put("/me", handler.UpdateMyProfile)
	profile.Post("/change-password", handler.ChangePassword)
}
