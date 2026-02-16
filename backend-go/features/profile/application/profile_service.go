package application

import (
	"backend-go/features/profile/domain"
)

// ======================================================================================
// PROFILE SERVICE (LÓGICA DE NEGOCIO)
// CtrlProfile: getProfile
// ======================================================================================

type ProfileService struct {
	profileRepo domain.ProfileRepository
}

func NewProfileService(profileRepo domain.ProfileRepository) *ProfileService {
	return &ProfileService{
		profileRepo: profileRepo,
	}
}

// GetProfileByUsername obtiene el perfil público de un usuario
func (s *ProfileService) GetProfileByUsername(username string) (*domain.Profile, error) {
	if username == "" {
		return nil, domain.ErrInvalidUsername
	}

	return s.profileRepo.GetProfileByUsername(username)
}
