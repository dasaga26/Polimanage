package application

import (
	authdomain "backend-go/features/auth/domain"
	userdomain "backend-go/features/users/domain"
	"backend-go/shared/security"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

// ======================================================================================
// AUTH SERVICE (LÓGICA DE NEGOCIO DE AUTENTICACIÓN) - V2
// Controlador: CtrlAuth con register, login, logout, refresh
// V2: Multi-Device + Refresh Token Rotatorio + Detección de Robo
// ======================================================================================

type AuthService struct {
	userRepo    userdomain.UserRepository
	sessionRepo authdomain.RefreshSessionRepository
	crypto      security.CryptoService
	jwt         security.JWTService
	avatar      authdomain.AvatarService
}

func NewAuthService(
	userRepo userdomain.UserRepository,
	sessionRepo authdomain.RefreshSessionRepository,
	crypto security.CryptoService,
	jwt security.JWTService,
	avatar authdomain.AvatarService,
) *AuthService {
	return &AuthService{
		userRepo:    userRepo,
		sessionRepo: sessionRepo,
		crypto:      crypto,
		jwt:         jwt,
		avatar:      avatar,
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
	DeviceID string // V2: Opcional, si no viene se genera uno nuevo
}

// AuthResponse respuesta de autenticación
type AuthResponse struct {
	User         *userdomain.User
	AccessToken  string
	RefreshToken string // V2: Ahora se retorna para cookies
	DeviceID     string // V2: Retornar al cliente para storage
}

// RefreshRequest solicitud de refresh
type RefreshRequest struct {
	RefreshToken string
}

// RefreshResponse respuesta de refresh
type RefreshResponse struct {
	AccessToken  string
	RefreshToken string
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
		ID:             uuid.New(),
		RoleID:         5, // CLIENTE por defecto
		Slug:           slug,
		Email:          req.Email,
		PasswordHash:   hashedPassword,
		FullName:       req.FullName,
		Phone:          req.Phone,
		AvatarURL:      &avatarURL,
		IsMember:       false,
		IsActive:       true,
		SessionVersion: 1, // V2: Inicializar en 1
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	// Guardar en BD
	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	// Actualizar último login
	now := time.Now()
	user.LastLoginAt = &now
	s.userRepo.Update(user)

	// Generar tokens V2 (sin refresh para el registro, solo login los usa)
	accessToken, err := s.generateAccessTokenForUser(user)
	if err != nil {
		return nil, fmt.Errorf("error generando access token: %w", err)
	}

	return &AuthResponse{
		User:        user,
		AccessToken: accessToken,
	}, nil
}

// Login autentica un usuario y crea una sesión (V2)
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

	// Actualizar último login
	now := time.Now()
	user.LastLoginAt = &now
	s.userRepo.Update(user)

	// Generar DeviceID si no viene
	deviceID := req.DeviceID
	if deviceID == "" {
		deviceID = uuid.New().String()
	}

	// Generar Access Token
	accessToken, err := s.generateAccessTokenForUser(user)
	if err != nil {
		return nil, fmt.Errorf("error generando access token: %w", err)
	}

	// V2: Generar Refresh Token SOLO si el rol lo permite (Admin NO tiene refresh)
	var refreshToken string
	if user.RoleID != 1 { // Si NO es Admin
		refreshToken, err = s.createRefreshSession(user, deviceID)
		if err != nil {
			return nil, fmt.Errorf("error creando sesión de refresh: %w", err)
		}
	}

	return &AuthResponse{
		User:         user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		DeviceID:     deviceID,
	}, nil
}

// Refresh renueva los tokens usando el refresh token (V2 - Rotación)
func (s *AuthService) Refresh(req RefreshRequest) (*RefreshResponse, error) {
	// 1. Validar el Refresh Token JWT
	claims, err := s.jwt.ValidateRefreshToken(req.RefreshToken)
	if err != nil {
		if errors.Is(err, security.ErrTokenExpired) {
			return nil, fmt.Errorf("refresh token expirado")
		}
		return nil, fmt.Errorf("refresh token inválido: %w", err)
	}

	// 2. Buscar sesión en DB por FamilyID
	session, err := s.sessionRepo.GetByFamilyID(claims.FamilyID)
	if err != nil {
		return nil, fmt.Errorf("error buscando sesión: %w", err)
	}
	if session == nil {
		return nil, fmt.Errorf("sesión no encontrada")
	}

	// 3. CHECK 1: ¿Session.Revoked == true?
	// 🚨 ALERTA: Intento de usar token revocado (posible hacking)
	if session.Revoked {
		return nil, fmt.Errorf("sesión revocada: %s", session.Reason)
	}

	// 4. CHECK 2 (Detección de Robo): ¿Hash(TokenEntrante) != Session.CurrentTokenHash?
	// 🚨 ALERTA CRÍTICA: Token reusado (alguien usó el token antes)
	incomingHash := s.jwt.HashToken(req.RefreshToken)
	if incomingHash != session.CurrentTokenHash {
		// ROBO DETECTADO: Revocar la sesión inmediatamente
		s.sessionRepo.RevokeSession(session.ID, "reuse_detection")
		return nil, fmt.Errorf("detección de robo: token reusado")
	}

	// 5. CHECK 3 (Logout Global): ¿Session.SessionVersion != User.SessionVersion?
	user, err := s.userRepo.GetByID(session.UserID)
	if err != nil {
		return nil, fmt.Errorf("error obteniendo usuario: %w", err)
	}
	if session.SessionVersion != user.SessionVersion {
		// Logout global activado (cambio de contraseña, etc.)
		s.sessionRepo.RevokeSession(session.ID, "global_logout")
		return nil, fmt.Errorf("sesión invalidada globalmente")
	}

	// 6. ÉXITO: Rotar tokens (Sliding Window)
	// Generar nuevo Access Token
	accessToken, err := s.generateAccessTokenForUser(user)
	if err != nil {
		return nil, fmt.Errorf("error generando access token: %w", err)
	}

	// Generar nuevo Refresh Token (mismo FamilyID, nuevo token)
	refreshTokenExpiry := s.jwt.GetRefreshTokenExpiry(user.RoleID)
	newRefreshToken, newHash, err := s.jwt.GenerateRefreshToken(security.RefreshTokenClaims{
		UserID:         user.ID,
		FamilyID:       session.FamilyID,
		DeviceID:       session.DeviceID,
		SessionVersion: user.SessionVersion,
	}, refreshTokenExpiry)
	if err != nil {
		return nil, fmt.Errorf("error generando refresh token: %w", err)
	}

	// Actualizar sesión en DB (rotación)
	session.CurrentTokenHash = newHash
	session.ExpiresAt = time.Now().Add(refreshTokenExpiry)
	session.UpdatedAt = time.Now()
	if err := s.sessionRepo.Update(session); err != nil {
		return nil, fmt.Errorf("error actualizando sesión: %w", err)
	}

	return &RefreshResponse{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
	}, nil
}

// Logout cierra la sesión del dispositivo actual (V2)
func (s *AuthService) Logout(deviceID string) error {
	if deviceID == "" {
		return fmt.Errorf("deviceID requerido")
	}

	session, err := s.sessionRepo.GetByDeviceID(deviceID)
	if err != nil {
		return fmt.Errorf("error buscando sesión: %w", err)
	}
	if session == nil {
		// Sesión no existe, ya está cerrada
		return nil
	}

	// Marcar como revocada
	return s.sessionRepo.RevokeSession(session.ID, "logout")
}

// LogoutAllDevices cierra todas las sesiones del usuario (V2 - Logout Global)
func (s *AuthService) LogoutAllDevices(userID uuid.UUID) error {
	// Incrementar SessionVersion para invalidar todas las sesiones
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return err
	}

	user.SessionVersion++
	if err := s.userRepo.Update(user); err != nil {
		return err
	}

	// Revocar todas las sesiones activas
	return s.sessionRepo.RevokeAllUserSessions(userID)
}

