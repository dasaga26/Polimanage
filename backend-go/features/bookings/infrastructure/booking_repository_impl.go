package infrastructure

import (
	"backend-go/features/bookings/domain"
	"backend-go/shared/database"
	"errors"
	"strings"
	"time"

	"gorm.io/gorm"
)

type BookingRepositoryImpl struct {
	db *gorm.DB
}

func NewBookingRepository(db *gorm.DB) domain.BookingRepository {
	return &BookingRepositoryImpl{db: db}
}

// FindAll obtiene todas las reservas con relaciones
func (r *BookingRepositoryImpl) FindAll() ([]domain.Booking, error) {
	var models []database.Booking
	if err := r.db.Preload("User").Preload("Pista").Order("start_time DESC").Find(&models).Error; err != nil {
		return nil, err
	}

	bookings := make([]domain.Booking, len(models))
	for i, model := range models {
		bookings[i] = *ToEntity(&model)
	}

	return bookings, nil
}

// FindByID obtiene una reserva por ID
func (r *BookingRepositoryImpl) FindByID(id int) (*domain.Booking, error) {
	var model database.Booking
	if err := r.db.Preload("User").Preload("Pista").First(&model, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("reserva no encontrada")
		}
		return nil, err
	}

	return ToEntity(&model), nil
}

// FindByPistaAndDate obtiene reservas de una pista en un día específico
func (r *BookingRepositoryImpl) FindByPistaAndDate(pistaID int, date time.Time) ([]domain.Booking, error) {
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	var models []database.Booking
	if err := r.db.
		Preload("User").
		Preload("Pista").
		Where("pista_id = ? AND start_time >= ? AND start_time < ?", pistaID, startOfDay, endOfDay).
		Order("start_time ASC").
		Find(&models).Error; err != nil {
		return nil, err
	}

	bookings := make([]domain.Booking, len(models))
	for i, model := range models {
		bookings[i] = *ToEntity(&model)
	}

	return bookings, nil
}

// FindByPistaAndTimeRange obtiene reservas que se solapan con un rango horario
func (r *BookingRepositoryImpl) FindByPistaAndTimeRange(pistaID int, startTime, endTime time.Time) ([]domain.Booking, error) {
	var models []database.Booking
	if err := r.db.
		Preload("User").
		Preload("Pista").
		Where("pista_id = ?", pistaID).
		Where("status != ?", domain.StatusCancelled).
		Where("start_time < ? AND end_time > ?", endTime, startTime). // Overlap check
		Order("start_time ASC").
		Find(&models).Error; err != nil {
		return nil, err
	}

	bookings := make([]domain.Booking, len(models))
	for i, model := range models {
		bookings[i] = *ToEntity(&model)
	}

	return bookings, nil
}

// Create crea una nueva reserva
func (r *BookingRepositoryImpl) Create(booking *domain.Booking) error {
	model := FromEntity(booking)

	if err := r.db.Create(model).Error; err != nil {
		// Capturar error de constraint único (código 23505 de PostgreSQL)
		if strings.Contains(err.Error(), "idx_booking_overlap") || strings.Contains(err.Error(), "23505") {
			return errors.New("ya existe una reserva en ese horario para esta pista")
		}
		return err
	}

	booking.ID = int(model.ID)
	booking.CreatedAt = model.CreatedAt
	booking.UpdatedAt = model.UpdatedAt

	return nil
}

// Update actualiza una reserva
func (r *BookingRepositoryImpl) Update(booking *domain.Booking) error {
	model := FromEntity(booking)

	if err := r.db.Save(model).Error; err != nil {
		if strings.Contains(err.Error(), "idx_booking_overlap") || strings.Contains(err.Error(), "23505") {
			return errors.New("ya existe una reserva en ese horario para esta pista")
		}
		return err
	}

	booking.UpdatedAt = model.UpdatedAt
	return nil
}

// Delete elimina una reserva (soft delete)
func (r *BookingRepositoryImpl) Delete(id int) error {
	return r.db.Delete(&database.Booking{}, id).Error
}

// CheckOverlap verifica si hay solapamiento de horarios EN LA MISMA PISTA
func (r *BookingRepositoryImpl) CheckOverlap(pistaID int, startTime, endTime time.Time, excludeID *int) (bool, error) {
	query := r.db.Model(&database.Booking{}).
		Where("pista_id = ?", pistaID). // IMPORTANTE: Solo verifica solapamiento en esta pista específica
		Where("status != ?", domain.StatusCancelled).
		Where("start_time < ? AND end_time > ?", endTime, startTime)

	// Excluir la reserva actual si se proporciona un ID (para Updates)
	if excludeID != nil {
		query = query.Where("id != ?", *excludeID)
	}

	var count int64
	if err := query.Count(&count).Error; err != nil {
		return false, err
	}

	return count > 0, nil
}

// FindConfirmedBookingsEndedBefore obtiene reservas CONFIRMADAS que ya finalizaron
func (r *BookingRepositoryImpl) FindConfirmedBookingsEndedBefore(endTime time.Time) ([]domain.Booking, error) {
	var models []database.Booking
	if err := r.db.
		Where("status = ?", domain.StatusConfirmed).
		Where("end_time < ?", endTime).
		Find(&models).Error; err != nil {
		return nil, err
	}

	bookings := make([]domain.Booking, len(models))
	for i, model := range models {
		bookings[i] = *ToEntity(&model)
	}

	return bookings, nil
}

// FindPendingBookingsStartedBefore obtiene reservas PENDIENTES cuya hora de inicio ya pasó
func (r *BookingRepositoryImpl) FindPendingBookingsStartedBefore(startTime time.Time) ([]domain.Booking, error) {
	var models []database.Booking
	if err := r.db.
		Where("status = ?", domain.StatusPending).
		Where("start_time < ?", startTime).
		Find(&models).Error; err != nil {
		return nil, err
	}

	bookings := make([]domain.Booking, len(models))
	for i, model := range models {
		bookings[i] = *ToEntity(&model)
	}

	return bookings, nil
}

// UpdateStatus actualiza solo el estado de una reserva
func (r *BookingRepositoryImpl) UpdateStatus(id int, newStatus string) error {
	return r.db.Model(&database.Booking{}).
		Where("id = ?", id).
		Update("status", newStatus).
		Error
}
