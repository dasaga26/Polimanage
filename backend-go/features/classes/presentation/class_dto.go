package presentation

import "time"

// CreateClassRequest representa los datos para crear una clase
type CreateClassRequest struct {
	PistaID      int       `json:"pistaId" validate:"required"`
	InstructorID string    `json:"instructorId" validate:"required"` // UUID como string
	Title        string    `json:"title" validate:"required,min=3"`
	Description  *string   `json:"description"`
	StartTime    time.Time `json:"startTime" validate:"required"`
	EndTime      time.Time `json:"endTime" validate:"required"`
	MaxCapacity  int       `json:"maxCapacity" validate:"required,min=1,max=20"`
	PriceCents   int       `json:"priceCents" validate:"required,min=0"`
}

// UpdateClassRequest representa los datos para actualizar una clase
type UpdateClassRequest struct {
	PistaID      int       `json:"pistaId" validate:"required"`
	InstructorID string    `json:"instructorId" validate:"required"` // UUID como string
	Title        string    `json:"title" validate:"required,min=3"`
	Description  *string   `json:"description"`
	StartTime    time.Time `json:"startTime" validate:"required"`
	EndTime      time.Time `json:"endTime" validate:"required"`
	MaxCapacity  int       `json:"maxCapacity" validate:"required,min=1,max=20"`
	PriceCents   int       `json:"priceCents" validate:"required,min=0"`
	Status       string    `json:"status"`
}

// ClassResponse representa la respuesta de una clase
type ClassResponse struct {
	ID             int                  `json:"id"`
	Slug           string               `json:"slug"`
	PistaID        int                  `json:"pistaId"`
	PistaName      string               `json:"pistaName"`
	InstructorID   string               `json:"instructorId"` // UUID como string
	InstructorName string               `json:"instructorName"`
	Title          string               `json:"title"`
	Description    *string              `json:"description"`
	StartTime      time.Time            `json:"startTime"`
	EndTime        time.Time            `json:"endTime"`
	Capacity       int                  `json:"capacity"`
	PriceCents     int                  `json:"priceCents"`
	PriceEuros     float64              `json:"priceEuros"`
	Status         string               `json:"status"`
	EnrolledCount  int                  `json:"enrolledCount"`
	Enrollments    []EnrollmentResponse `json:"enrollments,omitempty"`
	CreatedAt      time.Time            `json:"createdAt"`
	UpdatedAt      time.Time            `json:"updatedAt"`
}
