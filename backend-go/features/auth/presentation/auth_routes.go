package presentation

import (
	"github.com/gofiber/fiber/v2"
)

// ======================================================================================
// AUTH ROUTES - V2
// CtrlAuth: register, login, logout, refresh, logout-all
// ======================================================================================

func RegisterAuthRoutes(app *fiber.App, handler *AuthHandler) {
	auth := app.Group("/api/auth")

	// Rutas públicas (sin autenticación)
	auth.Post("/register", handler.Register)
	auth.Post("/login", handler.Login)
	auth.Post("/refresh", handler.RefreshToken) // V2: Refresh es público (usa cookie)
	auth.Post("/logout", handler.Logout)        // V2: Logout es público

	// Rutas protegidas se registran desde el main con middleware JWT
}

// RegisterProtectedAuthRoutes registra rutas que requieren autenticación
func RegisterProtectedAuthRoutes(auth fiber.Router, handler *AuthHandler) {
	auth.Get("/me", handler.GetMe)
	auth.Post("/logout-all", handler.LogoutAllDevices) // V2: Logout global
}
