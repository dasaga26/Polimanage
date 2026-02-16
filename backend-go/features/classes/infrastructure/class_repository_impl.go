package infrastructure

import (
	"backend-go/features/classes/domain"
	"backend-go/shared/database"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ClassRepositoryImpl struct {
	db *gorm.DB
}

func NewClassRepository(db *gorm.DB) domain.ClassRepository {
	return &ClassRepositoryImpl{db: db}
}

// FindAll obtiene todas las clases con relaciones
func (r *ClassRepositoryImpl) FindAll() ([]domain.Class, error) {
	var models []database.Class
	if err := r.db.
		Preload("Pista").
		Preload("Instructor").
		Preload("Enrollments.User").
		Order("start_time DESC").
		Find(&models).Error; err != nil {
		return nil, err
	}

	classes := make([]domain.Class, len(models))
	for i, model := range models {
		classes[i] = *ToEntity(&model)
	}

	return classes, nil
}

// FindByID obtiene una clase por ID
func (r *ClassRepositoryImpl) FindByID(id int) (*domain.Class, error) {
	var model database.Class
	if err := r.db.
		Preload("Pista").
		Preload("Instructor").
		Preload("Enrollments.User").
		First(&model, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("clase no encontrada")
		}
		return nil, err
	}

	return ToEntity(&model), nil
}

// FindBySlug obtiene una clase por slug
func (r *ClassRepositoryImpl) FindBySlug(slug string) (*domain.Class, error) {
	var model database.Class
	if err := r.db.
		Preload("Pista").
		Preload("Instructor").
		Preload("Enrollments.User").
		Where("slug = ?", slug).
		First(&model).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("clase no encontrada")
		}
		return nil, err
	}

	return ToEntity(&model), nil
}

// FindByInstructor obtiene las clases de un instructor
func (r *ClassRepositoryImpl) FindByInstructor(instructorID int) ([]domain.Class, error) {
	var models []database.Class
	if err := r.db.
		Preload("Pista").
		Preload("Instructor").
		Preload("Enrollments").
		Where("instructor_id = ?", instructorID).
		Order("start_time DESC").
		Find(&models).Error; err != nil {
		return nil, err
	}

	classes := make([]domain.Class, len(models))
	for i, model := range models {
		classes[i] = *ToEntity(&model)
	}

	return classes, nil
}

// FindByPistaAndTimeRange obtiene clases que se solapan con un rango horario
func (r *ClassRepositoryImpl) FindByPistaAndTimeRange(pistaID int, startTime, endTime time.Time) ([]domain.Class, error) {
	var models []database.Class
	if err := r.db.
		Preload("Pista").
		Preload("Instructor").
		Preload("Enrollments").
		Where("pista_id = ?", pistaID).
		Where("status != ?", domain.ClassStatusCancelled).
		Where("start_time < ? AND end_time > ?", endTime, startTime). // Overlap check
		Order("start_time ASC").
		Find(&models).Error; err != nil {
		return nil, err
	}

	classes := make([]domain.Class, len(models))
	for i, model := range models {
		classes[i] = *ToEntity(&model)
	}

	return classes, nil
}

// Create crea una nueva clase
func (r *ClassRepositoryImpl) Create(class *domain.Class) error {
	model := FromEntity(class)

	if err := r.db.Create(model).Error; err != nil {
		return err
	}

	// Recargar el modelo con las relaciones para obtener los nombres
	if err := r.db.Preload("Pista").Preload("Instructor").First(model, model.ID).Error; err != nil {
		return err
	}

	class.ID = int(model.ID)
	class.Slug = model.Slug
	class.CreatedAt = model.CreatedAt
	class.UpdatedAt = model.UpdatedAt
	class.PistaName = model.Pista.Name
	class.InstructorName = model.Instructor.FullName

	return nil
}

// Update actualiza una clase
func (r *ClassRepositoryImpl) Update(class *domain.Class) error {
	model := FromEntity(class)

	if err := r.db.Save(model).Error; err != nil {
		return err
	}

	class.UpdatedAt = model.UpdatedAt
	return nil
}

