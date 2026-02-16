package domain

// ======================================================================================
// INTERFAZ AVATAR SERVICE (DOMINIO)
// ======================================================================================

// AvatarService define el contrato para obtener avatares (Pravatar)
type AvatarService interface {
	// GetRandomAvatar obtiene una URL de avatar aleatorio de Pravatar
	GetRandomAvatar() (string, error)
	
	// GetAvatarByEmail obtiene un avatar basado en el email (determinístico con MD5)
	GetAvatarByEmail(email string) (string, error)
}
