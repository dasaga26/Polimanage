package infrastructure

import (
	"backend-go/features/bookings/domain"
	"backend-go/shared/database"

	"github.com/google/uuid"
)

// ToEntity convierte un modelo de GORM a una entidad de dominio
func ToEntity(model *database.Booking) *domain.Booking {
	booking := &domain.Booking{
		ID:                 int(model.ID),
		UserID:             model.UserID,
		PistaID:            int(model.PistaID),
		StartTime:          model.StartTime,
		EndTime:            model.EndTime,
		PriceSnapshotCents: model.PriceSnapshotCents,
		Status:             model.Status,
		PaymentStatus:      model.PaymentStatus,
		Notes:              model.Notes,
		CreatedAt:          model.CreatedAt,
		UpdatedAt:          model.UpdatedAt,
	}

	// Cargar relaciones expandidas si están disponibles
	if model.User.ID != (uuid.UUID{}) {
		booking.UserName = model.User.FullName
	}
	if model.Pista.ID != 0 {
		booking.PistaName = model.Pista.Name
		booking.PistaType = model.Pista.Type
	}

	return booking
}

// FromEntity convierte una entidad de dominio a un modelo de GORM
func FromEntity(booking *domain.Booking) *database.Booking {
	model := &database.Booking{
		UserID:             booking.UserID,
		PistaID:            uint(booking.PistaID),
		StartTime:          booking.StartTime,
		EndTime:            booking.EndTime,
		PriceSnapshotCents: booking.PriceSnapshotCents,
		Status:             booking.Status,
		PaymentStatus:      booking.PaymentStatus,
		Notes:              booking.Notes,
	}

	if booking.ID != 0 {
		model.ID = uint(booking.ID)
	}

	return model
}
