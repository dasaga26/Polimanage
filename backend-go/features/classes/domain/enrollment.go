package domain

import (
	"time"

	"github.com/google/uuid"
)

// Enrollment representa la inscripción de un usuario a una clase
type Enrollment struct {
	ID           int
	ClassID      int
	UserID       uuid.UUID
	Status       string
	RegisteredAt time.Time

	// Relaciones expandidas
	UserName   string
	UserEmail  string
	ClassName  string
	ClassTitle string
	ClassSlug  string
	UserSlug   string
}

// Estados de inscripción
const (
	EnrollmentStatusConfirmed = "CONFIRMED"
	EnrollmentStatusCancelled = "CANCELLED"
	EnrollmentStatusWaitlist  = "WAITLIST"
)

// EnrollmentRepository define el contrato de persistencia para inscripciones
type EnrollmentRepository interface {
	FindByID(id int) (*Enrollment, error)
	FindByClass(classID int) ([]Enrollment, error)
	FindByUser(userID uuid.UUID) ([]Enrollment, error)
	Create(enrollment *Enrollment) error
	Delete(id int) error
	CheckExists(classID int, userID uuid.UUID) (bool, error)
	Count(classID int) (int, error)
}
