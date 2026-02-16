package presentation

import (
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App, handler *ClubHandler) {
	api := app.Group("/api")
	clubs := api.Group("/clubs")

	// Rutas de gestión de clubs
	clubs.Get("/", handler.GetAll)                  // GET /api/clubs
	clubs.Get("/:slug", handler.GetBySlug)          // GET /api/clubs/:slug
	clubs.Post("/", handler.Create)                 // POST /api/clubs
	clubs.Put("/:slug", handler.Update)             // PUT /api/clubs/:slug
	clubs.Delete("/:slug", handler.Delete)          // DELETE /api/clubs/:slug
	clubs.Get("/:slug/members", handler.GetMembers) // GET /api/clubs/:slug/members
	clubs.Post("/:slug/members", handler.AddMember) // POST /api/clubs/:slug/members

	// Rutas de membresías
	api.Delete("/clubs/memberships/:id", handler.RemoveMember)                // DELETE /api/clubs/memberships/:id
	api.Post("/clubs/memberships/:id/renew", handler.RenewMembership)         // POST /api/clubs/memberships/:id/renew
	api.Post("/clubs/memberships/:id/suspend", handler.SuspendMembership)     // POST /api/clubs/memberships/:id/suspend
	api.Post("/clubs/memberships/:id/resume", handler.ResumeMembership)       // POST /api/clubs/memberships/:id/resume
	api.Post("/clubs/memberships/:id/cancel", handler.CancelMembership)       // POST /api/clubs/memberships/:id/cancel
	api.Put("/clubs/memberships/:id/billing-date", handler.UpdateBillingDate) // PUT /api/clubs/memberships/:id/billing-date
}
