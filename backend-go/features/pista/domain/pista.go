package domain

import "errors"

// Errores de dominio
var (
	ErrPistaNotFound   = errors.New("pista no encontrada")
	ErrInvalidID       = errors.New("ID inválido")
	ErrPistaDuplicated = errors.New("ya existe una pista con ese nombre o slug")
)

// Pista representa una pista deportiva en el dominio
type Pista struct {
	ID             int
	Nombre         string
	Tipo           string
	Superficie     *string
	ImageURL       *string
	PrecioHoraBase float64
	EsActiva       bool
	Estado         string
}

// PistaQueryParams representa los parámetros de búsqueda y filtrado
type PistaQueryParams struct {
	Q        string // Búsqueda texto (nombre o ubicación)
	Deporte  string // Filtro exacto (ej: "PADEL")
	MinPrice *int   // Precio mínimo (puntero para distinguir 0 de nil)
	MaxPrice *int   // Precio máximo
	Sort     string // Criterio de ordenación ("precio_asc", "precio_desc")
	Page     int    // Página actual (default 1)
	Limit    int    // Items por página (default 12)
}

// PistaPagedResponse representa una respuesta paginada de pistas
type PistaPagedResponse struct {
	Items      []Pista // Lista de pistas
	Total      int64   // Total de resultados en BD
	Page       int     // Página actual
	TotalPages int     // Total de páginas
	Limit      int     // Items por página
}
