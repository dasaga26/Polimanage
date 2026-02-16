package presentation

import (
	"backend-go/shared/middleware"
	"backend-go/shared/security"

	"github.com/gofiber/fiber/v2"
)

// ======================================================================================
// CLUB ROUTES
// Público: GET / (listar clubs), GET /:slug
// Admin: POST /, PUT /:slug, DELETE /:slug, POST /:slug/members, DELETE memberships
// Autenticado: Otros endpoints de membresías
// ======================================================================================

func RegisterRoutes(app *fiber.App, handler *ClubHandler, jwtService security.JWTService) {
	// Rutas públicas - Ver clubs
	public := app.Group("/api/clubs")
	public.Get("/", handler.GetAll)                  // Listar clubs - Público
	public.Get("/:slug", handler.GetBySlug)          // Ver club - Público
	public.Get("/:slug/members", handler.GetMembers) // Ver miembros - Público

	// Rutas protegidas - Solo ADMIN, GESTOR y CLUB (gestión de clubs)
	admin := app.Group("/api/clubs")
	admin.Use(middleware.JWTMiddleware(jwtService))
	admin.Use(middleware.RequireRoleByName("ADMIN", "GESTOR", "CLUB"))
	admin.Post("/", handler.Create)                 // Crear club - Solo ADMIN
	admin.Put("/:slug", handler.Update)             // Actualizar club - Solo ADMIN
	admin.Delete("/:slug", handler.Delete)          // Eliminar club - Solo ADMIN
	admin.Post("/:slug/members", handler.AddMember) // Añadir miembro - Solo ADMIN

	// Rutas protegidas - Autenticado (membresías)
	protected := app.Group("/api/clubs")
	protected.Use(middleware.JWTMiddleware(jwtService))
	protected.Delete("/memberships/:id", handler.RemoveMember)                // Eliminar membresía - Validar en handler
	protected.Post("/memberships/:id/renew", handler.RenewMembership)         // Renovar - Validar en handler
	protected.Post("/memberships/:id/suspend", handler.SuspendMembership)     // Suspender - Validar en handler
	protected.Post("/memberships/:id/resume", handler.ResumeMembership)       // Reanudar - Validar en handler
	protected.Post("/memberships/:id/cancel", handler.CancelMembership)       // Cancelar - Validar en handler
	protected.Put("/memberships/:id/billing-date", handler.UpdateBillingDate) // Actualizar billing - Validar en handler
}
