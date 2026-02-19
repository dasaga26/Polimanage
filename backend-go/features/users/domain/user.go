package domain

import (
	"time"

	"github.com/google/uuid"
)

// ======================================================================================
// ENTIDAD USER (DOMINIO PURO)
// ======================================================================================

// User representa un usuario del sistema
type User struct {
	ID               uuid.UUID
	RoleID           uint
	Slug             string
	Email            string
	PasswordHash     string
	FullName         string
	Phone            *string
	DNI              *string
	AvatarURL        *string
	StripeCustomerID *string
	IsMember         bool
	IsActive         bool
	SessionVersion   int // V2: Para logout global
	LastLoginAt      *time.Time
	CreatedAt        time.Time
	UpdatedAt        time.Time

	// Relación (solo para lectura)
	RoleName string
}