// ValidateToken valida un access token
func (s *AuthService) ValidateToken(token string) (*security.JWTClaims, error) {
	return s.jwt.ValidateAccessToken(token)
}

// GetCurrentUser obtiene el usuario actual desde el token
// Paso 6 de validación JWT: ¿Usuario sigue existiendo?
func (s *AuthService) GetCurrentUser(token string) (*userdomain.User, error) {
	claims, err := s.jwt.ValidateAccessToken(token)
	if err != nil {
		return nil, err
	}

	// Obtener usuario
	user, err := s.userRepo.GetByID(claims.UserID)
	if err != nil {
		return nil, err
	}

	// Verificar SessionVersion (logout global)
	if claims.SessionVersion != user.SessionVersion {
		return nil, fmt.Errorf("sesión invalidada globalmente")
	}

	return user, nil
}

// GetActiveSessions retorna las sesiones activas de un usuario
func (s *AuthService) GetActiveSessions(userID uuid.UUID) ([]authdomain.RefreshSessionEntity, error) {
	return s.sessionRepo.GetActiveSessionsByUserID(userID)
}

// ======================================================================================
// UTILIDADES PRIVADAS
// ======================================================================================

// generateAccessTokenForUser genera un Access Token para un usuario
func (s *AuthService) generateAccessTokenForUser(user *userdomain.User) (string, error) {
	claims := security.JWTClaims{
		UserID:         user.ID,
		Email:          user.Email,
		RoleID:         user.RoleID,
		RoleName:       user.RoleName,
		SessionVersion: user.SessionVersion,
	}

	// Token expira según el rol
	expiry := s.jwt.GetAccessTokenExpiry(user.RoleID)
	return s.jwt.GenerateAccessToken(claims, expiry)
}

// createRefreshSession crea una nueva sesión de refresh token
func (s *AuthService) createRefreshSession(user *userdomain.User, deviceID string) (string, error) {
	// Generar FamilyID para esta nueva cadena de rotación
	familyID := uuid.New()

	// Generar Refresh Token
	refreshTokenExpiry := s.jwt.GetRefreshTokenExpiry(user.RoleID)
	refreshToken, tokenHash, err := s.jwt.GenerateRefreshToken(security.RefreshTokenClaims{
		UserID:         user.ID,
		FamilyID:       familyID,
		DeviceID:       deviceID,
		SessionVersion: user.SessionVersion,
	}, refreshTokenExpiry)
	if err != nil {
		return "", err
	}

	// Crear sesión en DB
	session := &authdomain.RefreshSessionEntity{
		UserID:           user.ID,
		DeviceID:         deviceID,
		FamilyID:         familyID,
		CurrentTokenHash: tokenHash,
		SessionVersion:   user.SessionVersion,
		ExpiresAt:        time.Now().Add(refreshTokenExpiry),
		Revoked:          false,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	if err := s.sessionRepo.Create(session); err != nil {
		return "", fmt.Errorf("error creando sesión: %w", err)
	}

	return refreshToken, nil
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
