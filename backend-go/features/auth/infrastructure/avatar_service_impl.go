package infrastructure

import (
	"crypto/md5"
	"fmt"
)

// ======================================================================================
// IMPLEMENTACIÓN DE AVATARSERVICE CON PRAVATAR.CC (INFRAESTRUCTURA)
// ======================================================================================

type PravatarService struct {
	baseURL string
}

// NewPravatarService crea una nueva instancia del servicio de avatares
func NewPravatarService() *PravatarService {
	return &PravatarService{
		baseURL: "https://i.pravatar.cc",
	}
}

// GetRandomAvatar obtiene una URL de avatar aleatorio
func (s *PravatarService) GetRandomAvatar() (string, error) {
	return fmt.Sprintf("%s/150?img=%d", s.baseURL, 1), nil
}

// GetAvatarByEmail genera un avatar determinístico basado en el email (MD5 hash)
func (s *PravatarService) GetAvatarByEmail(email string) (string, error) {
	// Generar hash MD5 del email para obtener un número determinístico
	hash := md5.Sum([]byte(email))
	
	// Convertir los primeros 4 bytes a un número entre 1 y 70 (pravatar tiene 70 avatares)
	num := (uint32(hash[0])<<24 | uint32(hash[1])<<16 | uint32(hash[2])<<8 | uint32(hash[3])) % 70 + 1
	
	return fmt.Sprintf("%s/150?img=%d", s.baseURL, num), nil
}
