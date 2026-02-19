package domain

import (
	"time"

	"github.com/google/uuid"
)

// ======================================================================================
// ENTIDAD PROFILE (DOMINIO)
// Representa el perfil del usuario autenticado
// ======================================================================================

// Profile representa el perfil completo del usuario autenticado
type Profile struct {
	ID        uuid.UUID
	RoleID    uint
	Slug      string
	Email     string
	FullName  string
	Phone     *string
	DNI       *string
	AvatarURL *string
	RoleName  string
	IsActive  bool
	IsPremium bool // Basado en IsMember
	CreatedAt time.Time
	UpdatedAt time.Time
}

// UpdateProfileData contiene los datos actualizables del perfil
type UpdateProfileData struct {
	FullName  *string
	Phone     *string
	DNI       *string
	AvatarURL *string
}

// ChangePasswordData contiene los datos para cambiar contraseña
type ChangePasswordData struct {
	CurrentPassword string
	NewPassword     string
}
