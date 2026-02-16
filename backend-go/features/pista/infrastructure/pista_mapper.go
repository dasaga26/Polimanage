package infrastructure

import (
	"backend-go/features/pista/domain"
	"backend-go/shared/database"
)

// ToEntity convierte database.Pista (GORM model) a domain.Pista
func ToEntity(m *database.Pista) *domain.Pista {
	var superficie *string
	if m.Surface != nil {
		superficie = m.Surface
	}

	// Convertir céntimos a euros para el dominio (si tu dominio usa euros)
	precioHora := float64(m.BasePriceCents) / 100.0

	return &domain.Pista{
		ID:             int(m.ID),
		Nombre:         m.Name,
		Tipo:           m.Type,
		Superficie:     superficie,
		ImageURL:       m.ImageURL,
		PrecioHoraBase: precioHora,
		EsActiva:       m.IsActive,
		Estado:         m.Status,
	}
}

// FromEntity convierte domain.Pista a database.Pista (GORM model)
func FromEntity(pista *domain.Pista) *database.Pista {
	// Convertir euros a céntimos para la BD
	precioCents := int(pista.PrecioHoraBase * 100)

	return &database.Pista{
		ID:             uint(pista.ID),
		Name:           pista.Nombre,
		Slug:           generateSlug(pista.Nombre),
		Type:           pista.Tipo,
		Surface:        pista.Superficie,
		ImageURL:       pista.ImageURL,
		IsActive:       pista.EsActiva,
		Status:         pista.Estado,
		BasePriceCents: precioCents,
	}
}

// generateSlug genera un slug simple a partir del nombre
func generateSlug(name string) string {
	// Implementación básica, puedes usar una librería como gosimple/slug
	// Por ahora retorna el nombre en minúsculas (mejorar después)
	return name
}
