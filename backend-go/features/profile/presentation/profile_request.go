package presentation

// ======================================================================================
// PROFILE REQUEST DTOs
// ======================================================================================

// UpdateProfileRequest representa la solicitud para actualizar el perfil
type UpdateProfileRequest struct {
	FullName string  `json:"fullName" validate:"omitempty,min=3,max=100"`
	Phone    *string `json:"phone" validate:"omitempty,min=10,max=20"`
	DNI      *string `json:"dni" validate:"omitempty,min=8,max=20"`
}

// ChangePasswordRequest representa la solicitud para cambiar contraseña
type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword" validate:"required,min=8"`
	NewPassword     string `json:"newPassword" validate:"required,min=8"`
	ConfirmPassword string `json:"confirmPassword" validate:"required,min=8,eqfield=NewPassword"`
}
