package infrastructure

import (
	"backend-go/features/roles/domain"
	"backend-go/shared/database"

	"gorm.io/gorm"
)

type RoleRepositoryGORM struct {
	db *gorm.DB
}

func NewRoleRepository(db *gorm.DB) domain.RoleRepository {
	return &RoleRepositoryGORM{db: db}
}

func (r *RoleRepositoryGORM) GetAll() ([]domain.Role, error) {
	var dbRoles []database.Role

	if err := r.db.Find(&dbRoles).Error; err != nil {
		return nil, err
	}

	roles := make([]domain.Role, len(dbRoles))
	for i, dbRole := range dbRoles {
		roles[i] = ToRoleDomain(&dbRole)
	}

	return roles, nil
}
