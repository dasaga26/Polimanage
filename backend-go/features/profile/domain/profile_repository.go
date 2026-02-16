package domain

// ======================================================================================
// INTERFAZ PROFILE REPOSITORY (DOMINIO)
// ======================================================================================

// ProfileRepository define el contrato para operaciones de perfil
type ProfileRepository interface {
	// GetProfileByUsername obtiene el perfil de un usuario por username/slug
	GetProfileByUsername(username string) (*Profile, error)
}
