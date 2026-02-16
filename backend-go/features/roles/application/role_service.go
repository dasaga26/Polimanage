package application

import "backend-go/features/roles/domain"

type RoleService struct {
	repo domain.RoleRepository
}

func NewRoleService(repo domain.RoleRepository) *RoleService {
	return &RoleService{repo: repo}
}

func (s *RoleService) GetAllRoles() ([]domain.Role, error) {
	return s.repo.GetAll()
}
