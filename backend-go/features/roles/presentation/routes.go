package presentation

import "github.com/gofiber/fiber/v2"

func RegisterRoutes(app *fiber.App, handler *RoleHandler) {
	api := app.Group("/api")
	roles := api.Group("/roles")

	roles.Get("/", handler.GetAllRoles)
}
