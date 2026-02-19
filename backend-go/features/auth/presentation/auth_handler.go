package presentation

import (
	"backend-go/features/auth/application"
	authdomain "backend-go/features/auth/domain"
	userdomain "backend-go/features/users/domain"
	userpresentation "backend-go/features/users/presentation"
	"backend-go/shared/security"
	"errors"
	"time"

	"github.com/gofiber/fiber/v2"
)

// ======================================================================================
// AUTH HANDLER (PRESENTACIÓN - ANTI-FAT CONTROLLER) - V2
// CtrlAuth: register, login, logout, refresh
// V2: Soporta cookies HttpOnly y multi-device
// ======================================================================================

type AuthHandler struct {
	authService *application.AuthService
}

func NewAuthHandler(authService *application.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// Register maneja POST /auth/register
// @Summary Registrar nuevo usuario
// @Tags auth
// @Accept json
// @Produce json
// @Param request body RegisterRequest true "Datos de registro"
// @Success 201 {object} AuthResponse
// @Router /api/auth/register [post]
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Formato de petición inválido",
		})
	}

	// Convertir request a modelo de aplicación
	appReq := application.RegisterRequest{
		Email:    req.Email,
		Password: req.Password,
		FullName: req.FullName,
		Phone:    req.Phone,
	}

	// Ejecutar lógica de negocio
	result, err := h.authService.Register(appReq)
	if err != nil {
		return handleAuthError(c, err)
	}

	// Convertir a response DTO
	response := AuthResponse{
		User:        userpresentation.ToUserResponse(result.User),
		AccessToken: result.AccessToken,
	}

	return c.Status(fiber.StatusCreated).JSON(response)
}

// Login maneja POST /auth/login (V2)
// @Summary Iniciar sesión
// @Tags auth
// @Accept json
// @Produce json
// @Param request body LoginRequest true "Credenciales"
// @Success 200 {object} AuthResponse
// @Router /api/auth/login [post]
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Formato de petición inválido",
		})
	}

	// Convertir request a modelo de aplicación
	appReq := application.LoginRequest{
		Email:    req.Email,
		Password: req.Password,
		DeviceID: req.DeviceID, // V2: DeviceID opcional
	}

	// Ejecutar lógica de negocio
	result, err := h.authService.Login(appReq)
	if err != nil {
		return handleAuthError(c, err)
	}

	// V2: Si el usuario tiene refresh token, enviarlo en cookie HttpOnly
	if result.RefreshToken != "" {
		cookie := &fiber.Cookie{
			Name:     "refreshToken",
			Value:    result.RefreshToken,
			Path:     "/",
			HTTPOnly: true,
			Secure:   true, // Solo HTTPS en producción
			SameSite: "Strict",
			MaxAge:   int(30 * 24 * 60 * 60), // 30 días en segundos
		}
		c.Cookie(cookie)
	}

	// Convertir a response DTO
	response := AuthResponse{
		User:        userpresentation.ToUserResponse(result.User),
		AccessToken: result.AccessToken,
		DeviceID:    result.DeviceID, // V2: Retornar DeviceID
	}

	return c.JSON(response)
}

// RefreshToken maneja POST /auth/refresh (V2 - Rotación)
// @Summary Renovar tokens
// @Tags auth
// @Produce json
// @Success 200 {object} RefreshResponse
// @Router /api/auth/refresh [post]
func (h *AuthHandler) RefreshToken(c *fiber.Ctx) error {
	// Leer refresh token de la cookie
	refreshToken := c.Cookies("refreshToken")
	if refreshToken == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Refresh token no proporcionado",
		})
	}

	// Ejecutar lógica de refresh (rotación V2)
	result, err := h.authService.Refresh(application.RefreshRequest{
		RefreshToken: refreshToken,
	})
	if err != nil {
		// Limpiar cookie si hay error
		clearRefreshCookie(c)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Actualizar cookie con el nuevo refresh token
	cookie := &fiber.Cookie{
		Name:     "refreshToken",
		Value:    result.RefreshToken,
		Path:     "/",
		HTTPOnly: true,
		Secure:   true,
		SameSite: "Strict",
		MaxAge:   int(30 * 24 * 60 * 60), // 30 días
	}
	c.Cookie(cookie)

	// Retornar nuevo access token
	return c.JSON(fiber.Map{
		"accessToken": result.AccessToken,
	})
}

