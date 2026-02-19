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
	// Grupo base
	clubs := app.Group("/api/clubs")

	// Rutas públicas - Ver clubs (sin middleware)
	clubs.Get("/", handler.GetAll)
	clubs.Get("/:slug", handler.GetBySlug)
	clubs.Get("/:slug/members", handler.GetMembers)

	// Rutas protegidas - Solo ADMIN, GESTOR y CLUB (gestión de clubs)
	clubs.Post("/", middleware.JWTMiddleware(jwtService), middleware.RequireRoleByName("ADMIN", "GESTOR", "CLUB"), handler.Create)
	clubs.Put("/:slug", middleware.JWTMiddleware(jwtService), middleware.RequireRoleByName("ADMIN", "GESTOR", "CLUB"), handler.Update)
	clubs.Delete("/:slug", middleware.JWTMiddleware(jwtService), middleware.RequireRoleByName("ADMIN", "GESTOR", "CLUB"), handler.Delete)
	clubs.Post("/:slug/members", middleware.JWTMiddleware(jwtService), middleware.RequireRoleByName("ADMIN", "GESTOR", "CLUB"), handler.AddMember)

	// Rutas protegidas - Autenticado (membresías)
	clubs.Delete("/memberships/:id", middleware.JWTMiddleware(jwtService), handler.RemoveMember)
	clubs.Post("/memberships/:id/renew", middleware.JWTMiddleware(jwtService), handler.RenewMembership)
	clubs.Post("/memberships/:id/suspend", middleware.JWTMiddleware(jwtService), handler.SuspendMembership)
	clubs.Post("/memberships/:id/resume", middleware.JWTMiddleware(jwtService), handler.ResumeMembership)
	clubs.Post("/memberships/:id/cancel", middleware.JWTMiddleware(jwtService), handler.CancelMembership)
	clubs.Put("/memberships/:id/billing-date", middleware.JWTMiddleware(jwtService), handler.UpdateBillingDate)
}
