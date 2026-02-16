package security

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"fmt"
	"strings"

	"golang.org/x/crypto/argon2"
)

// ======================================================================================
// IMPLEMENTACIÓN DE CRYPTOSERVICE CON ARGON2ID
// 🔒 Si quieres cambiar a bcrypt, reemplaza esta implementación
// ======================================================================================

type Argon2CryptoService struct {
	memory      uint32
	iterations  uint32
	parallelism uint8
	saltLength  uint32
	keyLength   uint32
}

// NewArgon2CryptoService crea una nueva instancia del servicio de criptografía
func NewArgon2CryptoService() *Argon2CryptoService {
	return &Argon2CryptoService{
		memory:      64 * 1024, // 64 MB
		iterations:  3,
		parallelism: 2,
		saltLength:  16,
		keyLength:   32,
	}
}

// HashPassword genera un hash Argon2id de la contraseña
func (s *Argon2CryptoService) HashPassword(password string) (string, error) {
	// Generar salt aleatorio
	salt := make([]byte, s.saltLength)
	if _, err := rand.Read(salt); err != nil {
		return "", fmt.Errorf("error generando salt: %w", err)
	}

	// Generar hash
	hash := argon2.IDKey(
		[]byte(password),
		salt,
		s.iterations,
		s.memory,
		s.parallelism,
		s.keyLength,
	)

	// Codificar en formato: $argon2id$v=19$m=65536,t=3,p=2$salt$hash
	b64Salt := base64.RawStdEncoding.EncodeToString(salt)
	b64Hash := base64.RawStdEncoding.EncodeToString(hash)

	encodedHash := fmt.Sprintf(
		"$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s",
		argon2.Version,
		s.memory,
		s.iterations,
		s.parallelism,
		b64Salt,
		b64Hash,
	)

	return encodedHash, nil
}

// VerifyPassword verifica si una contraseña coincide con el hash
func (s *Argon2CryptoService) VerifyPassword(password, encodedHash string) (bool, error) {
	// Parsear el hash codificado
	parts := strings.Split(encodedHash, "$")
	if len(parts) != 6 {
		return false, errors.New("hash inválido: formato incorrecto")
	}

	var version int
	var memory, iterations uint32
	var parallelism uint8

	// Parsear parámetros
	_, err := fmt.Sscanf(parts[2], "v=%d", &version)
	if err != nil {
		return false, fmt.Errorf("error parseando versión: %w", err)
	}

	_, err = fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &memory, &iterations, &parallelism)
	if err != nil {
		return false, fmt.Errorf("error parseando parámetros: %w", err)
	}

	// Decodificar salt y hash
	salt, err := base64.RawStdEncoding.DecodeString(parts[4])
	if err != nil {
		return false, fmt.Errorf("error decodificando salt: %w", err)
	}

	expectedHash, err := base64.RawStdEncoding.DecodeString(parts[5])
	if err != nil {
		return false, fmt.Errorf("error decodificando hash: %w", err)
	}

	// Generar hash con los mismos parámetros
	hash := argon2.IDKey(
		[]byte(password),
		salt,
		iterations,
		memory,
		parallelism,
		uint32(len(expectedHash)),
	)

	// Comparación constante en tiempo (timing-safe)
	if subtle.ConstantTimeCompare(hash, expectedHash) == 1 {
		return true, nil
	}

	return false, nil
}
