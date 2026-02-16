package domain

import (
	"time"

	"github.com/google/uuid"
)

// ClubMembership representa la membresía de un usuario a un club
type ClubMembership struct {
	ID              int
	ClubID          int
	UserID          uuid.UUID
	Status          string
	StartDate       time.Time
	EndDate         *time.Time
	NextBillingDate *time.Time
	PaymentStatus   string
	LastPaymentID   *int
	IsActive        bool
	CreatedAt       time.Time
	UpdatedAt       time.Time

	// Relaciones expandidas
	ClubName  string
	ClubSlug  string
	UserName  string
	UserEmail string
	UserSlug  string
}

// Estados de membresía
const (
	MembershipStatusActive    = "ACTIVE"
	MembershipStatusSuspended = "SUSPENDED"
	MembershipStatusExpired   = "EXPIRED"
	MembershipStatusCancelled = "CANCELLED"
)

// Estados de pago de membresías
const (
	PaymentStatusUpToDate = "UP_TO_DATE"
	PaymentStatusPastDue  = "PAST_DUE"
)

// ClubMembershipRepository define el contrato de persistencia para membresías
type ClubMembershipRepository interface {
	FindByID(id int) (*ClubMembership, error)
	FindByClub(clubID int) ([]ClubMembership, error)
	FindByUser(userID uuid.UUID) ([]ClubMembership, error)
	Create(membership *ClubMembership) error
	Update(membership *ClubMembership) error
	Delete(id int) error
	CheckExists(clubID int, userID uuid.UUID) (bool, error)
	Count(clubID int) (int, error)
}
