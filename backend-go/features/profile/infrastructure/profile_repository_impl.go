package infrastructure

import (
	"backend-go/features/profile/domain"
	"backend-go/shared/database"

	"gorm.io/gorm"
)

// ======================================================================================
// IMPLEMENTACIÓN DE PROFILEREPOSITORY CON GORM (INFRAESTRUCTURA)
// ======================================================================================

type ProfileRepositoryImpl struct {
	db *gorm.DB
}

func NewProfileRepository(db *gorm.DB) *ProfileRepositoryImpl {
	return &ProfileRepositoryImpl{db: db}
}

// GetProfileByUsername obtiene el perfil de un usuario por username/slug
func (r *ProfileRepositoryImpl) GetProfileByUsername(username string) (*domain.Profile, error) {
	var user database.User

	// Buscar usuario por slug
	if err := r.db.Where("slug = ?", username).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrProfileNotFound
		}
		return nil, err
	}

	return &domain.Profile{
		UserID:    user.ID,
		Username:  user.Slug,
		FullName:  user.FullName,
		AvatarURL: user.AvatarURL,
		Bio:       nil, // TODO: Agregar campo bio a User
		CreatedAt: user.CreatedAt,
	}, nil
}
