package infrastructure

import (
	"backend-go/features/auth/domain"
	"backend-go/shared/database"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ======================================================================================
// REFRESH SESSION REPOSITORY - INFRASTRUCTURE (V2)
// ======================================================================================

type RefreshSessionRepositoryImpl struct {
	db *gorm.DB
}

func NewRefreshSessionRepository(db *gorm.DB) domain.RefreshSessionRepository {
	return &RefreshSessionRepositoryImpl{db: db}
}

// Create crea una nueva sesión de refresh token
func (r *RefreshSessionRepositoryImpl) Create(session *domain.RefreshSessionEntity) error {
	dbSession := toDBModel(session)
	result := r.db.Create(dbSession)
	if result.Error != nil {
		return result.Error
	}
	session.ID = dbSession.ID
	session.CreatedAt = dbSession.CreatedAt
	session.UpdatedAt = dbSession.UpdatedAt
	return nil
}

// GetByFamilyID busca una sesión por su FamilyID
func (r *RefreshSessionRepositoryImpl) GetByFamilyID(familyID uuid.UUID) (*domain.RefreshSessionEntity, error) {
	var dbSession database.RefreshSession
	result := r.db.Where("family_id = ?", familyID).First(&dbSession)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}
	return toDomainEntity(&dbSession), nil
}

// GetByDeviceID busca una sesión por su DeviceID
func (r *RefreshSessionRepositoryImpl) GetByDeviceID(deviceID string) (*domain.RefreshSessionEntity, error) {
	var dbSession database.RefreshSession
	result := r.db.Where("device_id = ?", deviceID).First(&dbSession)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}
	return toDomainEntity(&dbSession), nil
}

// Update actualiza una sesión existente (para rotación)
func (r *RefreshSessionRepositoryImpl) Update(session *domain.RefreshSessionEntity) error {
	dbSession := toDBModel(session)
	result := r.db.Model(&database.RefreshSession{}).
		Where("id = ?", session.ID).
		Updates(map[string]interface{}{
			"current_token_hash": dbSession.CurrentTokenHash,
			"expires_at":         dbSession.ExpiresAt,
			"session_version":    dbSession.SessionVersion,
			"revoked":            dbSession.Revoked,
			"reason":             dbSession.Reason,
			"updated_at":         time.Now(),
		})
	return result.Error
}

// RevokeSession marca una sesión como revocada
func (r *RefreshSessionRepositoryImpl) RevokeSession(sessionID uint, reason string) error {
	result := r.db.Model(&database.RefreshSession{}).
		Where("id = ?", sessionID).
		Updates(map[string]interface{}{
			"revoked":    true,
			"reason":     reason,
			"updated_at": time.Now(),
		})
	return result.Error
}

// RevokeAllUserSessions revoca todas las sesiones de un usuario (logout global)
func (r *RefreshSessionRepositoryImpl) RevokeAllUserSessions(userID uuid.UUID) error {
	result := r.db.Model(&database.RefreshSession{}).
		Where("user_id = ? AND revoked = false", userID).
		Updates(map[string]interface{}{
			"revoked":    true,
			"reason":     "global_logout",
			"updated_at": time.Now(),
		})
	return result.Error
}

// CleanExpiredSessions elimina sesiones expiradas (cron job)
func (r *RefreshSessionRepositoryImpl) CleanExpiredSessions() error {
	// Eliminar sesiones revocadas o expiradas hace más de 7 días
	cutoffDate := time.Now().AddDate(0, 0, -7)
	result := r.db.Where("(revoked = true OR expires_at < ?) AND updated_at < ?", time.Now(), cutoffDate).
		Delete(&database.RefreshSession{})
	return result.Error
}

// GetActiveSessionsByUserID retorna todas las sesiones activas de un usuario
func (r *RefreshSessionRepositoryImpl) GetActiveSessionsByUserID(userID uuid.UUID) ([]domain.RefreshSessionEntity, error) {
	var dbSessions []database.RefreshSession
	result := r.db.Where("user_id = ? AND revoked = false AND expires_at > ?", userID, time.Now()).
		Find(&dbSessions)
	if result.Error != nil {
		return nil, result.Error
	}

	sessions := make([]domain.RefreshSessionEntity, len(dbSessions))
	for i, dbSession := range dbSessions {
		sessions[i] = *toDomainEntity(&dbSession)
	}
	return sessions, nil
}

// ======================================================================================
// MAPPERS
// ======================================================================================

func toDomainEntity(dbSession *database.RefreshSession) *domain.RefreshSessionEntity {
	return &domain.RefreshSessionEntity{
		ID:               dbSession.ID,
		UserID:           dbSession.UserID,
		DeviceID:         dbSession.DeviceID,
		FamilyID:         dbSession.FamilyID,
		CurrentTokenHash: dbSession.CurrentTokenHash,
		SessionVersion:   dbSession.SessionVersion,
		ExpiresAt:        dbSession.ExpiresAt,
		Revoked:          dbSession.Revoked,
		Reason:           dbSession.Reason,
		CreatedAt:        dbSession.CreatedAt,
		UpdatedAt:        dbSession.UpdatedAt,
	}
}

func toDBModel(session *domain.RefreshSessionEntity) *database.RefreshSession {
	return &database.RefreshSession{
		ID:               session.ID,
		UserID:           session.UserID,
		DeviceID:         session.DeviceID,
		FamilyID:         session.FamilyID,
		CurrentTokenHash: session.CurrentTokenHash,
		SessionVersion:   session.SessionVersion,
		ExpiresAt:        session.ExpiresAt,
		Revoked:          session.Revoked,
		Reason:           session.Reason,
		CreatedAt:        session.CreatedAt,
		UpdatedAt:        session.UpdatedAt,
	}
}
