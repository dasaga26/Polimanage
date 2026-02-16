package presentation

import (
	"backend-go/features/pista/application"
	"backend-go/features/pista/domain"
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
// @Param q query string false "Búsqueda por nombre o ubicación"
// @Param deporte query string false "Filtro por tipo de deporte (FUTBOL, TENIS, BALONCESTO, PADEL, POLIDEPORTIVA)"
// @Param min_price query int false "Precio mínimo por hora (en euros)"
// @Param max_price query int false "Precio máximo por hora (en euros)"
// @Param sort query string false "Ordenación: precio_asc, precio_desc, nombre_asc, nombre_desc" default(id_desc)
// @Param page query int false "Número de página" default(1)
// @Param limit query int false "Items por página" default(12)
// @Success 200 {object} PistaPagedResponse
// @Router /api/pistas [get]
func (h *PistaHandler) GetAll(c *fiber.Ctx) error {
	// Parsear query params
	var params PistaQueryParams
	if err := c.QueryParser(&params); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Parámetros de búsqueda inválidos",
		})
	}

	// Aplicar defaults
	if params.Page < 1 {
		params.Page = 1
	}
	if params.Limit < 1 {
		params.Limit = 12
	}

	// Convertir a domain params
	domainParams := domain.PistaQueryParams{
		Q:        params.Q,
		Deporte:  params.Deporte,
		MinPrice: params.MinPrice,
		MaxPrice: params.MaxPrice,
		Sort:     params.Sort,
		Page:     params.Page,
		Limit:    params.Limit,
	}

	// Llamar al servicio con búsqueda avanzada
	domainResponse, err := h.service.GetAllAdvanced(domainParams)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error al obtener las pistas",
		})
	}

	// Convertir domain response a presentation response
	items := make([]PistaResponse, len(domainResponse.Items))
	for i := range domainResponse.Items {
		items[i] = ToPistaResponse(&domainResponse.Items[i])
	}

	response := PistaPagedResponse{
		Items:      items,
		Total:      domainResponse.Total,
		Page:       domainResponse.Page,
		TotalPages: domainResponse.TotalPages,
		Limit:      domainResponse.Limit,
	}

	return c.JSON(response)
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
