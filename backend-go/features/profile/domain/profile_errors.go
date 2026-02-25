package domain

import "errors"

// ======================================================================================
// PROFILE DOMAIN ERRORS (EXCEPCIONES)
// ======================================================================================

// Errores de perfil
var (
	ErrProfileNotFound      = errors.New("perfil no encontrado")
	ErrInvalidUserID        = errors.New("ID de usuario inválido")
	ErrInvalidPassword      = errors.New("contraseña actual incorrecta")
	ErrWeakPassword         = errors.New("la contraseña debe tener al menos 8 caracteres")
	ErrUpdateFailed         = errors.New("error al actualizar el perfil")
	ErrPasswordChangeFailed = errors.New("error al cambiar la contraseña")
	ErrAvatarUploadFailed   = errors.New("error al subir el avatar")
	ErrInvalidFileType      = errors.New("tipo de archivo no permitido")
	ErrFileTooLarge         = errors.New("el archivo es demasiado grande")
)