// Delete elimina una clase (soft delete)
func (r *ClassRepositoryImpl) Delete(id int) error {
	return r.db.Delete(&database.Class{}, id).Error
}

// DeleteBySlug elimina una clase por slug (soft delete)
func (r *ClassRepositoryImpl) DeleteBySlug(slug string) error {
	return r.db.Where("slug = ?", slug).Delete(&database.Class{}).Error
}

// FindEnrollmentsByClass obtiene las inscripciones de una clase
func (r *ClassRepositoryImpl) FindEnrollmentsByClass(classID int) ([]domain.ClassEnrollment, error) {
	var models []database.ClassEnrollment
	if err := r.db.
		Preload("User").
		Preload("Class").
		Where("class_id = ?", classID).
		Order("registered_at ASC").
		Find(&models).Error; err != nil {
		return nil, err
	}

	enrollments := make([]domain.ClassEnrollment, len(models))
	for i, model := range models {
		enrollments[i] = *ToEnrollmentEntity(&model)
	}

	return enrollments, nil
}

// CreateEnrollment crea una nueva inscripción
func (r *ClassRepositoryImpl) CreateEnrollment(enrollment *domain.ClassEnrollment) error {
	model := FromEnrollmentEntity(enrollment)

	if err := r.db.Create(model).Error; err != nil {
		return err
	}

	enrollment.ID = int(model.ID)
	enrollment.RegisteredAt = model.RegisteredAt

	return nil
}

// DeleteEnrollment elimina una inscripción
func (r *ClassRepositoryImpl) DeleteEnrollment(id int) error {
	return r.db.Delete(&database.ClassEnrollment{}, id).Error
}

// CheckEnrollmentExists verifica si ya existe una inscripción
func (r *ClassRepositoryImpl) CheckEnrollmentExists(classID int, userID uuid.UUID) (bool, error) {
	var count int64
	if err := r.db.Model(&database.ClassEnrollment{}).
		Where("class_id = ? AND user_id = ?", classID, userID).
		Count(&count).Error; err != nil {
		return false, err
	}

	return count > 0, nil
}

// CountEnrollments cuenta las inscripciones de una clase
func (r *ClassRepositoryImpl) CountEnrollments(classID int) (int, error) {
	var count int64
	if err := r.db.Model(&database.ClassEnrollment{}).
		Where("class_id = ?", classID).
		Count(&count).Error; err != nil {
		return 0, err
	}

	return int(count), nil
}

// FindUserBySlug encuentra el ID de un usuario por su slug
func (r *ClassRepositoryImpl) FindUserBySlug(userSlug string) (uuid.UUID, error) {
	var user database.User
	if err := r.db.Where("slug = ?", userSlug).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return uuid.UUID{}, errors.New("usuario no encontrado")
		}
		return uuid.UUID{}, err
	}
	return user.ID, nil
}

// ToEntity convierte un modelo GORM a entidad de dominio
func ToEntity(model *database.Class) *domain.Class {
	class := &domain.Class{
		ID:           int(model.ID),
		Slug:         model.Slug,
		PistaID:      int(model.PistaID),
		InstructorID: int(model.InstructorID),
		Title:        model.Title,
		Description:  model.Description,
		StartTime:    model.StartTime,
		EndTime:      model.EndTime,
		MaxCapacity:  model.Capacity,
		PriceCents:   model.PriceCents,
		Status:       model.Status,
		CreatedAt:    model.CreatedAt,
		UpdatedAt:    model.UpdatedAt,
	}

	// Relaciones expandidas
	if model.Pista.ID != 0 {
		class.PistaName = model.Pista.Name
	}
	if model.Instructor.ID != (uuid.UUID{}) {
		class.InstructorName = model.Instructor.FullName
	}

	// Convertir enrollments
	if len(model.Enrollments) > 0 {
		class.Enrollments = make([]domain.ClassEnrollment, len(model.Enrollments))
		for i, enrollment := range model.Enrollments {
			class.Enrollments[i] = *ToEnrollmentEntity(&enrollment)
		}
	}
	class.EnrolledCount = len(model.Enrollments)

	return class
}

