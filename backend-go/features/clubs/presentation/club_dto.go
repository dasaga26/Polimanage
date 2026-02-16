package presentation

import "time"

// CreateClubRequest representa los datos para crear un club
type CreateClubRequest struct {
	OwnerSlug       *string `json:"ownerSlug"`
	Name            string  `json:"name" validate:"required"`
	Description     *string `json:"description"`
	LogoURL         *string `json:"logoUrl"`
	MaxMembers      int     `json:"maxMembers" validate:"required,min=1"`
	MonthlyFeeCents int     `json:"monthlyFeeCents" validate:"min=0"`
	IsActive        bool    `json:"isActive"`
}

// UpdateClubRequest representa los datos para actualizar un club
type UpdateClubRequest struct {
	OwnerSlug       *string `json:"ownerSlug"`
	Name            string  `json:"name" validate:"required"`
	Description     *string `json:"description"`
	LogoURL         *string `json:"logoUrl"`
	MaxMembers      int     `json:"maxMembers" validate:"required,min=1"`
	MonthlyFeeCents int     `json:"monthlyFeeCents" validate:"min=0"`
	Status          string  `json:"status"`
	IsActive        bool    `json:"isActive"`
}

// ClubResponse representa la respuesta de un club
type ClubResponse struct {
	ID              int       `json:"id"`
	OwnerID         *string   `json:"ownerId,omitempty"` // UUID como string
	OwnerSlug       *string   `json:"ownerSlug,omitempty"`
	OwnerName       *string   `json:"ownerName,omitempty"`
	Slug            string    `json:"slug"`
	Name            string    `json:"name"`
	Description     *string   `json:"description"`
	LogoURL         *string   `json:"logoUrl"`
	MaxMembers      int       `json:"maxMembers"`
	MonthlyFeeCents int       `json:"monthlyFeeCents"`
	MonthlyFeeEuros float64   `json:"monthlyFeeEuros"`
	Status          string    `json:"status"`
	IsActive        bool      `json:"isActive"`
	MemberCount     int       `json:"memberCount"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

// AddMemberRequest representa los datos para añadir un miembro
type AddMemberRequest struct {
	UserSlug string `json:"userSlug" validate:"required"`
}

// RenewMembershipRequest representa los datos para renovar una membresía
type RenewMembershipRequest struct {
	CustomerID string `json:"customerId" validate:"required"`
}

// UpdateBillingDateRequest representa los datos para actualizar fecha de cobro
type UpdateBillingDateRequest struct {
	NextBillingDate time.Time `json:"nextBillingDate" validate:"required"`
}

// ClubMembershipResponse representa la respuesta de una membresía
type ClubMembershipResponse struct {
	ID              int        `json:"id"`
	ClubID          int        `json:"clubId"`
	ClubSlug        string     `json:"clubSlug"`
	ClubName        string     `json:"clubName"`
	UserID          string     `json:"userId"` // UUID como string
	UserSlug        string     `json:"userSlug"`
	UserName        string     `json:"userName"`
	UserEmail       string     `json:"userEmail"`
	Status          string     `json:"status"`
	StartDate       time.Time  `json:"startDate"`
	EndDate         *time.Time `json:"endDate"`
	NextBillingDate *time.Time `json:"nextBillingDate,omitempty"`
	PaymentStatus   string     `json:"paymentStatus"`
	IsActive        bool       `json:"isActive"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}

// MessageResponse representa una respuesta simple con mensaje
type MessageResponse struct {
	Message string `json:"message"`
}
