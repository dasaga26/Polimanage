package infrastructure

import (
	"backend-go/features/clubs/domain"
	"backend-go/shared/database"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ClubMembershipRepositoryImpl struct {
	db *gorm.DB
}

func NewClubMembershipRepository(db *gorm.DB) domain.ClubMembershipRepository {
	return &ClubMembershipRepositoryImpl{db: db}
}

// FindByID obtiene una membresía por ID
func (r *ClubMembershipRepositoryImpl) FindByID(id int) (*domain.ClubMembership, error) {
	var model database.ClubMembership
	if err := r.db.
		Preload("User").
		Preload("Club").
		First(&model, id).Error; err != nil {
		return nil, err
	}

	return MembershipToEntity(&model), nil
}

// FindByClub obtiene todas las membresías de un club
func (r *ClubMembershipRepositoryImpl) FindByClub(clubID int) ([]domain.ClubMembership, error) {
	var models []database.ClubMembership
	if err := r.db.
		Preload("User").
		Preload("Club").
		Where("club_id = ?", clubID).
		Order("created_at DESC").
		Find(&models).Error; err != nil {
		return nil, err
	}

	memberships := make([]domain.ClubMembership, len(models))
	for i, model := range models {
		memberships[i] = *MembershipToEntity(&model)
	}

	return memberships, nil
}

// FindByUser obtiene todas las membresías de un usuario
func (r *ClubMembershipRepositoryImpl) FindByUser(userID uuid.UUID) ([]domain.ClubMembership, error) {
	var models []database.ClubMembership
	if err := r.db.
		Preload("User").
		Preload("Club").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&models).Error; err != nil {
		return nil, err
	}

	memberships := make([]domain.ClubMembership, len(models))
	for i, model := range models {
		memberships[i] = *MembershipToEntity(&model)
	}

	return memberships, nil
}

// Create crea una nueva membresía
func (r *ClubMembershipRepositoryImpl) Create(membership *domain.ClubMembership) error {
	model := MembershipFromEntity(membership)

	if err := r.db.Create(model).Error; err != nil {
		return err
	}

	// Recargar para obtener las relaciones
	if err := r.db.
		Preload("User").
		Preload("Club").
		First(model, model.ID).Error; err != nil {
		return err
	}

	membership.ID = int(model.ID)
	membership.CreatedAt = model.CreatedAt
	membership.UpdatedAt = model.UpdatedAt
	membership.UserName = model.User.FullName
	membership.UserEmail = model.User.Email
	membership.UserSlug = model.User.Slug
	membership.ClubName = model.Club.Name
	membership.ClubSlug = model.Club.Slug

	return nil
}

// Update actualiza una membresía
func (r *ClubMembershipRepositoryImpl) Update(membership *domain.ClubMembership) error {
	model := MembershipFromEntity(membership)
	return r.db.Save(model).Error
}

// Delete elimina una membresía
func (r *ClubMembershipRepositoryImpl) Delete(id int) error {
	return r.db.Delete(&database.ClubMembership{}, id).Error
}

// CheckExists verifica si existe una membresía
func (r *ClubMembershipRepositoryImpl) CheckExists(clubID int, userID uuid.UUID) (bool, error) {
	var count int64
	err := r.db.Model(&database.ClubMembership{}).
		Where("club_id = ? AND user_id = ? AND is_active = ?", clubID, userID, true).
		Count(&count).Error
	return count > 0, err
}

// Count cuenta las membresías activas de un club
func (r *ClubMembershipRepositoryImpl) Count(clubID int) (int, error) {
	var count int64
	err := r.db.Model(&database.ClubMembership{}).
		Where("club_id = ? AND is_active = ?", clubID, true).
		Count(&count).Error
	return int(count), err
}

// MembershipToEntity convierte un modelo GORM a entidad de dominio
func MembershipToEntity(model *database.ClubMembership) *domain.ClubMembership {
	membership := &domain.ClubMembership{
		ID:              int(model.ID),
		ClubID:          int(model.ClubID),
		UserID:          model.UserID,
		Status:          model.Status,
		StartDate:       model.StartDate,
		EndDate:         model.EndDate,
		NextBillingDate: model.NextBillingDate,
		PaymentStatus:   model.PaymentStatus,
		IsActive:        model.IsActive,
		CreatedAt:       model.CreatedAt,
		UpdatedAt:       model.UpdatedAt,
	}

	// Relaciones expandidas
	if model.User.ID != (uuid.UUID{}) {
		membership.UserName = model.User.FullName
		membership.UserEmail = model.User.Email
		membership.UserSlug = model.User.Slug
	}
	if model.Club.ID != 0 {
		membership.ClubName = model.Club.Name
		membership.ClubSlug = model.Club.Slug
	}

	return membership
}

// MembershipFromEntity convierte una entidad de dominio a modelo GORM
func MembershipFromEntity(membership *domain.ClubMembership) *database.ClubMembership {
	return &database.ClubMembership{
		ID:              uint(membership.ID),
		ClubID:          uint(membership.ClubID),
		UserID:          membership.UserID,
		Status:          membership.Status,
		StartDate:       membership.StartDate,
		EndDate:         membership.EndDate,
		NextBillingDate: membership.NextBillingDate,
		PaymentStatus:   membership.PaymentStatus,
		IsActive:        membership.IsActive,
	}
}
