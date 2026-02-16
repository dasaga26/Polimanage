package presentation

// ======================================================================================
// AUTH REQUEST DTOs
// ======================================================================================

// RegisterRequest datos para registro
type RegisterRequest struct {
	Email    string  `json:"email" validate:"required,email"`
	Password string  `json:"password" validate:"required,min=8"`
	FullName string  `json:"fullName" validate:"required"`
	Phone    *string `json:"phone"`
}

// LoginRequest datos para login
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}
