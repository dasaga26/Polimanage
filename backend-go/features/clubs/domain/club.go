package domain

import (
	"backend-go/shared/pagination"
	"time"

	"github.com/google/uuid"
)

// Club representa un club deportivo o social
type Club struct {
	ID              int
	OwnerID         *uuid.UUID
	Slug            string
	Name            string
	Description     *string
	LogoURL         *string
	MaxMembers      int
	MonthlyFeeCents int
	Status          string
	IsActive        bool
	CreatedAt       time.Time
	UpdatedAt       time.Time

	// Relaciones expandidas
	OwnerSlug   *string
	OwnerName   *string
	MemberCount int
}

// Estados del club
const (
	ClubStatusActive   = "ACTIVE"
	ClubStatusInactive = "INACTIVE"
	ClubStatusFull     = "FULL"
)

// ClubRepository define el contrato de persistencia para clubs
type ClubRepository interface {
	FindAll() ([]Club, error)
	FindAllPaginated(params pagination.PaginationParams) ([]Club, *pagination.PaginationMeta, error)
	FindByID(id int) (*Club, error)
	FindBySlug(slug string) (*Club, error)
	Create(club *Club) error
	Update(club *Club) error
	Delete(id int) error
	DeleteBySlug(slug string) error
	CountMembers(clubID int) (int, error)
}
