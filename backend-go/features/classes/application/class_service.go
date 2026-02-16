package application

import (
	"backend-go/features/classes/domain"
	"backend-go/shared/availability"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type ClassService struct {
	repo                domain.ClassRepository
	availabilityService *availability.AvailabilityService
}

func NewClassService(repo domain.ClassRepository, availabilityService *availability.AvailabilityService) *ClassService {
	return &ClassService{
		repo:                repo,
		availabilityService: availabilityService,
	}
}

// GetAllClasses obtiene todas las clases
func (s *ClassService) GetAllClasses() ([]domain.Class, error) {
	return s.repo.FindAll()
}

// GetClassByID obtiene una clase por ID
func (s *ClassService) GetClassByID(id int) (*domain.Class, error) {
	return s.repo.FindByID(id)
}

// GetClassBySlug obtiene una clase por slug
func (s *ClassService) GetClassBySlug(slug string) (*domain.Class, error) {
	return s.repo.FindBySlug(slug)
}

// GetClassesByInstructor obtiene las clases de un instructor específico
func (s *ClassService) GetClassesByInstructor(instructorID int) ([]domain.Class, error) {
	return s.repo.FindByInstructor(instructorID)
}

// CreateClass crea una nueva clase con validaciones de negocio
func (s *ClassService) CreateClass(class *domain.Class, userRoleID int) error {
	// VALIDACIÓN 1: Solo ADMIN (1) o STAFF (2) pueden ser instructores
	if userRoleID != 1 && userRoleID != 2 {
		return errors.New("solo administradores y staff pueden ser instructores de clases")
	}

	// VALIDACIÓN 2: Duración mínima
	duration := class.EndTime.Sub(class.StartTime)
	if duration < 30*time.Minute {
		return errors.New("la duración mínima de una clase es 30 minutos")
	}
	if duration > 3*time.Hour {
		return errors.New("la duración máxima de una clase es 3 horas")
	}

	// VALIDACIÓN 3: Verificar disponibilidad (NO conflictos con bookings o clases existentes)
	if err := s.availabilityService.CheckPistaAvailable(
		class.PistaID,
		class.StartTime,
		class.EndTime,
		nil, // No es edición de booking
		nil, // No es edición de clase
	); err != nil {
		return err
	}

	// VALIDACIÓN 4: Fecha no puede ser en el pasado
	now := time.Now()
	if class.StartTime.Before(now) {
		return errors.New("no se pueden crear clases en el pasado")
	}

	// VALIDACIÓN 4: Capacidad mínima
	if class.MaxCapacity < 1 {
		return errors.New("la capacidad mínima es 1 alumno")
	}
	if class.MaxCapacity > 20 {
		return errors.New("la capacidad máxima es 20 alumnos")
	}

	// VALIDACIÓN 5: Precio mínimo
	if class.PriceCents < 0 {
		return errors.New("el precio no puede ser negativo")
	}

	// Valores por defecto
	if class.Status == "" {
		class.Status = domain.ClassStatusOpen
	}

	return s.repo.Create(class)
}

// UpdateClass actualiza una clase existente
func (s *ClassService) UpdateClass(class *domain.Class) error {
	// Validaciones similares a CreateClass
	duration := class.EndTime.Sub(class.StartTime)
	if duration < 30*time.Minute {
		return errors.New("la duración mínima de una clase es 30 minutos")
	}

	if class.MaxCapacity < 1 {
		return errors.New("la capacidad mínima es 1 alumno")
	}

	return s.repo.Update(class)
}

// DeleteClass elimina una clase (soft delete)
func (s *ClassService) DeleteClass(id int) error {
	return s.repo.Delete(id)
}

// DeleteClassBySlug elimina una clase por slug (soft delete)
func (s *ClassService) DeleteClassBySlug(slug string) error {
	return s.repo.DeleteBySlug(slug)
}

// CancelClass cancela una clase
func (s *ClassService) CancelClass(id int) error {
	class, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	class.Status = domain.ClassStatusCancelled
	return s.repo.Update(class)
}

// CancelClassBySlug cancela una clase por slug
func (s *ClassService) CancelClassBySlug(slug string) error {
	class, err := s.repo.FindBySlug(slug)
	if err != nil {
		return err
	}

	class.Status = domain.ClassStatusCancelled
	return s.repo.Update(class)
}

// GetEnrollments obtiene las inscripciones de una clase
func (s *ClassService) GetEnrollments(classID int) ([]domain.ClassEnrollment, error) {
	return s.repo.FindEnrollmentsByClass(classID)
}

// EnrollUser inscribe a un usuario en una clase
func (s *ClassService) EnrollUser(classID int, userID uuid.UUID) error {
	// VALIDACIÓN 1: Verificar que la clase existe
	class, err := s.repo.FindByID(classID)
	if err != nil {
		return err
	}

	// VALIDACIÓN 2: Verificar que la clase esté abierta
	if class.Status != domain.ClassStatusOpen {
		return fmt.Errorf("la clase no está abierta para inscripciones (estado: %s)", class.Status)
	}

	// VALIDACIÓN 3: Verificar que el usuario no esté ya inscrito
	exists, err := s.repo.CheckEnrollmentExists(classID, userID)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("el usuario ya está inscrito en esta clase")
	}

	// VALIDACIÓN 4: Verificar capacidad disponible
	count, err := s.repo.CountEnrollments(classID)
	if err != nil {
		return err
	}
	if count >= class.MaxCapacity {
		return errors.New("la clase está completa")
	}

	// Crear inscripción
	enrollment := &domain.ClassEnrollment{
		ClassID:      classID,
		UserID:       userID,
		Status:       domain.EnrollmentStatusConfirmed,
		RegisteredAt: time.Now().UTC(),
	}

	return s.repo.CreateEnrollment(enrollment)
}

