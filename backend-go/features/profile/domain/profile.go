package domain

import (
	"time"

	"github.com/google/uuid"
)

// ======================================================================================
// ENTIDAD PROFILE (DOMINIO)
// Representa el perfil público de un usuario
// ======================================================================================

// Profile representa el perfil público de un usuario
// serializer_profile anidado en Comments, Productes_author
type Profile struct {
	UserID    uuid.UUID
	Username  string
	FullName  string
	AvatarURL *string
	Bio       *string
	CreatedAt time.Time
}
