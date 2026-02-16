package presentation

import (
	"backend-go/features/roles/application"

	"github.com/gofiber/fiber/v2"
)

type RoleHandler struct {
	service *application.RoleService
}

func NewRoleHandler(service *application.RoleService) *RoleHandler {
	return &RoleHandler{service: service}
}

// GetAllRoles maneja GET /roles
// @Summary Listar todos los roles
// @Tags roles
// @Produce json
// @Success 200 {array} RoleDTO
// @Router /api/roles [get]
func (h *RoleHandler) GetAllRoles(c *fiber.Ctx) error {
	roles, err := h.service.GetAllRoles()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error al obtener roles",
		})
	}

	roleDTOs := make([]RoleDTO, len(roles))
	for i, role := range roles {
		roleDTOs[i] = RoleDTO{
			ID:          role.ID,
			Name:        role.Name,
			Description: role.Description,
		}
	}

	return c.JSON(roleDTOs)
}
