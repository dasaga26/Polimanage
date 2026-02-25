package domain

import "github.com/google/uuid"

// ======================================================================================
// INTERFAZ PROFILE REPOSITORY (DOMINIO)
// ======================================================================================

// ProfileRepository define el contrato para operaciones de perfil
type ProfileRepository interface {
	// GetProfileByUserID obtiene el perfil del usuario por ID
	GetProfileByUserID(userID uuid.UUID) (*Profile, error)

	// UpdateProfile actualiza la información del perfil
	UpdateProfile(userID uuid.UUID, data *UpdateProfileData) error

	// ChangePassword cambia la contraseña del usuario
	ChangePassword(userID uuid.UUID, currentPasswordHash, newPasswordHash string) error

	// GetPasswordHash obtiene el hash de la contraseña del usuario
	GetPasswordHash(userID uuid.UUID) (string, error)

	// BumpSessionAndRevokeSessions incrementa el SessionVersion del usuario e invalida
	// todas sus sesiones activas. Se llama tras un cambio de contraseña.
	BumpSessionAndRevokeSessions(userID uuid.UUID) error
}
