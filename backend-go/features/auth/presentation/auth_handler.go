package presentation

import (
	"backend-go/features/auth/application"
	authdomain "backend-go/features/auth/domain"
	userdomain "backend-go/features/users/domain"
	userpresentation "backend-go/features/users/presentation"
	"backend-go/shared/security"
	"errors"

	"github.com/gofiber/fiber/v2"
)

// ======================================================================================
// AUTH HANDLER (PRESENTACIÓN - ANTI-FAT CONTROLLER)
// CtrlAuth: register, login, logout
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

	// Convertir a response DTO (serializer_user)
	response := AuthResponse{
		User:  userpresentation.ToUserResponse(result.User),
		Token: result.Token,
	}

	return c.Status(fiber.StatusCreated).JSON(response)
}

// Login maneja POST /auth/login
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
	}

	// Ejecutar lógica de negocio
	result, err := h.authService.Login(appReq)
	if err != nil {
		return handleAuthError(c, err)
	}

	// Convertir a response DTO (serializer_user)
	response := AuthResponse{
		User:  userpresentation.ToUserResponse(result.User),
		Token: result.Token,
	}

	return c.JSON(response)
}

// Logout maneja POST /auth/logout
// @Summary Cerrar sesión
// @Tags auth
// @Security BearerAuth
// @Success 200 {object} fiber.Map
// @Router /api/auth/logout [post]
func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	// En JWT stateless, el logout es del lado del cliente
	// El backend NO confía en el JWT, así que no necesita blacklist
	return c.JSON(fiber.Map{
		"message": "Sesión cerrada exitosamente",
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

// RefreshToken maneja POST /auth/refresh
// @Summary Renovar token
// @Tags auth
// @Security BearerAuth
// @Produce json
// @Success 200 {object} fiber.Map
// @Router /api/auth/refresh [post]
func (h *AuthHandler) RefreshToken(c *fiber.Ctx) error {
	// Extraer token del header
	oldToken := extractToken(c)
	if oldToken == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Token no proporcionado",
		})
	}

	// Renovar token
	newToken, err := h.authService.RefreshToken(oldToken)
	if err != nil {
		return handleAuthError(c, err)
	}

	return c.JSON(fiber.Map{
		"token": newToken,
	})
}

// ======================================================================================
// UTILIDADES
// ======================================================================================

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
