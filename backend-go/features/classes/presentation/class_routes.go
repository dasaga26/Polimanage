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
	// Rutas públicas - Ver clases
	public := app.Group("/api/classes")
	public.Get("/", handler.GetAll)                                  // Listar clases - Público
	public.Get("/:slug", handler.GetByID)                            // Ver clase por slug - Público
	public.Get("/instructor/:instructorId", handler.GetByInstructor) // Clases por instructor - Público

	// Rutas protegidas - Solo ADMIN, GESTOR y MONITOR (gestión de clases)
	admin := app.Group("/api/classes")
	admin.Use(middleware.JWTMiddleware(jwtService))
	admin.Use(middleware.RequireRoleByName("ADMIN", "GESTOR", "MONITOR"))
	admin.Post("/", handler.Create)                         // Crear clase - Solo ADMIN
	admin.Put("/:slug", handler.Update)                     // Actualizar clase - Solo ADMIN
	admin.Delete("/:slug", handler.Delete)                  // Eliminar clase - Solo ADMIN
	admin.Post("/:slug/cancel", handler.Cancel)             // Cancelar clase - Solo ADMIN
	admin.Get("/:slug/enrollments", handler.GetEnrollments) // Ver inscripciones - Solo ADMIN

	// Rutas protegidas - Autenticado (inscripciones)
	protected := app.Group("/api/classes")
	protected.Use(middleware.JWTMiddleware(jwtService))
	protected.Post("/:slug/enroll", enrollmentHandler.Enroll) // Inscribirse - Autenticado
}
