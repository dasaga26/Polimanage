package presentation

import (
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App, handler *ClassHandler, enrollmentHandler *EnrollmentHandler) {
	api := app.Group("/api")
	classes := api.Group("/classes")

	// Rutas de gestión de clases
	classes.Get("/", handler.GetAll)                                  // GET /api/classes
	classes.Get("/:slug", handler.GetByID)                            // GET /api/classes/:slug
	classes.Get("/instructor/:instructorId", handler.GetByInstructor) // GET /api/classes/instructor/:instructorId
	classes.Post("/", handler.Create)                                 // POST /api/classes
	classes.Put("/:slug", handler.Update)                             // PUT /api/classes/:slug
	classes.Delete("/:slug", handler.Delete)                          // DELETE /api/classes/:slug
	classes.Post("/:slug/cancel", handler.Cancel)                     // POST /api/classes/:slug/cancel

	// Rutas de inscripciones - delegadas al módulo de enrollments
	classes.Get("/:slug/enrollments", handler.GetEnrollments) // GET /api/classes/:slug/enrollments
	classes.Post("/:slug/enroll", enrollmentHandler.Enroll)   // POST /api/classes/:slug/enroll
}
