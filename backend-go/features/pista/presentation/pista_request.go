package presentation

import "backend-go/features/pista/domain"

// CreatePistaRequest - Request para crear una pista (validator)
type CreatePistaRequest struct {
	Nombre         string  `json:"nombre" validate:"required,min=1,max=100"`
	Tipo           string  `json:"tipo" validate:"required,oneof=FUTBOL TENIS BALONCESTO PADEL POLIDEPORTIVA"`
	Superficie     *string `json:"superficie"`
	ImageURL       *string `json:"image_url"`
	PrecioHoraBase float64 `json:"precio_hora_base" validate:"required,min=0"`
}

// UpdatePistaRequest - Request para actualizar una pista (validator)
type UpdatePistaRequest struct {
	Nombre         string  `json:"nombre" validate:"required,min=1,max=100"`
	Tipo           string  `json:"tipo" validate:"required,oneof=FUTBOL TENIS BALONCESTO PADEL POLIDEPORTIVA"`
	Superficie     *string `json:"superficie"`
	ImageURL       *string `json:"image_url"`
	PrecioHoraBase float64 `json:"precio_hora_base" validate:"required,min=0"`
	EsActiva       bool    `json:"es_activa"`
	Estado         string  `json:"estado" validate:"required,oneof=DISPONIBLE MANTENIMIENTO INACTIVA"`
}

type PistaQueryParams struct {
	Q        string `query:"q"`         // Buscador (Search)
	Deporte  string `query:"deporte"`   // Filtro exacto (PADEL, TENIS...)
	MinPrice *int   `query:"min_price"` // Precio mínimo
	MaxPrice *int   `query:"max_price"` // Precio máximo
	Sort     string `query:"sort"`      // precio_asc, precio_desc
	Page     int    `query:"page"`      // Paginación
	Limit    int    `query:"limit"`     // Paginación
}

// RequestToDomain convierte CreatePistaRequest a domain.Pista
func RequestToDomain(req *CreatePistaRequest) *domain.Pista {
	return &domain.Pista{
		Nombre:         req.Nombre,
		Tipo:           req.Tipo,
		Superficie:     req.Superficie,
		ImageURL:       req.ImageURL,
		PrecioHoraBase: req.PrecioHoraBase,
	}
}

// UpdateRequestToDomain convierte UpdatePistaRequest a domain.Pista
func UpdateRequestToDomain(req *UpdatePistaRequest) *domain.Pista {
	return &domain.Pista{
		Nombre:         req.Nombre,
		Tipo:           req.Tipo,
		Superficie:     req.Superficie,
		ImageURL:       req.ImageURL,
		PrecioHoraBase: req.PrecioHoraBase,
		EsActiva:       req.EsActiva,
		Estado:         req.Estado,
	}
}
