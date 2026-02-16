package infrastructure

import (
	"backend-go/features/roles/domain"
	"backend-go/shared/database"
)

func ToRoleDomain(dbRole *database.Role) domain.Role {
	return domain.Role{
		ID:          dbRole.ID,
		Name:        dbRole.Name,
		Description: dbRole.Description,
	}
}
