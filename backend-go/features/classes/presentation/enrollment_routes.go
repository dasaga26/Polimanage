package presentation

import (
	"backend-go/shared/middleware"
	"backend-go/shared/security"

	"github.com/gofiber/fiber/v2"
)

// ======================================================================================
// ENROLLMENT ROUTES - Autenticado
// ======================================================================================

func RegisterEnrollmentRoutes(router fiber.Router, handler *EnrollmentHandler, jwtService security.JWTService) {
	router.Use(middleware.JWTMiddleware(jwtService))

	// Rutas de inscripciones - Autenticado
	router.Delete("/:id", handler.Unenroll) // Desinscribirse - Validar usuario en handler
}
