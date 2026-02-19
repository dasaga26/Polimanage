package presentation

import (
	"backend-go/features/profile/domain"
	"time"

	"github.com/google/uuid"
)

// ======================================================================================
// PROFILE RESPONSE DTOs
// ======================================================================================

// ProfileResponse representa el DTO del perfil del usuario autenticado
type ProfileResponse struct {
	ID        uuid.UUID `json:"id"`
	RoleID    uint      `json:"roleId"`
	Slug      string    `json:"slug"`
	Email     string    `json:"email"`
	FullName  string    `json:"fullName"`
	Phone     *string   `json:"phone"`
	DNI       *string   `json:"dni"`
	AvatarURL *string   `json:"avatarUrl"`
	RoleName  string    `json:"roleName"`
	IsActive  bool      `json:"isActive"`
	IsPremium bool      `json:"isPremium"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// ToProfileResponse convierte de dominio a response DTO
func ToProfileResponse(profile *domain.Profile) ProfileResponse {
	return ProfileResponse{
		ID:        profile.ID,
		RoleID:    profile.RoleID,
		Slug:      profile.Slug,
		Email:     profile.Email,
		FullName:  profile.FullName,
		Phone:     profile.Phone,
		DNI:       profile.DNI,
		AvatarURL: profile.AvatarURL,
		RoleName:  profile.RoleName,
		IsActive:  profile.IsActive,
		IsPremium: profile.IsPremium,
		CreatedAt: profile.CreatedAt,
		UpdatedAt: profile.UpdatedAt,
	}
}
