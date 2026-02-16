package domain

import (
	"time"

	"github.com/google/uuid"
)

// Booking representa una reserva en el dominio (entidad pura)
type Booking struct {
	ID                 int
	UserID             uuid.UUID
	PistaID            int
	StartTime          time.Time
	EndTime            time.Time
	PriceSnapshotCents int
	Status             string
	PaymentStatus      string
	Notes              *string
	CreatedAt          time.Time
	UpdatedAt          time.Time

	// Relaciones expandidas (solo para lectura)
	UserName  string
	PistaName string
	PistaType string
}

// Estados de la reserva
const (
	StatusPending   = "PENDING"
	StatusConfirmed = "CONFIRMED"
	StatusCancelled = "CANCELLED"
	StatusCompleted = "COMPLETED"
)

// Estados de pago
const (
	PaymentStatusUnpaid = "UNPAID"
	PaymentStatusPaid   = "PAID"
)

// Horarios de apertura (hardcodeados según MVP)
const (
	OpeningHour = 9  // 09:00
	ClosingHour = 23 // 23:00
)
