package domain

import "time"

// BookingRepository define las operaciones de persistencia para reservas
type BookingRepository interface {
	FindAll() ([]Booking, error)
	FindByID(id int) (*Booking, error)
	FindByPistaAndDate(pistaID int, date time.Time) ([]Booking, error)
	FindByPistaAndTimeRange(pistaID int, startTime, endTime time.Time) ([]Booking, error)
	Create(booking *Booking) error
	Update(booking *Booking) error
	Delete(id int) error
	CheckOverlap(pistaID int, startTime, endTime time.Time, excludeID *int) (bool, error)

	// Métodos para actualización automática de estados
	FindConfirmedBookingsEndedBefore(endTime time.Time) ([]Booking, error)
	FindPendingBookingsStartedBefore(startTime time.Time) ([]Booking, error)
	UpdateStatus(id int, newStatus string) error
}
