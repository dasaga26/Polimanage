package domain

import "errors"

// ======================================================================================
// PROFILE DOMAIN ERRORS (EXCEPCIONES)
// ======================================================================================

// Errores de perfil
var (
	ErrProfileNotFound = errors.New("perfil no encontrado")
	ErrInvalidUsername = errors.New("nombre de usuario inválido")
)
