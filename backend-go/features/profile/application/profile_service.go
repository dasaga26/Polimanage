package application

import (
	"backend-go/features/profile/domain"
	"backend-go/shared/security"

	"github.com/google/uuid"
)

// ======================================================================================
// PROFILE SERVICE (LÓGICA DE NEGOCIO)
// ======================================================================================

type ProfileService struct {
	profileRepo   domain.ProfileRepository
	cryptoService security.CryptoService
}

func NewProfileService(profileRepo domain.ProfileRepository, cryptoService security.CryptoService) *ProfileService {
	return &ProfileService{
		profileRepo:   profileRepo,
		cryptoService: cryptoService,
	}
}

// GetMyProfile obtiene el perfil del usuario autenticado
func (s *ProfileService) GetMyProfile(userID uuid.UUID) (*domain.Profile, error) {
	if userID == uuid.Nil {
		return nil, domain.ErrInvalidUserID
	}

	return s.profileRepo.GetProfileByUserID(userID)
}

// UpdateMyProfile actualiza el perfil del usuario autenticado
func (s *ProfileService) UpdateMyProfile(userID uuid.UUID, data *domain.UpdateProfileData) (*domain.Profile, error) {
	if userID == uuid.Nil {
		return nil, domain.ErrInvalidUserID
	}

	// Actualizar perfil
	if err := s.profileRepo.UpdateProfile(userID, data); err != nil {
		return nil, err
	}

	// Retornar perfil actualizado
	return s.profileRepo.GetProfileByUserID(userID)
}

// ChangePassword cambia la contraseña del usuario autenticado
func (s *ProfileService) ChangePassword(userID uuid.UUID, data *domain.ChangePasswordData) error {
	if userID == uuid.Nil {
		return domain.ErrInvalidUserID
	}

	// Validar que la nueva contraseña cumpla con los requisitos
	if len(data.NewPassword) < 8 {
		return domain.ErrWeakPassword
	}

	// Obtener el hash actual
	currentHash, err := s.profileRepo.GetPasswordHash(userID)
	if err != nil {
		return err
	}

	// Verificar que la contraseña actual sea correcta
	valid, err := s.cryptoService.VerifyPassword(data.CurrentPassword, currentHash)
	if err != nil || !valid {
		return domain.ErrInvalidPassword
	}

	// Hashear la nueva contraseña
	newHash, err := s.cryptoService.HashPassword(data.NewPassword)
	if err != nil {
		return domain.ErrPasswordChangeFailed
	}

	// Actualizar contraseña
	return s.profileRepo.ChangePassword(userID, currentHash, newHash)
}
