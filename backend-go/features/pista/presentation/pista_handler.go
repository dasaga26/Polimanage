package presentation

import (
	"backend-go/features/pista/application"
	"backend-go/features/pista/domain"
	"backend-go/shared/pagination"
	"errors"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// PistaHandler maneja las peticiones HTTP para pistas
type PistaHandler struct {
	service *application.PistaService
}

// NewPistaHandler crea una nueva instancia del handler
func NewPistaHandler(service *application.PistaService) *PistaHandler {
	return &PistaHandler{service: service}
}

// GetAll maneja GET /api/pistas con búsqueda, filtros, ordenación y paginación
// @Summary Listar pistas con filtros avanzados
// @Tags pistas
// @Produce json
// @Param search query string false "Búsqueda por nombre o ubicación"
// @Param deporte query string false "Filtro por tipo de deporte (FUTBOL, TENIS, BALONCESTO, PADEL, POLIDEPORTIVA)"
// @Param min_price query int false "Precio mínimo por hora (en céntimos)"
// @Param max_price query int false "Precio máximo por hora (en céntimos)"
// @Param sort query string false "Ordenación: precio_asc, precio_desc, nombre_asc, nombre_desc" default(id_desc)
// @Param page query int false "Número de página" default(1)
// @Param limit query int false "Items por página" default(6)
// @Success 200 {object} pagination.PaginatedResponse
// @Router /api/pistas [get]
func (h *PistaHandler) GetAll(c *fiber.Ctx) error {
	// Parsear query params usando la estructura compartida
	var params pagination.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Parámetros de búsqueda inválidos",
		})
	}

	// Aplicar defaults si no se especifican
	if params.Page < 1 {
		params.Page = 1
	}
	if params.Limit < 1 {
		params.Limit = 6
	}

	// Llamar al servicio con paginación
	response, err := h.service.GetAllPaginated(params)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error al obtener las pistas",
		})
	}

	// Convertir domain entities a presentation DTOs
	pistasData := response.Data.([]domain.Pista)
	pistasResponse := make([]PistaResponse, len(pistasData))
	for i := range pistasData {
		pistasResponse[i] = ToPistaResponse(&pistasData[i])
	}

	// Devolver respuesta paginada con DTOs
	return c.JSON(pagination.PaginatedResponse{
		Data: pistasResponse,
		Meta: response.Meta,
	})
}

// GetByID maneja GET /api/pistas/:id
// @Summary Obtener pista por ID
// @Tags pistas
// @Produce json
// @Param id path int true "ID de la pista"
// @Success 200 {object} PistaResponse
// @Router /api/pistas/{id} [get]
func (h *PistaHandler) GetByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ID inválido",
		})
	}

	pista, err := h.service.GetByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Pista no encontrada",
		})
	}

	return c.JSON(ToPistaResponse(pista))
}

// Create maneja POST /api/pistas
// @Summary Crear una nueva pista
// @Tags pistas
// @Accept json
// @Produce json
// @Param pista body CreatePistaRequest true "Datos de la pista"
// @Success 201 {object} PistaResponse
// @Router /api/pistas [post]
func (h *PistaHandler) Create(c *fiber.Ctx) error {
	var req CreatePistaRequest

	// Parsear body
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Datos inválidos",
		})
	}

	// TODO: Validar con validator

	// Mapear a entidad de dominio
	pista := RequestToDomain(&req)

	// Llamar al servicio
	created, err := h.service.Create(pista)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(ToPistaResponse(created))
}

// Update maneja PUT /api/pistas/:id
// @Summary Actualizar una pista
// @Tags pistas
// @Accept json
// @Produce json
// @Param id path int true "ID de la pista"
// @Param pista body UpdatePistaRequest true "Datos a actualizar"
// @Success 200 {object} PistaResponse
// @Router /api/pistas/{id} [put]
func (h *PistaHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ID inválido",
		})
	}

	var req UpdatePistaRequest

	// Parsear body
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Datos inválidos",
		})
	}

	// TODO: Validar con validator

	// Mapear a entidad de dominio
	pista := UpdateRequestToDomain(&req)

	// Llamar al servicio
	updated, err := h.service.Update(id, pista)
	if err != nil {
		if errors.Is(err, domain.ErrPistaNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(ToPistaResponse(updated))
}

// Delete maneja DELETE /api/pistas/:id
// @Summary Eliminar una pista
// @Tags pistas
// @Param id path int true "ID de la pista"
// @Success 204
// @Router /api/pistas/{id} [delete]
func (h *PistaHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ID inválido",
		})
	}

	err = h.service.Delete(id)
	if err != nil {
		if errors.Is(err, domain.ErrPistaNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusNoContent).Send(nil)
}
