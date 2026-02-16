package domain

type RoleRepository interface {
	GetAll() ([]Role, error)
}
