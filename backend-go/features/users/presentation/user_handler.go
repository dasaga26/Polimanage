package presentation

import (
	"backend-go/features/users/application"
	"backend-go/features/users/domain"
	"backend-go/shared/pagination"
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
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
// @Param page query int false "Número de página"
// @Param limit query int false "Elementos por página"
// @Param search query string false "Búsqueda por nombre, email o teléfono"
// @Param status query string false "Filtrar por estado (active/inactive)"
// @Param sort query string false "Ordenación (nombre_asc, nombre_desc, email_asc, email_desc, recientes)"
// @Success 200 {object} pagination.PaginatedResponse
// @Router /api/users [get]
func (h *UserHandler) GetAll(c *fiber.Ctx) error {
	// Parsear parámetros de paginación
	var params pagination.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Parámetros inválidos"})
	}

	// Valores por defecto
	if params.Page < 1 {
		params.Page = 1
	}
	if params.Limit < 1 {
		params.Limit = 10
	}

	// Obtener usuarios paginados
	response, err := h.service.GetAllPaginated(params)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	// Serializar usuarios
	users := response.Data.([]domain.User)
	usersResponse := make([]UserResponse, len(users))
	for i := range users {
		usersResponse[i] = ToUserResponse(&users[i])
	}

	// Retornar respuesta paginada
	return c.JSON(pagination.PaginatedResponse{
		Data: usersResponse,
		Meta: response.Meta,
	})
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

// Create maneja POST /users (crear usuario)
// @Summary Crear un nuevo usuario
// @Tags users
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param user body CreateUserRequest true "Datos del usuario"
// @Success 201 {object} UserResponse
// @Router /api/users [post]
func (h *UserHandler) Create(c *fiber.Ctx) error {
	var req CreateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	// Mapear request a dominio
	user := RequestToDomain(&req)

	if err := h.service.Create(user); err != nil {
		if errors.Is(err, domain.ErrUserAlreadyExists) {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	// serializer_user
	return c.Status(fiber.StatusCreated).JSON(ToUserResponse(user))
}

// Delete maneja DELETE /users/:id (eliminar usuario)
// @Summary Eliminar un usuario
// @Tags users
// @Security BearerAuth
// @Param id path string true "ID del usuario"
// @Success 204
// @Router /api/users/{id} [delete]
func (h *UserHandler) Delete(c *fiber.Ctx) error {
	idParam := c.Params("id")
	if idParam == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID inválido"})
	}

	id, err := uuid.Parse(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID inválido"})
	}

	if err := h.service.Delete(id); err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.SendStatus(fiber.StatusNoContent)
}

// DeleteBySlug maneja DELETE /users/:slug (eliminar usuario por slug)
// @Summary Eliminar un usuario por slug
// @Tags users
// @Security BearerAuth
// @Param slug path string true "Slug del usuario"
// @Success 204
// @Router /api/users/{slug} [delete]
func (h *UserHandler) DeleteBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")
	if slug == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Slug inválido"})
	}

	// Obtener usuario por slug para conseguir el ID
	user, err := h.service.GetBySlug(slug)
	if err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	// Eliminar por ID
	if err := h.service.Delete(user.ID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
