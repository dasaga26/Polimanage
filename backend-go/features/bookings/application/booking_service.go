package application

import (
	"backend-go/features/bookings/domain"
	"backend-go/shared/database"
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type BookingService struct {
	repo domain.BookingRepository
	db   *gorm.DB
}

func NewBookingService(repo domain.BookingRepository, db *gorm.DB) *BookingService {
	return &BookingService{
		repo: repo,
		db:   db,
	}
}

// GetAllBookings obtiene todas las reservas
func (s *BookingService) GetAllBookings() ([]domain.Booking, error) {
	return s.repo.FindAll()
}

// GetBookingByID obtiene una reserva por ID
func (s *BookingService) GetBookingByID(id int) (*domain.Booking, error) {
	return s.repo.FindByID(id)
}

// GetBookingsByPistaAndDate obtiene reservas de una pista en un día específico
func (s *BookingService) GetBookingsByPistaAndDate(pistaID int, date time.Time) ([]domain.Booking, error) {
	return s.repo.FindByPistaAndDate(pistaID, date)
}

// CreateBooking crea una nueva reserva con validaciones de negocio
func (s *BookingService) CreateBooking(booking *domain.Booking) error {
	// VALIDACIÓN 1: Horario comercial (09:00 - 23:00)
	if err := s.validateBusinessHours(booking.StartTime, booking.EndTime); err != nil {
		return err
	}

	// VALIDACIÓN 2: Duración mínima y máxima
	duration := booking.EndTime.Sub(booking.StartTime)
	if duration < 1*time.Hour {
		return fmt.Errorf("la duración mínima de una reserva es 1 hora (duración actual: %.0f minutos)", duration.Minutes())
	}
	if duration > 3*time.Hour {
		return fmt.Errorf("la duración máxima de una reserva es 3 horas (duración solicitada: %.0f horas)", duration.Hours())
	}

	// VALIDACIÓN 3: Fecha no puede ser en el pasado
	now := time.Now()
	if booking.StartTime.Before(now) {
		return fmt.Errorf("no se pueden crear reservas en el pasado (fecha solicitada: %s)", booking.StartTime.Format("02/01/2006 15:04"))
	}

	// VALIDACIÓN 4: Verificar solapamiento (solo en la misma pista)
	hasOverlap, err := s.repo.CheckOverlap(booking.PistaID, booking.StartTime, booking.EndTime, nil)
	if err != nil {
		return fmt.Errorf("error al verificar disponibilidad: %w", err)
	}
	if hasOverlap {
		return fmt.Errorf("la pista ya está reservada en ese horario (%s - %s)",
			booking.StartTime.Format("15:04"), booking.EndTime.Format("15:04"))
	}

	// CALCULAR PRECIO: Obtener precio base de la pista
	pistaPrice, err := s.getPistaBasePrice(booking.PistaID)
	if err != nil {
		return fmt.Errorf("error al obtener precio de pista: %w", err)
	}
	booking.PriceSnapshotCents = pistaPrice

	// Valores por defecto
	if booking.Status == "" {
		booking.Status = domain.StatusPending
	}
	if booking.PaymentStatus == "" {
		booking.PaymentStatus = domain.PaymentStatusUnpaid
	}

	return s.repo.Create(booking)
}

// UpdateBooking actualiza una reserva existente
func (s *BookingService) UpdateBooking(booking *domain.Booking) error {
	// Validar horario comercial
	if err := s.validateBusinessHours(booking.StartTime, booking.EndTime); err != nil {
		return err
	}

	// Verificar solapamiento excluyendo la reserva actual (solo en la misma pista)
	hasOverlap, err := s.repo.CheckOverlap(booking.PistaID, booking.StartTime, booking.EndTime, &booking.ID)
	if err != nil {
		return fmt.Errorf("error al verificar solapamiento: %w", err)
	}
	if hasOverlap {
		return fmt.Errorf("ya existe una reserva activa en ese horario para la pista ID %d", booking.PistaID)
	}

	return s.repo.Update(booking)
}

// DeleteBooking elimina una reserva (soft delete)
func (s *BookingService) DeleteBooking(id int) error {
	return s.repo.Delete(id)
}

// CancelBooking cancela una reserva
func (s *BookingService) CancelBooking(id int) error {
	booking, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	booking.Status = domain.StatusCancelled
	return s.repo.Update(booking)
}

// validateBusinessHours valida que la reserva esté dentro del horario comercial (09:00 - 23:00)
func (s *BookingService) validateBusinessHours(startTime, endTime time.Time) error {
	startHour := startTime.Hour()
	endHour := endTime.Hour()
	endMinute := endTime.Minute()

	// Validar hora de inicio
	if startHour < domain.OpeningHour {
		return fmt.Errorf("la hora de inicio no puede ser antes de las %02d:00", domain.OpeningHour)
	}

	// Validar hora de fin (permitir exactamente las 23:00 o antes)
	if endHour > domain.ClosingHour || (endHour == domain.ClosingHour && endMinute > 0) {
		return fmt.Errorf("la hora de fin no puede ser después de las %02d:00", domain.ClosingHour)
	}

	// Validar que end > start
	if !endTime.After(startTime) {
		return errors.New("la hora de fin debe ser posterior a la hora de inicio")
	}

	return nil
}

// AutoUpdateBookingStatuses actualiza automáticamente los estados de las reservas según reglas de negocio
func (s *BookingService) AutoUpdateBookingStatuses() (int, error) {
	now := time.Now()
	updatedCount := 0

	// 1. Completar reservas CONFIRMADAS que ya finalizaron
	confirmedBookings, err := s.repo.FindConfirmedBookingsEndedBefore(now)
	if err != nil {
		return 0, fmt.Errorf("error al buscar reservas confirmadas finalizadas: %w", err)
	}

	for _, booking := range confirmedBookings {
		if err := s.repo.UpdateStatus(booking.ID, domain.StatusCompleted); err != nil {
			return updatedCount, fmt.Errorf("error al completar reserva %d: %w", booking.ID, err)
		}
		updatedCount++
	}

	// 2. Cancelar reservas PENDIENTES cuya hora de inicio ya pasó
	// (Asumimos que si no pagaron antes de que empiece, se cancela automáticamente)
	pendingBookings, err := s.repo.FindPendingBookingsStartedBefore(now)
	if err != nil {
		return updatedCount, fmt.Errorf("error al buscar reservas pendientes expiradas: %w", err)
	}

	for _, booking := range pendingBookings {
		if err := s.repo.UpdateStatus(booking.ID, domain.StatusCancelled); err != nil {
			return updatedCount, fmt.Errorf("error al cancelar reserva pendiente %d: %w", booking.ID, err)
		}
		updatedCount++
	}

	return updatedCount, nil
}

// getPistaBasePrice obtiene el precio base de una pista desde la BD
func (s *BookingService) getPistaBasePrice(pistaID int) (int, error) {
	var pista database.Pista
	if err := s.db.First(&pista, pistaID).Error; err != nil {
		return 0, fmt.Errorf("pista no encontrada: %w", err)
	}

	if !pista.IsActive {
		return 0, errors.New("la pista no está activa")
	}

	return pista.BasePriceCents, nil
}
