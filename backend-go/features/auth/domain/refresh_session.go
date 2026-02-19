package domain

import (
	"time"

	"github.com/google/uuid"
)

// ======================================================================================
// REFRESH SESSION - DOMAIN (V2)
// ======================================================================================

// RefreshSessionRepository define el contrato para gestionar sesiones de refresh tokens
type RefreshSessionRepository interface {
	// Create crea una nueva sesión de refresh token
	Create(session *RefreshSessionEntity) error

	// GetByFamilyID busca una sesión por su FamilyID
	GetByFamilyID(familyID uuid.UUID) (*RefreshSessionEntity, error)

	// GetByDeviceID busca una sesión por su DeviceID
	GetByDeviceID(deviceID string) (*RefreshSessionEntity, error)

	// Update actualiza una sesión existente (para rotación)
	Update(session *RefreshSessionEntity) error

	// RevokeSession marca una sesión como revocada
	RevokeSession(sessionID uint, reason string) error

	// RevokeAllUserSessions revoca todas las sesiones de un usuario (logout global)
	RevokeAllUserSessions(userID uuid.UUID) error

	// CleanExpiredSessions elimina sesiones expiradas (cron job)
	CleanExpiredSessions() error

	// GetActiveSessionsByUserID retorna todas las sesiones activas de un usuario
	GetActiveSessionsByUserID(userID uuid.UUID) ([]RefreshSessionEntity, error)
}

// RefreshSessionEntity representa una sesión de refresh token en el dominio
type RefreshSessionEntity struct {
	ID               uint
	UserID           uuid.UUID
	DeviceID         string
	FamilyID         uuid.UUID
	CurrentTokenHash string
	SessionVersion   int
	ExpiresAt        time.Time
	Revoked          bool
	Reason           string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

// IsExpired verifica si la sesión ha expirado
func (s *RefreshSessionEntity) IsExpired() bool {
	return time.Now().After(s.ExpiresAt)
}

// IsValid verifica si la sesión es válida para uso
func (s *RefreshSessionEntity) IsValid() bool {
	return !s.Revoked && !s.IsExpired()
}
