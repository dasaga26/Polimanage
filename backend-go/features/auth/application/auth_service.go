package application

import (
	authdomain "backend-go/features/auth/domain"
	userdomain "backend-go/features/users/domain"
	"backend-go/shared/security"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

// ======================================================================================
// AUTH SERVICE (LÓGICA DE NEGOCIO DE AUTENTICACIÓN)
// Controlador: CtrlAuth con register, login, logout
// ======================================================================================

type AuthService struct {
	userRepo userdomain.UserRepository
	crypto   security.CryptoService
	jwt      security.JWTService
	avatar   authdomain.AvatarService
}

func NewAuthService(
	userRepo userdomain.UserRepository,
	crypto security.CryptoService,
	jwt security.JWTService,
	avatar authdomain.AvatarService,
) *AuthService {
	return &AuthService{
		userRepo: userRepo,
		crypto:   crypto,
		jwt:      jwt,
		avatar:   avatar,
	}
}

// RegisterRequest datos para registro
type RegisterRequest struct {
	Email    string
	Password string
	FullName string
	Phone    *string
}

// LoginRequest datos para login
type LoginRequest struct {
	Email    string
	Password string
}

// AuthResponse respuesta de autenticación
type AuthResponse struct {
	User  *userdomain.User
	Token string
}

// Register registra un nuevo usuario
func (s *AuthService) Register(req RegisterRequest) (*AuthResponse, error) {
	// Validar email
	if !isValidEmail(req.Email) {
		return nil, authdomain.ErrInvalidEmail
	}

	// Validar contraseña
	if len(req.Password) < 8 {
		return nil, authdomain.ErrInvalidPassword
	}

	// Verificar si el email ya existe
	exists, err := s.userRepo.EmailExists(req.Email)
	if err != nil {
		return nil, fmt.Errorf("error verificando email: %w", err)
	}
	if exists {
		return nil, userdomain.ErrUserAlreadyExists
	}

	// Hashear contraseña con Argon2id
	hashedPassword, err := s.crypto.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("error hasheando contraseña: %w", err)
	}

	// Generar slug único
	slug := generateSlug(req.Email)

	// Obtener avatar con Pravatar por email
	avatarURL, err := s.avatar.GetAvatarByEmail(req.Email)
	if err != nil {
		// Si falla, usar uno aleatorio
		avatarURL, _ = s.avatar.GetRandomAvatar()
	}

	// Crear usuario con UUID
	user := &userdomain.User{
		ID:           uuid.New(),
		RoleID:       5, // CLIENTE por defecto
		Slug:         slug,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		FullName:     req.FullName,
		Phone:        req.Phone,
		AvatarURL:    &avatarURL,
		IsMember:     false,
		IsActive:     true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// Guardar en BD
	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	// Generar token JWT
	token, err := s.generateTokenForUser(user)
	if err != nil {
		return nil, fmt.Errorf("error generando token: %w", err)
	}

	// Actualizar último login
	now := time.Now()
	user.LastLoginAt = &now
	s.userRepo.Update(user)

	return &AuthResponse{
		User:  user,
		Token: token,
	}, nil
}

// Login autentica un usuario
func (s *AuthService) Login(req LoginRequest) (*AuthResponse, error) {
	// Buscar usuario por email
	user, err := s.userRepo.GetByEmail(req.Email)
	if err != nil {
		if err == userdomain.ErrUserNotFound {
			return nil, authdomain.ErrInvalidCredentials
		}
		return nil, err
	}

	// Verificar si está activo
	if !user.IsActive {
		return nil, userdomain.ErrUserInactive
	}

	// Verificar contraseña con Argon2id
	valid, err := s.crypto.VerifyPassword(req.Password, user.PasswordHash)
	if err != nil {
		return nil, fmt.Errorf("error verificando contraseña: %w", err)
	}
	if !valid {
		return nil, authdomain.ErrInvalidCredentials
	}

	// Generar token JWT
	token, err := s.generateTokenForUser(user)
	if err != nil {
		return nil, fmt.Errorf("error generando token: %w", err)
	}

	// Actualizar último login
	now := time.Now()
	user.LastLoginAt = &now
	s.userRepo.Update(user)

	return &AuthResponse{
		User:  user,
		Token: token,
	}, nil
}

// Logout (en REST JWT es stateless, solo limpieza client-side)
// El servidor no necesita hacer nada, el cliente borra el token
func (s *AuthService) Logout() error {
	// En JWT stateless, el logout es responsabilidad del cliente
	// Opcionalmente podrías implementar una blacklist de tokens
	return nil
}

// RefreshToken renueva un token existente
func (s *AuthService) RefreshToken(oldToken string) (string, error) {
	return s.jwt.RefreshToken(oldToken)
}

// ValidateToken valida un token JWT
func (s *AuthService) ValidateToken(token string) (*security.JWTClaims, error) {
	return s.jwt.ValidateToken(token)
}

// GetCurrentUser obtiene el usuario actual desde el token
// Paso 6 de validación JWT: ¿Usuario sigue existiendo?
func (s *AuthService) GetCurrentUser(token string) (*userdomain.User, error) {
	claims, err := s.jwt.ValidateToken(token)
	if err != nil {
		return nil, err
	}

	return s.userRepo.GetByID(claims.UserID)
}

// generateTokenForUser genera un token JWT para un usuario
func (s *AuthService) generateTokenForUser(user *userdomain.User) (string, error) {
	claims := security.JWTClaims{
		UserID:   user.ID,
		Email:    user.Email,
		RoleID:   user.RoleID,
		RoleName: user.RoleName,
	}

	// Token expira en 24 horas
	return s.jwt.GenerateToken(claims, 24*time.Hour)
}

// generateSlug genera un slug a partir del email
func generateSlug(email string) string {
	parts := strings.Split(email, "@")
	if len(parts) > 0 {
		slug := strings.ToLower(parts[0])
		slug = strings.ReplaceAll(slug, ".", "")
		slug = strings.ReplaceAll(slug, "_", "")
		return slug
	}
	return "user"
}

// isValidEmail valida formato de email (básico)
func isValidEmail(email string) bool {
	return strings.Contains(email, "@") && strings.Contains(email, ".")
}
