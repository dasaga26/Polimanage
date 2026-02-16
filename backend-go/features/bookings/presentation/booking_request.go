package presentation

import "time"

// CreateBookingRequest DTO para crear una reserva
type CreateBookingRequest struct {
	UserID    string    `json:"userId"` // UUID como string
	PistaID   int       `json:"pistaId" validate:"required,min=1"`
	StartTime time.Time `json:"startTime" validate:"required"`
	EndTime   time.Time `json:"endTime" validate:"required"`
	Notes     *string   `json:"notes"`
}

// UpdateBookingRequest DTO para actualizar una reserva
type UpdateBookingRequest struct {
	UserID        string    `json:"userId"` // UUID como string
	PistaID       int       `json:"pistaId" validate:"required,min=1"`
	StartTime     time.Time `json:"startTime" validate:"required"`
	EndTime       time.Time `json:"endTime" validate:"required"`
	Status        string    `json:"status"`
	PaymentStatus string    `json:"paymentStatus"`
	Notes         *string   `json:"notes"`
}
