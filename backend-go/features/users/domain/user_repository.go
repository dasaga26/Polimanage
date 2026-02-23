package domain

import (
	"backend-go/shared/pagination"

	"github.com/google/uuid"
)

// ======================================================================================
// INTERFAZ DE REPOSITORIO (DOMINIO)
// ======================================================================================

// UserRepository define el contrato de persistencia
type UserRepository interface {
	// Consultas básicas
	GetAll() ([]User, error)
	GetByID(id uuid.UUID) (*User, error)
	GetByEmail(email string) (*User, error)
	GetBySlug(slug string) (*User, error)
	GetByRole(roleID uint) ([]User, error)

	// Consultas paginadas
	FindAllPaginated(params pagination.PaginationParams) ([]User, *pagination.PaginationMeta, error)

	// Comandos
	Create(user *User) error
	Update(user *User) error
	Delete(id uuid.UUID) error

	// Utilidades
	EmailExists(email string) (bool, error)
	SlugExists(slug string) (bool, error)
}
