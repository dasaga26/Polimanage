package pagination

// PaginationParams representa los parámetros de paginación y filtrado
type PaginationParams struct {
	Page     int    `query:"page"`
	Limit    int    `query:"limit"`
	Search   string `query:"search"`
	Sort     string `query:"sort"`
	Status   string `query:"status"`
	RoleID   int    `query:"roleId"`
	MinPrice int    `query:"min_price"`
	MaxPrice int    `query:"max_price"`
	Deporte  string `query:"deporte"`
}

// PaginationMeta representa los metadatos de paginación
type PaginationMeta struct {
	TotalItems       int64    `json:"totalItems"`
	TotalPages       int      `json:"totalPages"`
	CurrentPage      int      `json:"currentPage"`
	ItemsPerPage     int      `json:"itemsPerPage"`
	MaxPriceLimit    *int     `json:"maxPriceLimit,omitempty"`    // Para filtros de precio (céntimos)
	MaxPriceLimitEur *float64 `json:"maxPriceLimitEur,omitempty"` // Para filtros de precio (euros)
}

// PaginatedResponse es el formato de respuesta paginada genérica
type PaginatedResponse struct {
	Data interface{}     `json:"data"`
	Meta *PaginationMeta `json:"meta"`
}

// NewPaginationParams crea parámetros con valores por defecto
func NewPaginationParams() PaginationParams {
	return PaginationParams{
		Page:  1,
		Limit: 10,
	}
}

// Validate valida y normaliza los parámetros de paginación
func (p *PaginationParams) Validate() {
	// Página mínima 1
	if p.Page < 1 {
		p.Page = 1
	}

	// Límite entre 1 y 100
	if p.Limit < 1 {
		p.Limit = 10
	}
	if p.Limit > 100 {
		p.Limit = 100
	}
}

// GetOffset calcula el offset para la query SQL
func (p *PaginationParams) GetOffset() int {
	return (p.Page - 1) * p.Limit
}

// NewPaginationMeta crea metadatos de paginación
func NewPaginationMeta(totalItems int64, page, limit int) *PaginationMeta {
	totalPages := int(totalItems) / limit
	if int(totalItems)%limit != 0 {
		totalPages++
	}

	return &PaginationMeta{
		TotalItems:   totalItems,
		TotalPages:   totalPages,
		CurrentPage:  page,
		ItemsPerPage: limit,
	}
}

// NewPaginatedResponse crea una respuesta paginada
func NewPaginatedResponse(data interface{}, meta *PaginationMeta) *PaginatedResponse {
	return &PaginatedResponse{
		Data: data,
		Meta: meta,
	}
}
