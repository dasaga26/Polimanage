package presentation

import "time"

// BookingResponse DTO para retornar información de una reserva
type BookingResponse struct {
	ID                 int       `json:"id"`
	UserID             string    `json:"userId"` // UUID como string
	UserName           string    `json:"userName"`
	PistaID            int       `json:"pistaId"`
	PistaName          string    `json:"pistaName"`
	PistaType          string    `json:"pistaType"`
	StartTime          time.Time `json:"startTime"`
	EndTime            time.Time `json:"endTime"`
	PriceSnapshotCents int       `json:"priceSnapshotCents"`
	PriceSnapshotEuros float64   `json:"priceSnapshotEuros"` // Convertido a euros para UI
	Status             string    `json:"status"`
	PaymentStatus      string    `json:"paymentStatus"`
	Notes              *string   `json:"notes"`
	CreatedAt          time.Time `json:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt"`
}
