package domain

import (
	"backend-go/shared/pagination"
	"time"

	"github.com/google/uuid"
)

// Class representa una clase grupal en el dominio
type Class struct {
	ID           int
	Slug         string
	PistaID      int
	InstructorID uuid.UUID
	Title        string
	Description  *string
	StartTime    time.Time
	EndTime      time.Time
	MaxCapacity  int
	PriceCents   int
	Status       string
	CreatedAt    time.Time
	UpdatedAt    time.Time

	// Relaciones expandidas (solo para lectura)
	PistaName      string
	InstructorName string
	EnrolledCount  int               // Contador de inscritos
	Enrollments    []ClassEnrollment // Lista de inscripciones
}

// ClassEnrollment representa la inscripción de un usuario a una clase
type ClassEnrollment struct {
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
}

// Estados de la clase
const (
	ClassStatusOpen       = "OPEN"
	ClassStatusInProgress = "IN_PROGRESS"
	ClassStatusCompleted  = "COMPLETED"
	ClassStatusCancelled  = "CANCELLED"
)

// ClassRepository define el contrato de persistencia para clases
type ClassRepository interface {
	FindAll() ([]Class, error)
	FindByID(id int) (*Class, error)
	FindBySlug(slug string) (*Class, error)
	FindByInstructor(instructorID int) ([]Class, error)
	FindByPistaAndTimeRange(pistaID int, startTime, endTime time.Time) ([]Class, error)
	FindAllPaginated(params pagination.PaginationParams) ([]Class, *pagination.PaginationMeta, error)
	Create(class *Class) error
	Update(class *Class) error
	Delete(id int) error
	DeleteBySlug(slug string) error

	// Enrollments
	FindEnrollmentsByClass(classID int) ([]ClassEnrollment, error)
	CreateEnrollment(enrollment *ClassEnrollment) error
	DeleteEnrollment(id int) error
	CheckEnrollmentExists(classID int, userID uuid.UUID) (bool, error)
	CountEnrollments(classID int) (int, error)
	FindUserBySlug(userSlug string) (uuid.UUID, error) // Helper para obtener userID por slug

	// Métodos para actualización automática de estados
	FindOpenClassesEndedBefore(endTime time.Time) ([]Class, error)
	UpdateStatus(id int, newStatus string) error
}
