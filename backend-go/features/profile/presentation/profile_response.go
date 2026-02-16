package presentation

import "backend-go/features/profile/domain"

// ======================================================================================
// PROFILE RESPONSE DTOs
// serializer_profile anidado en Comments, Productes_author
// ======================================================================================

// ProfileResponse representa el DTO del perfil público
type ProfileResponse struct {
	Username  string  `json:"username"`
	FullName  string  `json:"fullName"`
	AvatarURL *string `json:"avatarUrl"`
	Bio       *string `json:"bio"`
}

// ToProfileResponse convierte de dominio a response DTO
func ToProfileResponse(profile *domain.Profile) ProfileResponse {
	return ProfileResponse{
		Username:  profile.Username,
		FullName:  profile.FullName,
		AvatarURL: profile.AvatarURL,
		Bio:       profile.Bio,
	}
}
