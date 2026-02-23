package infrastructure

import (
	"backend-go/features/clubs/domain"
	"backend-go/shared/database"
	"backend-go/shared/pagination"
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

// FindAllPaginated obtiene clubs con paginación y filtros
func (r *ClubRepositoryImpl) FindAllPaginated(params pagination.PaginationParams) ([]domain.Club, *pagination.PaginationMeta, error) {
	var models []database.Club
	var totalItems int64

	// Query base con Preload
	query := r.db.Model(&database.Club{}).Preload("Owner")

	// 1. Filtro de búsqueda (nombre, descripción)
	if params.Search != "" {
		searchPattern := "%" + params.Search + "%"
		query = query.Where("name ILIKE ? OR description ILIKE ?", searchPattern, searchPattern)
	}

	// 2. Filtro por estado (status: active/inactive)
	if params.Status != "" {
		switch params.Status {
		case "active":
			query = query.Where("is_active = ?", true)
		case "inactive":
			query = query.Where("is_active = ?", false)
		}
	}

	// 3. Contar total de items (después de aplicar filtros)
	if err := query.Count(&totalItems).Error; err != nil {
		return nil, nil, err
	}

	// 4. Ordenación
	switch params.Sort {
	case "nombre_asc":
		query = query.Order("name ASC")
	case "nombre_desc":
		query = query.Order("name DESC")
	case "recientes":
		query = query.Order("created_at DESC")
	default:
		query = query.Order("created_at DESC")
	}

	// 5. Aplicar paginación
	offset := params.GetOffset()
	query = query.Limit(params.Limit).Offset(offset)

	// 6. Ejecutar query
	if err := query.Find(&models).Error; err != nil {
		return nil, nil, err
	}

	// 7. Mapear a dominio
	clubs := make([]domain.Club, len(models))
	for i, model := range models {
		clubs[i] = *ToEntity(&model)
	}

	// 8. Construir metadata
	meta := pagination.NewPaginationMeta(
		totalItems,
		params.Page,
		params.Limit,
	)

	return clubs, meta, nil
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
