package presentation

import (
	"github.com/gofiber/fiber/v2"
)

func RegisterEnrollmentRoutes(router fiber.Router, handler *EnrollmentHandler) {
	// Rutas de inscripciones
	router.Delete("/:id", handler.Unenroll)
}
