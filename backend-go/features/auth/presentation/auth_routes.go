package presentation

import (
	"github.com/gofiber/fiber/v2"
)

// ======================================================================================
// AUTH ROUTES
// CtrlAuth: register, login, logout
// ======================================================================================

func RegisterAuthRoutes(app *fiber.App, handler *AuthHandler) {
	auth := app.Group("/api/auth")

	// Rutas públicas (sin autenticación)
	auth.Post("/register", handler.Register)
	auth.Post("/login", handler.Login)

	// Rutas protegidas se registran desde el main con middleware JWT
}

// RegisterProtectedAuthRoutes registra rutas que requieren autenticación
func RegisterProtectedAuthRoutes(auth fiber.Router, handler *AuthHandler) {
	auth.Get("/me", handler.GetMe)
	auth.Post("/refresh", handler.RefreshToken)
	auth.Post("/logout", handler.Logout)
}
