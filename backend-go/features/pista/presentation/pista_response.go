package presentation

import "backend-go/features/pista/domain"

// PistaResponse - Response serializer para una pista
type PistaResponse struct {
	ID             int     `json:"id"`
	Nombre         string  `json:"nombre"`
	Tipo           string  `json:"tipo"`
	Superficie     *string `json:"superficie"`
	ImageURL       *string `json:"imageUrl"`
	PrecioHoraBase float64 `json:"precioHoraBase"`
	EsActiva       bool    `json:"esActiva"`
	Estado         string  `json:"estado"`
}

type PistaPagedResponse struct {
	Items      []PistaResponse `json:"items"`       // Tus DTOs de pista normales
	Total      int64           `json:"total"`       // Total de resultados en BD
	Page       int             `json:"page"`        // Página actual
	TotalPages int             `json:"total_pages"` // Total de páginas
	Limit      int             `json:"limit"`       // Items por página
}

// ToPistaResponse convierte una entidad de dominio a response
func ToPistaResponse(pista *domain.Pista) PistaResponse {
	return PistaResponse{
		ID:             pista.ID,
		Nombre:         pista.Nombre,
		Tipo:           pista.Tipo,
		Superficie:     pista.Superficie,
		ImageURL:       pista.ImageURL,
		PrecioHoraBase: pista.PrecioHoraBase,
		EsActiva:       pista.EsActiva,
		Estado:         pista.Estado,
	}
}
