package presentation

import (
	"backend-go/shared/middleware"
	"backend-go/shared/security"

	"github.com/gofiber/fiber/v2"
)

// ======================================================================================
// CLASS ROUTES
// Público: GET / (listar clases), GET /:slug, GET /instructor/:instructorId
// Admin: POST /, PUT /:slug, DELETE /:slug, POST /:slug/cancel
// Autenticado: POST /:slug/enroll
// ======================================================================================

func RegisterRoutes(app *fiber.App, handler *ClassHandler, enrollmentHandler *EnrollmentHandler, jwtService security.JWTService) {
	// Grupo base
	classes := app.Group("/api/classes")

	// Rutas públicas - Ver clases (sin middleware)
	classes.Get("/", handler.GetAll)
	classes.Get("/:slug", handler.GetByID)
	classes.Get("/instructor/:instructorId", handler.GetByInstructor)

	// Rutas protegidas - Solo ADMIN, GESTOR y MONITOR (gestión de clases)
	classes.Post("/", middleware.JWTMiddleware(jwtService), middleware.RequireRoleByName("ADMIN", "GESTOR", "MONITOR"), handler.Create)
	classes.Put("/:slug", middleware.JWTMiddleware(jwtService), middleware.RequireRoleByName("ADMIN", "GESTOR", "MONITOR"), handler.Update)
	classes.Delete("/:slug", middleware.JWTMiddleware(jwtService), middleware.RequireRoleByName("ADMIN", "GESTOR", "MONITOR"), handler.Delete)
	classes.Post("/:slug/cancel", middleware.JWTMiddleware(jwtService), middleware.RequireRoleByName("ADMIN", "GESTOR", "MONITOR"), handler.Cancel)
	classes.Get("/:slug/enrollments", middleware.JWTMiddleware(jwtService), middleware.RequireRoleByName("ADMIN", "GESTOR", "MONITOR"), handler.GetEnrollments)

	// Rutas protegidas - Autenticado (inscripciones)
	classes.Post("/:slug/enroll", middleware.JWTMiddleware(jwtService), enrollmentHandler.Enroll)
}
