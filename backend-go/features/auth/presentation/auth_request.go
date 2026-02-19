package presentation

// ======================================================================================
// AUTH REQUEST DTOs - V2
// ======================================================================================

// RegisterRequest datos para registro
type RegisterRequest struct {
	Email    string  `json:"email" validate:"required,email"`
	Password string  `json:"password" validate:"required,min=8"`
	FullName string  `json:"fullName" validate:"required"`
	Phone    *string `json:"phone"`
}

// LoginRequest datos para login (V2)
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
	DeviceID string `json:"deviceId"` // V2: Opcional, identificador único del dispositivo
}

// LogoutRequest datos para logout (V2)
type LogoutRequest struct {
	DeviceID string `json:"deviceId"` // V2: Para revocar sesión específica
}

// RefreshRequest datos para refresh
type RefreshRequest struct {
	RefreshToken string `json:"refreshToken"` // Viene de cookie, no del body
}
