package infrastructure

import (
	"backend-go/features/profile/domain"
	"backend-go/shared/database"

	"github.com/google/uuid"
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

// GetProfileByUserID obtiene el perfil del usuario por ID
func (r *ProfileRepositoryImpl) GetProfileByUserID(userID uuid.UUID) (*domain.Profile, error) {
	var user database.User

	// Buscar usuario por ID con su rol
	if err := r.db.Joins("Role").Where("users.id = ?", userID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrProfileNotFound
		}
		return nil, err
	}

	return &domain.Profile{
		ID:        user.ID,
		RoleID:    user.RoleID,
		Slug:      user.Slug,
		Email:     user.Email,
		FullName:  user.FullName,
		Phone:     user.Phone,
		DNI:       user.DNI,
		AvatarURL: user.AvatarURL,
		RoleName:  user.Role.Name,
		IsActive:  user.IsActive,
		IsPremium: user.IsMember,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}, nil
}

// UpdateProfile actualiza la información del perfil
func (r *ProfileRepositoryImpl) UpdateProfile(userID uuid.UUID, data *domain.UpdateProfileData) error {
	updates := make(map[string]interface{})

	if data.FullName != nil {
		updates["full_name"] = *data.FullName
	}
	if data.Phone != nil {
		updates["phone"] = *data.Phone
	}
	if data.DNI != nil {
		updates["dni"] = *data.DNI
	}
	if data.AvatarURL != nil {
		updates["avatar_url"] = *data.AvatarURL
	}

	if len(updates) == 0 {
		return nil // No hay nada que actualizar
	}

	result := r.db.Model(&database.User{}).Where("id = ?", userID).Updates(updates)
	if result.Error != nil {
		return domain.ErrUpdateFailed
	}

	if result.RowsAffected == 0 {
		return domain.ErrProfileNotFound
	}

	return nil
}

// ChangePassword cambia la contraseña del usuario
func (r *ProfileRepositoryImpl) ChangePassword(userID uuid.UUID, currentPasswordHash, newPasswordHash string) error {
	// Primero verificar que la contraseña actual sea correcta
	var user database.User
	if err := r.db.Where("id = ? AND password_hash = ?", userID, currentPasswordHash).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return domain.ErrInvalidPassword
		}
		return err
	}

	// Actualizar con la nueva contraseña
	result := r.db.Model(&database.User{}).Where("id = ?", userID).Update("password_hash", newPasswordHash)
	if result.Error != nil {
		return domain.ErrPasswordChangeFailed
	}

	return nil
}

// GetPasswordHash obtiene el hash de la contraseña del usuario
func (r *ProfileRepositoryImpl) GetPasswordHash(userID uuid.UUID) (string, error) {
	var user database.User
	if err := r.db.Select("password_hash").Where("id = ?", userID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", domain.ErrProfileNotFound
		}
		return "", err
	}
	return user.PasswordHash, nil
}