// Logout maneja POST /auth/logout (V2 - Revoca sesión)
// @Summary Cerrar sesión
// @Tags auth
// @Accept json
// @Success 200 {object} fiber.Map
// @Router /api/auth/logout [post]
func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	var req LogoutRequest
	if err := c.BodyParser(&req); err != nil {
		// Si no viene deviceID en el body, intentar leerlo del token
		req.DeviceID = ""
	}

	// V2: Revocar sesión en BD
	if req.DeviceID != "" {
		if err := h.authService.Logout(req.DeviceID); err != nil {
			// No retornar error, seguir con limpieza de cookie
		}
	}

	// Limpiar cookie
	clearRefreshCookie(c)

	return c.JSON(fiber.Map{
		"message": "Sesión cerrada exitosamente",
	})
}

// LogoutAllDevices maneja POST /auth/logout-all (V2 - Logout Global)
// @Summary Cerrar todas las sesiones
// @Tags auth
// @Security BearerAuth
// @Success 200 {object} fiber.Map
// @Router /api/auth/logout-all [post]
func (h *AuthHandler) LogoutAllDevices(c *fiber.Ctx) error {
	// Extraer token del header
	token := extractToken(c)
	if token == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Token no proporcionado",
		})
	}

	// Obtener usuario actual
	user, err := h.authService.GetCurrentUser(token)
	if err != nil {
		return handleAuthError(c, err)
	}

	// Logout global
	if err := h.authService.LogoutAllDevices(user.ID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error cerrando sesiones",
		})
	}

	// Limpiar cookie
	clearRefreshCookie(c)

	return c.JSON(fiber.Map{
		"message": "Todas las sesiones cerradas",
	})
}

// GetMe maneja GET /auth/me
// @Summary Obtener usuario actual
// @Tags auth
// @Security BearerAuth
// @Produce json
// @Success 200 {object} userpresentation.UserResponse
// @Router /api/auth/me [get]
func (h *AuthHandler) GetMe(c *fiber.Ctx) error {
	// Extraer token del header
	token := extractToken(c)
	if token == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Token no proporcionado",
		})
	}

	// 🧠 Paso 6: ¿Usuario sigue existiendo?
	user, err := h.authService.GetCurrentUser(token)
	if err != nil {
		return handleAuthError(c, err)
	}

	return c.JSON(userpresentation.ToUserResponse(user))
}

// ======================================================================================
// UTILIDADES
// ======================================================================================

// clearRefreshCookie limpia la cookie de refresh token
func clearRefreshCookie(c *fiber.Ctx) {
	c.Cookie(&fiber.Cookie{
		Name:     "refreshToken",
		Value:    "",
		Path:     "/",
		HTTPOnly: true,
		Secure:   true,
		SameSite: "Strict",
		MaxAge:   -1,
		Expires:  time.Now().Add(-1 * time.Hour),
	})
}

// handleAuthError maneja errores de dominio y los convierte a respuestas HTTP
// Exceptions personalizadas para usar con SweetAlert en frontend
func handleAuthError(c *fiber.Ctx, err error) error {
	switch {
	case errors.Is(err, userdomain.ErrUserAlreadyExists):
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Ya existe un usuario con ese email",
		})
	case errors.Is(err, authdomain.ErrInvalidEmail):
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Formato de email inválido",
		})
	case errors.Is(err, authdomain.ErrInvalidPassword):
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "La contraseña debe tener al menos 8 caracteres",
		})
	case errors.Is(err, authdomain.ErrInvalidCredentials):
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Credenciales inválidas",
		})
	case errors.Is(err, userdomain.ErrUserInactive):
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Cuenta inactiva",
		})
	case errors.Is(err, userdomain.ErrUserNotFound):
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Usuario no encontrado",
		})
	case errors.Is(err, security.ErrTokenExpired):
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Token expirado",
		})
	case errors.Is(err, security.ErrInvalidToken):
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Token inválido",
		})
	default:
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error interno del servidor",
		})
	}
}

// extractToken extrae el token JWT del header Authorization
// 🧠 Paso 1: ¿Existe token?
// 🧠 Paso 2: ¿Formato correcto? (Bearer xxx.yyy.zzz)
func extractToken(c *fiber.Ctx) string {
	auth := c.Get("Authorization")
	if len(auth) < 7 || auth[:7] != "Bearer " {
		return ""
	}
	return auth[7:]
}
