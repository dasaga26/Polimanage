package presentation

import userpresentation "backend-go/features/users/presentation"

// ======================================================================================
// AUTH RESPONSE DTOs
// serializer_user utilizado en CtrlAuth
// ======================================================================================

// AuthResponse respuesta de autenticación (login/register)
type AuthResponse struct {
	User  userpresentation.UserResponse `json:"user"`
	Token string                         `json:"token"`
}
