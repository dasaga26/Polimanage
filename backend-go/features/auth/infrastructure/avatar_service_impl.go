package infrastructure

import (
	"fmt"
	"math/rand"
	"net/url"
	"time"
)

// ======================================================================================
// IMPLEMENTACIÓN DE AVATARSERVICE CON DICEBEAR.COM (INFRAESTRUCTURA)
// ======================================================================================

type DiceBearService struct {
	baseURL string
	style   string
}

// NewDiceBearService crea una nueva instancia del servicio de avatares
func NewDiceBearService() *DiceBearService {
	return &DiceBearService{
		baseURL: "https://api.dicebear.com/7.x",
		style:   "avataaars", // Estilo de avatar (puede ser: avataaars, bottts, personas, initials, etc.)
	}
}

// GetRandomAvatar obtiene una URL de avatar aleatorio
func (s *DiceBearService) GetRandomAvatar() (string, error) {
	// Generar una semilla aleatoria para obtener un avatar único
	rand.Seed(time.Now().UnixNano())
	seed := rand.Intn(1000000)
	return fmt.Sprintf("%s/%s/svg?seed=%d", s.baseURL, s.style, seed), nil
}

// GetAvatarByEmail genera un avatar determinístico basado en el email
func (s *DiceBearService) GetAvatarByEmail(email string) (string, error) {
	// Usar el email como seed para generar un avatar determinístico
	// URL encode del email para evitar problemas con caracteres especiales
	encodedEmail := url.QueryEscape(email)
	return fmt.Sprintf("%s/%s/svg?seed=%s", s.baseURL, s.style, encodedEmail), nil
}
