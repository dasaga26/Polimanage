package presentation

import "backend-go/features/users/domain"

type CreateUserRequest struct {
	RoleID   uint    `json:"roleId"`
	Email    string  `json:"email" validate:"required,email"`
	Password string  `json:"password" validate:"required,min=6"`
	FullName string  `json:"fullName" validate:"required"`
	Phone    *string `json:"phone"`
}

type UpdateUserRequest struct {
	RoleID   uint    `json:"roleId"`
	FullName string  `json:"fullName"`
	Phone    *string `json:"phone"`
	IsActive *bool   `json:"isActive"`
}

// RequestToDomain convierte CreateUserRequest a domain.User
func RequestToDomain(req *CreateUserRequest) *domain.User {
	return &domain.User{
		RoleID:       req.RoleID,
		Email:        req.Email,
		PasswordHash: req.Password, // Se pasa tal cual, el servicio lo hashea
		FullName:     req.FullName,
		Phone:        req.Phone,
	}
}

// UpdateRequestToDomain convierte UpdateUserRequest a domain.User
func UpdateRequestToDomain(req *UpdateUserRequest) *domain.User {
	user := &domain.User{
		RoleID:   req.RoleID,
		FullName: req.FullName,
		Phone:    req.Phone,
	}
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}
	return user
}
