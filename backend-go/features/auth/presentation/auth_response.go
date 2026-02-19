package presentation

import userpresentation "backend-go/features/users/presentation"

// ======================================================================================
// AUTH RESPONSE DTOs - V2
// serializer_user utilizado en CtrlAuth
// ======================================================================================

// AuthResponse respuesta de autenticación (login/register) - V2
type AuthResponse struct {
	User        userpresentation.UserResponse `json:"user"`
	AccessToken string                        `json:"accessToken"`        // V2: Renombrado de 'token'
	DeviceID    string                        `json:"deviceId,omitempty"` // V2: Retornar al cliente
}

// RefreshResponse respuesta de refresh token - V2
type RefreshResponse struct {
	AccessToken string `json:"accessToken"`
}
