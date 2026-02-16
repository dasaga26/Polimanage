package infrastructure

import (
	"backend-go/features/classes/domain"
	"backend-go/shared/database"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EnrollmentRepositoryImpl struct {
	db *gorm.DB
}

func NewEnrollmentRepository(db *gorm.DB) domain.EnrollmentRepository {
	return &EnrollmentRepositoryImpl{db: db}
}

// FindByID obtiene una inscripción por ID
func (r *EnrollmentRepositoryImpl) FindByID(id int) (*domain.Enrollment, error) {
	var model database.ClassEnrollment
	if err := r.db.
		Preload("User").
		Preload("Class").
		First(&model, id).Error; err != nil {
		return nil, err
	}

	return EnrollmentToEntity(&model), nil
}

// FindByClass obtiene todas las inscripciones de una clase
func (r *EnrollmentRepositoryImpl) FindByClass(classID int) ([]domain.Enrollment, error) {
	var models []database.ClassEnrollment
	if err := r.db.
		Preload("User").
		Preload("Class").
		Where("class_id = ?", classID).
		Find(&models).Error; err != nil {
		return nil, err
	}

	enrollments := make([]domain.Enrollment, len(models))
	for i, model := range models {
		enrollments[i] = *EnrollmentToEntity(&model)
	}

	return enrollments, nil
}

// FindByUser obtiene todas las inscripciones de un usuario
func (r *EnrollmentRepositoryImpl) FindByUser(userID uuid.UUID) ([]domain.Enrollment, error) {
	var models []database.ClassEnrollment
	if err := r.db.
		Preload("User").
		Preload("Class").
		Where("user_id = ?", userID).
		Find(&models).Error; err != nil {
		return nil, err
	}

	enrollments := make([]domain.Enrollment, len(models))
	for i, model := range models {
		enrollments[i] = *EnrollmentToEntity(&model)
	}

	return enrollments, nil
}

// Create crea una nueva inscripción
func (r *EnrollmentRepositoryImpl) Create(enrollment *domain.Enrollment) error {
	model := EnrollmentFromEntity(enrollment)

	if err := r.db.Create(model).Error; err != nil {
		return err
	}

	// Recargar para obtener las relaciones
	if err := r.db.
		Preload("User").
		Preload("Class").
		First(model, model.ID).Error; err != nil {
		return err
	}

	enrollment.ID = int(model.ID)
	enrollment.RegisteredAt = model.RegisteredAt
	enrollment.UserName = model.User.FullName
	enrollment.UserEmail = model.User.Email
	enrollment.ClassName = model.Class.Title
	enrollment.ClassSlug = model.Class.Slug
	enrollment.UserSlug = model.User.Slug

	return nil
}

// Delete elimina una inscripción
func (r *EnrollmentRepositoryImpl) Delete(id int) error {
	return r.db.Delete(&database.ClassEnrollment{}, id).Error
}

// CheckExists verifica si existe una inscripción
func (r *EnrollmentRepositoryImpl) CheckExists(classID int, userID uuid.UUID) (bool, error) {
	var count int64
	err := r.db.Model(&database.ClassEnrollment{}).
		Where("class_id = ? AND user_id = ?", classID, userID).
		Count(&count).Error
	return count > 0, err
}

// Count cuenta las inscripciones de una clase
func (r *EnrollmentRepositoryImpl) Count(classID int) (int, error) {
	var count int64
	err := r.db.Model(&database.ClassEnrollment{}).
		Where("class_id = ?", classID).
		Count(&count).Error
	return int(count), err
}

// EnrollmentToEntity convierte un modelo GORM a entidad de dominio
func EnrollmentToEntity(model *database.ClassEnrollment) *domain.Enrollment {
	enrollment := &domain.Enrollment{
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
		enrollment.UserSlug = model.User.Slug
	}
	if model.Class.ID != 0 {
		enrollment.ClassName = model.Class.Title
		enrollment.ClassTitle = model.Class.Title
		enrollment.ClassSlug = model.Class.Slug
	}

	return enrollment
}

// EnrollmentFromEntity convierte una entidad de dominio a modelo GORM
func EnrollmentFromEntity(enrollment *domain.Enrollment) *database.ClassEnrollment {
	return &database.ClassEnrollment{
		ID:           uint(enrollment.ID),
		ClassID:      uint(enrollment.ClassID),
		UserID:       enrollment.UserID,
		Status:       enrollment.Status,
		RegisteredAt: time.Now(),
	}
}
