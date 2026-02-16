package infrastructure

import (
	"backend-go/features/clubs/domain"
	"backend-go/shared/database"
	"errors"

	"gorm.io/gorm"
)

type ClubRepositoryImpl struct {
	db *gorm.DB
}

func NewClubRepository(db *gorm.DB) domain.ClubRepository {
	return &ClubRepositoryImpl{db: db}
}

// FindAll obtiene todos los clubs
func (r *ClubRepositoryImpl) FindAll() ([]domain.Club, error) {
	var models []database.Club
	if err := r.db.Preload("Owner").Order("created_at DESC").Find(&models).Error; err != nil {
		return nil, err
	}

	clubs := make([]domain.Club, len(models))
	for i, model := range models {
		clubs[i] = *ToEntity(&model)
	}

	return clubs, nil
}

// FindByID obtiene un club por ID
func (r *ClubRepositoryImpl) FindByID(id int) (*domain.Club, error) {
	var model database.Club
	if err := r.db.Preload("Owner").First(&model, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("club no encontrado")
		}
		return nil, err
	}

	return ToEntity(&model), nil
}

// FindBySlug obtiene un club por slug
func (r *ClubRepositoryImpl) FindBySlug(slug string) (*domain.Club, error) {
	var model database.Club
	if err := r.db.Preload("Owner").Where("slug = ?", slug).First(&model).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("club no encontrado")
		}
		return nil, err
	}

	return ToEntity(&model), nil
}

// Create crea un nuevo club
func (r *ClubRepositoryImpl) Create(club *domain.Club) error {
	model := FromEntity(club)

	if err := r.db.Create(model).Error; err != nil {
		return err
	}

	club.ID = int(model.ID)
	club.Slug = model.Slug
	club.CreatedAt = model.CreatedAt
	club.UpdatedAt = model.UpdatedAt

	return nil
}

// Update actualiza un club
func (r *ClubRepositoryImpl) Update(club *domain.Club) error {
	model := FromEntity(club)

	if err := r.db.Save(model).Error; err != nil {
		return err
	}

	club.UpdatedAt = model.UpdatedAt
	return nil
}

// Delete elimina un club
func (r *ClubRepositoryImpl) Delete(id int) error {
	return r.db.Delete(&database.Club{}, id).Error
}

// DeleteBySlug elimina un club por slug
func (r *ClubRepositoryImpl) DeleteBySlug(slug string) error {
	return r.db.Where("slug = ?", slug).Delete(&database.Club{}).Error
}

// CountMembers cuenta los miembros activos de un club
func (r *ClubRepositoryImpl) CountMembers(clubID int) (int, error) {
	var count int64
	err := r.db.Model(&database.ClubMembership{}).
		Where("club_id = ? AND is_active = ?", clubID, true).
		Count(&count).Error
	return int(count), err
}

// ToEntity convierte un modelo GORM a entidad de dominio
func ToEntity(model *database.Club) *domain.Club {
	club := &domain.Club{
		ID:              int(model.ID),
		Slug:            model.Slug,
		Name:            model.Name,
		Description:     model.Description,
		LogoURL:         model.LogoURL,
		MaxMembers:      model.MaxMembers,
		MonthlyFeeCents: model.MonthlyFeeCents,
		Status:          model.Status,
		IsActive:        model.IsActive,
		CreatedAt:       model.CreatedAt,
		UpdatedAt:       model.UpdatedAt,
	}

	if model.OwnerID != nil {
		club.OwnerID = model.OwnerID

		if model.Owner != nil {
			club.OwnerSlug = &model.Owner.Slug
			club.OwnerName = &model.Owner.FullName
		}
	}

	return club
}

// FromEntity convierte una entidad de dominio a modelo GORM
func FromEntity(club *domain.Club) *database.Club {
	model := &database.Club{
		ID:              uint(club.ID),
		Slug:            club.Slug,
		Name:            club.Name,
		Description:     club.Description,
		LogoURL:         club.LogoURL,
		MaxMembers:      club.MaxMembers,
		MonthlyFeeCents: club.MonthlyFeeCents,
		Status:          club.Status,
		IsActive:        club.IsActive,
	}

	if club.OwnerID != nil {
		model.OwnerID = club.OwnerID
	}

	return model
}
