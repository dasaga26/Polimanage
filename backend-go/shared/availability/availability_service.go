package availability

import (
	"backend-go/shared/database"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AvailabilityService struct {
	db *gorm.DB
}

func NewAvailabilityService(db *gorm.DB) *AvailabilityService {
	return &AvailabilityService{db: db}
}

// CheckPistaAvailable verifica que una pista esté disponible en un rango de tiempo
// excluyendo opcionalmente un booking o clase específica (para ediciones)
func (s *AvailabilityService) CheckPistaAvailable(
	pistaID int,
	startTime, endTime time.Time,
	excludeBookingID *int,
	excludeClassID *int,
) error {
	// Verificar conflictos con bookings
	var bookingCount int64
	bookingQuery := s.db.Model(&database.Booking{}).
		Where("pista_id = ?", pistaID).
		Where("status != ?", "CANCELLED").
		Where("deleted_at IS NULL").
		Where("NOT (end_time <= ? OR start_time >= ?)", startTime, endTime)

	if excludeBookingID != nil {
		bookingQuery = bookingQuery.Where("id != ?", *excludeBookingID)
	}

	if err := bookingQuery.Count(&bookingCount).Error; err != nil {
		return err
	}

	if bookingCount > 0 {
		return errors.New("la pista ya tiene una reserva en ese horario")
	}

	// Verificar conflictos con clases
	var classCount int64
	classQuery := s.db.Model(&database.Class{}).
		Where("pista_id = ?", pistaID).
		Where("status != ?", "CANCELLED").
		Where("deleted_at IS NULL").
		Where("NOT (end_time <= ? OR start_time >= ?)", startTime, endTime)

	if excludeClassID != nil {
		classQuery = classQuery.Where("id != ?", *excludeClassID)
	}

	if err := classQuery.Count(&classCount).Error; err != nil {
		return err
	}

	if classCount > 0 {
		return errors.New("la pista ya tiene una clase programada en ese horario")
	}

	return nil
}

// IsPistaAvailable es un wrapper más simple para verificar disponibilidad
func (s *AvailabilityService) IsPistaAvailable(
	pistaID int,
	startTime, endTime time.Time,
) (bool, error) {
	err := s.CheckPistaAvailable(pistaID, startTime, endTime, nil, nil)
	if err != nil {
		return false, err
	}
	return true, nil
}

// GetPistaConflicts devuelve los conflictos de una pista en un rango de tiempo
func (s *AvailabilityService) GetPistaConflicts(
	pistaID int,
	startTime, endTime time.Time,
) (bookings []database.Booking, classes []database.Class, err error) {
	// Obtener bookings conflictivos
	err = s.db.Where("pista_id = ?", pistaID).
		Where("status != ?", "CANCELLED").
		Where("deleted_at IS NULL").
		Where("NOT (end_time <= ? OR start_time >= ?)", startTime, endTime).
		Find(&bookings).Error
	if err != nil {
		return nil, nil, err
	}

	// Obtener clases conflictivas
	err = s.db.Where("pista_id = ?", pistaID).
		Where("status != ?", "CANCELLED").
		Where("deleted_at IS NULL").
		Where("NOT (end_time <= ? OR start_time >= ?)", startTime, endTime).
		Find(&classes).Error
	if err != nil {
		return nil, nil, err
	}

	return bookings, classes, nil
}

// GetUserBookingConflicts verifica si un usuario tiene conflictos de reservas
func (s *AvailabilityService) GetUserBookingConflicts(
	userID uuid.UUID,
	startTime, endTime time.Time,
	excludeBookingID *int,
) ([]database.Booking, error) {
	var bookings []database.Booking
	query := s.db.Where("user_id = ?", userID).
		Where("status != ?", "CANCELLED").
		Where("deleted_at IS NULL").
		Where("NOT (end_time <= ? OR start_time >= ?)", startTime, endTime)

	if excludeBookingID != nil {
		query = query.Where("id != ?", *excludeBookingID)
	}

	err := query.Find(&bookings).Error
	return bookings, err
}