// FromEntity convierte una entidad de dominio a modelo GORM
func FromEntity(class *domain.Class) *database.Class {
	model := &database.Class{
		ID:           uint(class.ID),
		PistaID:      uint(class.PistaID),
		InstructorID: uint(class.InstructorID),
		Title:        class.Title,
		Description:  class.Description,
		StartTime:    class.StartTime,
		EndTime:      class.EndTime,
		Capacity:     class.MaxCapacity,
		PriceCents:   class.PriceCents,
		Status:       class.Status,
		CreatedAt:    class.CreatedAt,
		UpdatedAt:    class.UpdatedAt,
	}

	// Generar slug si no existe
	if class.Slug != "" {
		model.Slug = class.Slug
	} else {
		model.Slug = generateClassSlug(class.Title, class.StartTime)
	}

	return model
}

// ToEnrollmentEntity convierte un modelo GORM de inscripción a entidad de dominio
func ToEnrollmentEntity(model *database.ClassEnrollment) *domain.ClassEnrollment {
	enrollment := &domain.ClassEnrollment{
		ID:           int(model.ID),
		ClassID:      int(model.ClassID),
		UserID:       model.UserID,
		Status:       model.Status,
		RegisteredAt: model.RegisteredAt,
	}

	// Relaciones expandidas
	if model.User.ID != (uuid.UUID{}) {
		enrollment.UserName = model.User.FullName
		enrollment.UserEmail = model.User.Email
	}
	if model.Class.ID != 0 {
		enrollment.ClassName = model.Class.Title
		enrollment.ClassTitle = model.Class.Title
	}

	return enrollment
}

// FromEnrollmentEntity convierte una entidad de dominio a modelo GORM
func FromEnrollmentEntity(enrollment *domain.ClassEnrollment) *database.ClassEnrollment {
	return &database.ClassEnrollment{
		ID:           uint(enrollment.ID),
		ClassID:      uint(enrollment.ClassID),
		UserID:       enrollment.UserID,
		Status:       enrollment.Status,
		RegisteredAt: enrollment.RegisteredAt,
	}
}

// generateClassSlug genera un slug único para una clase
func generateClassSlug(title string, startTime time.Time) string {
	// Formato: "title-YYYYMMDD-HHMM"
	// Limpiar el título
	slug := strings.ToLower(title)
	slug = strings.TrimSpace(slug)

	// Reemplazar espacios y caracteres especiales
	reg := regexp.MustCompile("[^a-z0-9]+")
	slug = reg.ReplaceAllString(slug, "-")

	// Truncar si es muy largo
	if len(slug) > 50 {
		slug = slug[:50]
	}

	// Eliminar guiones al inicio y final
	slug = strings.Trim(slug, "-")

	// Agregar fecha y hora para unicidad
	dateStr := startTime.Format("20060102-1504")
	return fmt.Sprintf("%s-%s", slug, dateStr)
}

// FindOpenClassesEndedBefore obtiene clases ABIERTAS o EN PROGRESO que ya finalizaron
func (r *ClassRepositoryImpl) FindOpenClassesEndedBefore(endTime time.Time) ([]domain.Class, error) {
	var models []database.Class
	if err := r.db.
		Where("status IN (?)", []string{domain.ClassStatusOpen, domain.ClassStatusInProgress}).
		Where("end_time < ?", endTime).
		Find(&models).Error; err != nil {
		return nil, err
	}

	classes := make([]domain.Class, len(models))
	for i, model := range models {
		classes[i] = *ToEntity(&model)
	}

	return classes, nil
}

// UpdateStatus actualiza solo el estado de una clase
func (r *ClassRepositoryImpl) UpdateStatus(id int, newStatus string) error {
	return r.db.Model(&database.Class{}).
		Where("id = ?", id).
		Update("status", newStatus).
		Error
}
