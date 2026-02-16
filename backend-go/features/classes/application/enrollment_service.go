package application

import (
	"errors"
	"fmt"

	"backend-go/features/classes/domain"

	"github.com/google/uuid"
)

// ClassProvider define la interfaz para obtener información de clases
type ClassProvider interface {
	GetClassBySlug(slug string) (ClassInfo, error)
	GetClassByID(id int) (ClassInfo, error)
}

// UserProvider define la interfaz para obtener información de usuarios
type UserProvider interface {
	GetUserBySlug(slug string) (UserInfo, error)
}

// ClassInfo representa la información necesaria de una clase
type ClassInfo struct {
	ID          int
	Status      string
	MaxCapacity int
}

// UserInfo representa la información necesaria de un usuario
type UserInfo struct {
	ID     uuid.UUID
	RoleID int
}

type EnrollmentService struct {
	repo          domain.EnrollmentRepository
	classProvider ClassProvider
	userProvider  UserProvider
}

func NewEnrollmentService(
	repo domain.EnrollmentRepository,
	classProvider ClassProvider,
	userProvider UserProvider,
) *EnrollmentService {
	return &EnrollmentService{
		repo:          repo,
		classProvider: classProvider,
		userProvider:  userProvider,
	}
}

// GetEnrollmentsByClass obtiene todas las inscripciones de una clase
func (s *EnrollmentService) GetEnrollmentsByClass(classID int) ([]domain.Enrollment, error) {
	return s.repo.FindByClass(classID)
}

// GetEnrollmentsByUser obtiene todas las inscripciones de un usuario
func (s *EnrollmentService) GetEnrollmentsByUser(userID uuid.UUID) ([]domain.Enrollment, error) {
	return s.repo.FindByUser(userID)
}

// EnrollUserBySlug inscribe a un usuario en una clase usando slugs
func (s *EnrollmentService) EnrollUserBySlug(classSlug string, userSlug string) error {
	// Obtener clase
	classInfo, err := s.classProvider.GetClassBySlug(classSlug)
	if err != nil {
		return err
	}

	// Obtener usuario
	userInfo, err := s.userProvider.GetUserBySlug(userSlug)
	if err != nil {
		return err
	}

	return s.EnrollUser(classInfo.ID, userInfo.ID)
}

// EnrollUser inscribe a un usuario en una clase
func (s *EnrollmentService) EnrollUser(classID int, userID uuid.UUID) error {
	// VALIDACIÓN 1: Verificar que la clase existe y obtener info
	classInfo, err := s.classProvider.GetClassByID(classID)
	if err != nil {
		return err
	}

	// VALIDACIÓN 2: Verificar que la clase esté abierta
	if classInfo.Status != "OPEN" {
		return fmt.Errorf("la clase no está abierta para inscripciones (estado: %s)", classInfo.Status)
	}

	// VALIDACIÓN 3: Verificar que el usuario no esté ya inscrito
	exists, err := s.repo.CheckExists(classID, userID)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("el usuario ya está inscrito en esta clase")
	}

	// VALIDACIÓN 4: Verificar capacidad disponible
	count, err := s.repo.Count(classID)
	if err != nil {
		return err
	}
	if count >= classInfo.MaxCapacity {
		return fmt.Errorf("la clase está completa (capacidad: %d/%d)", count, classInfo.MaxCapacity)
	}

	// Crear inscripción
	enrollment := &domain.Enrollment{
		ClassID: classID,
		UserID:  userID,
		Status:  domain.EnrollmentStatusConfirmed,
	}

	return s.repo.Create(enrollment)
}

// UnenrollUser da de baja a un usuario de una clase
func (s *EnrollmentService) UnenrollUser(enrollmentID int) error {
	return s.repo.Delete(enrollmentID)
}
