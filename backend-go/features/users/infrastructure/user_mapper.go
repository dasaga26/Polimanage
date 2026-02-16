package infrastructure

import (
	"backend-go/features/users/domain"
	"backend-go/shared/database"
)

// UserMapper convierte entre modelos de BD y dominio
type UserMapper struct{}

func NewUserMapper() *UserMapper {
	return &UserMapper{}
}

func (m *UserMapper) ToDomain(dbUser *database.User) *domain.User {
	var phone *string
	if dbUser.Phone != nil {
		phone = dbUser.Phone
	}

	var avatarURL *string
	if dbUser.AvatarURL != nil {
		avatarURL = dbUser.AvatarURL
	}

	var stripeID *string
	if dbUser.StripeCustomerID != nil {
		stripeID = dbUser.StripeCustomerID
	}

	roleName := ""
	if dbUser.Role.Name != "" {
		roleName = dbUser.Role.Name
	}

	return &domain.User{
		ID:               dbUser.ID,
		RoleID:           dbUser.RoleID,
		Slug:             dbUser.Slug,
		Email:            dbUser.Email,
		PasswordHash:     dbUser.PasswordHash,
		FullName:         dbUser.FullName,
		Phone:            phone,
		AvatarURL:        avatarURL,
		StripeCustomerID: stripeID,
		IsActive:         dbUser.IsActive,
		LastLoginAt:      dbUser.LastLoginAt,
		CreatedAt:        dbUser.CreatedAt,
		UpdatedAt:        dbUser.UpdatedAt,
		RoleName:         roleName,
	}
}

func (m *UserMapper) ToDatabase(domainUser *domain.User) *database.User {
	return &database.User{
		ID:               domainUser.ID,
		RoleID:           domainUser.RoleID,
		Slug:             domainUser.Slug,
		Email:            domainUser.Email,
		PasswordHash:     domainUser.PasswordHash,
		FullName:         domainUser.FullName,
		Phone:            domainUser.Phone,
		AvatarURL:        domainUser.AvatarURL,
		StripeCustomerID: domainUser.StripeCustomerID,
		IsActive:         domainUser.IsActive,
		LastLoginAt:      domainUser.LastLoginAt,
	}
}
