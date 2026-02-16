package domain

import "errors"

// ======================================================================================
// USER DOMAIN ERRORS (EXCEPCIONES)
// Solo errores relacionados con la entidad User y operaciones CRUD
// Errores de Auth → features/auth/domain/auth_errors.go
// Errores de Profile → features/profile/domain/profile_errors.go
// ======================================================================================

// Errores de Usuario
var (
	ErrUserNotFound      = errors.New("usuario no encontrado")
	ErrUserAlreadyExists = errors.New("ya existe un usuario con ese email")
	ErrUserInactive      = errors.New("cuenta de usuario inactiva")
	ErrUserDeleted       = errors.New("cuenta de usuario eliminada")
)

// Errores de Autorización (RBAC)
var (
	ErrForbidden        = errors.New("acceso prohibido")
	ErrInsufficientRole = errors.New("rol insuficiente para esta operación")
	ErrRoleNotFound     = errors.New("rol no encontrado")
)