// EnrollUserBySlug inscribe a un usuario en una clase usando slugs
func (s *ClassService) EnrollUserBySlug(classSlug string, userSlug string) error {
	// Obtener la clase por slug
	class, err := s.repo.FindBySlug(classSlug)
	if err != nil {
		return err
	}

	// Obtener el userID por slug
	userID, err := s.repo.FindUserBySlug(userSlug)
	if err != nil {
		return err
	}

	// VALIDACIÓN 2: Verificar que la clase esté abierta
	if class.Status != domain.ClassStatusOpen {
		return fmt.Errorf("la clase no está abierta para inscripciones (estado: %s)", class.Status)
	}

	// VALIDACIÓN 3: Verificar que el usuario no esté ya inscrito
	exists, err := s.repo.CheckEnrollmentExists(class.ID, userID)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("el usuario ya está inscrito en esta clase")
	}

	// VALIDACIÓN 4: Verificar capacidad disponible
	count, err := s.repo.CountEnrollments(class.ID)
	if err != nil {
		return err
	}
	if count >= class.MaxCapacity {
		return errors.New("la clase está completa")
	}

	// Crear inscripción
	enrollment := &domain.ClassEnrollment{
		ClassID:      class.ID,
		UserID:       userID,
		Status:       domain.EnrollmentStatusConfirmed,
		RegisteredAt: time.Now().UTC(),
	}

	return s.repo.CreateEnrollment(enrollment)
}

// UnenrollUser elimina la inscripción de un usuario de una clase
func (s *ClassService) UnenrollUser(enrollmentID int) error {
	return s.repo.DeleteEnrollment(enrollmentID)
}

// AutoUpdateClassStatuses actualiza automáticamente los estados de las clases según reglas de negocio
func (s *ClassService) AutoUpdateClassStatuses() (int, error) {
	now := time.Now()
	updatedCount := 0

	// Completar clases ABIERTAS o EN PROGRESO que ya finalizaron
	openClasses, err := s.repo.FindOpenClassesEndedBefore(now)
	if err != nil {
		return 0, fmt.Errorf("error al buscar clases abiertas finalizadas: %w", err)
	}

	for _, class := range openClasses {
		if err := s.repo.UpdateStatus(class.ID, domain.ClassStatusCompleted); err != nil {
			return updatedCount, fmt.Errorf("error al completar clase %d: %w", class.ID, err)
		}
		updatedCount++
	}

	return updatedCount, nil
}
