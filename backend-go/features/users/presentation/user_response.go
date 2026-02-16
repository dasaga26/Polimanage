package presentation

import "backend-go/features/users/domain"

type UserResponse struct {
	ID               string  `json:"id"`
	RoleID           uint    `json:"roleId"`
	Slug             string  `json:"slug"`
	Email            string  `json:"email"`
	FullName         string  `json:"fullName"`
	Phone            *string `json:"phone"`
	AvatarURL        *string `json:"avatarUrl"`
	StripeCustomerID *string `json:"stripeCustomerId"`
	IsActive         bool    `json:"isActive"`
	RoleName         string  `json:"roleName"`
	CreatedAt        string  `json:"createdAt"`
	UpdatedAt        string  `json:"updatedAt"`
}

// ToUserResponse convierte de dominio a response DTO
func ToUserResponse(user *domain.User) UserResponse {
	return UserResponse{
		ID:               user.ID.String(),
		RoleID:           user.RoleID,
		Slug:             user.Slug,
		Email:            user.Email,
		FullName:         user.FullName,
		Phone:            user.Phone,
		AvatarURL:        user.AvatarURL,
		StripeCustomerID: user.StripeCustomerID,
		IsActive:         user.IsActive,
		RoleName:         user.RoleName,
		CreatedAt:        user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:        user.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
