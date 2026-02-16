package presentation

import (
	"backend-go/features/users/application"
	"backend-go/features/users/domain"
	"errors"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// ======================================================================================
// USER HANDLER (PRESENTACIÓN - ANTI-FAT CONTROLLER)
// CtrlUser: getUser, update
// ======================================================================================

type UserHandler struct {
	service *application.UserService
}

func NewUserHandler(service *application.UserService) *UserHandler {
	return &UserHandler{service: service}
}

// GetAll maneja GET /users
// @Summary Listar todos los usuarios
// @Tags users
// @Security BearerAuth
// @Produce json
// @Param role_id query int false "Filtrar por rol"
// @Success 200 {array} UserResponse
// @Router /api/users [get]
func (h *UserHandler) GetAll(c *fiber.Ctx) error {
	// Filtro opcional por role_id
	roleIDParam := c.Query("role_id")

	var users []domain.User
	var err error

	if roleIDParam != "" {
		roleID, parseErr := strconv.ParseUint(roleIDParam, 10, 32)
		if parseErr != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "role_id inválido"})
		}
		users, err = h.service.GetByRole(uint(roleID))
	} else {
		users, err = h.service.GetAll()
	}

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	// serializer_user
	response := make([]UserResponse, len(users))
	for i := range users {
		response[i] = ToUserResponse(&users[i])
	}

	return c.JSON(response)
}

// GetBySlug maneja GET /users/:slug (getUser)
// @Summary Obtener usuario por slug
// @Tags users
// @Produce json
// @Param slug path string true "Slug del usuario"
// @Success 200 {object} UserResponse
// @Router /api/users/{slug} [get]
func (h *UserHandler) GetBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")
	if slug == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Slug inválido"})
	}

	user, err := h.service.GetBySlug(slug)
	if err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	// serializer_user en CtrlUser - getUser
	return c.JSON(ToUserResponse(user))
}

// Update maneja PUT /users/:slug (update)
// @Summary Actualizar un usuario
// @Tags users
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param slug path string true "Slug del usuario"
// @Param user body UpdateUserRequest true "Datos a actualizar"
// @Success 200 {object} UserResponse
// @Router /api/users/{slug} [put]
func (h *UserHandler) Update(c *fiber.Ctx) error {
	slug := c.Params("slug")
	if slug == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Slug inválido"})
	}

	var req UpdateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	// Mapear request a dominio
	user := UpdateRequestToDomain(&req)

	if err := h.service.UpdateBySlug(slug, user); err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	// Obtener usuario actualizado para devolverlo completo
	updated, _ := h.service.GetBySlug(slug)

	// serializer_user
	return c.JSON(ToUserResponse(updated))
}
