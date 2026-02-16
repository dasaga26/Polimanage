package security

// ======================================================================================
// INTERFAZ CRYPTO SERVICE (SHARED - UTILIDAD GLOBAL)
// Servicio compartido para operaciones criptográficas
// Usado por: AUTH (registro/login), USERS (actualizar contraseña)
// ======================================================================================

// CryptoService define el contrato para operaciones criptográficas
// Si quieres cambiar de Argon2 a bcrypt, solo modifica crypto_service_impl.go
type CryptoService interface {
	// HashPassword genera un hash seguro de la contraseña
	HashPassword(password string) (string, error)
	
	// VerifyPassword verifica si la contraseña coincide con el hash
	VerifyPassword(password, hash string) (bool, error)
}
