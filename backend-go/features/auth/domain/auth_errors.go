package domain

import "errors"

// ======================================================================================
// AUTH DOMAIN ERRORS (EXCEPCIONES)
// ======================================================================================

// Errores de autenticación
var (
	ErrInvalidCredentials = errors.New("credenciales inválidas")
	ErrInvalidPassword    = errors.New("contraseña debe tener al menos 8 caracteres")
	ErrInvalidEmail       = errors.New("email inválido")
	ErrUnauthorized       = errors.New("no autorizado")
)
