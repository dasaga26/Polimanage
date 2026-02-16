package application

import (
	"backend-go/features/users/domain"
	"backend-go/shared/security"
	"errors"

	"github.com/google/uuid"
)

// ======================================================================================
// USER SERVICE (LÓGICA DE NEGOCIO)
// CtrlUser: getUser, update, updatePassword
// ======================================================================================

type UserService struct {
	repo   domain.UserRepository
	crypto security.CryptoService // Para UpdatePassword
}

func NewUserService(repo domain.UserRepository, crypto security.CryptoService) *UserService {
	return &UserService{
		repo:   repo,
		crypto: crypto,
	}
}

// GetAll obtiene todos los usuarios
func (s *UserService) GetAll() ([]domain.User, error) {
	return s.repo.GetAll()
}

// GetByRole obtiene usuarios por rol
func (s *UserService) GetByRole(roleID uint) ([]domain.User, error) {
	return s.repo.GetByRole(roleID)
}

// GetByID obtiene un usuario por ID
func (s *UserService) GetByID(id uuid.UUID) (*domain.User, error) {
	return s.repo.GetByID(id)
}

// GetBySlug obtiene un usuario por slug (getUser)
func (s *UserService) GetBySlug(slug string) (*domain.User, error) {
	return s.repo.GetBySlug(slug)
}

// UpdateBySlug actualiza un usuario por slug (update)
func (s *UserService) UpdateBySlug(slug string, updates *domain.User) error {
	// Obtener usuario existente
	existing, err := s.repo.GetBySlug(slug)
	if err != nil {
		return err
	}

	// Aplicar actualizaciones parciales
	if updates.FullName != "" {
		existing.FullName = updates.FullName
	}
	if updates.Phone != nil {
		existing.Phone = updates.Phone
	}
	if updates.AvatarURL != nil {
		existing.AvatarURL = updates.AvatarURL
	}
	if updates.RoleID > 0 {
		existing.RoleID = updates.RoleID
	}
	
	// IsActive siempre se actualiza
	existing.IsActive = updates.IsActive

	return s.repo.Update(existing)
}

// Update actualiza un usuario completo
func (s *UserService) Update(user *domain.User) error {
	// Validar que existe
	_, err := s.repo.GetByID(user.ID)
	if err != nil {
		return err
	}

	return s.repo.Update(user)
}

// Delete elimina un usuario por ID (solo admin)
func (s *UserService) Delete(id uuid.UUID) error {
	// Verificar que existe
	_, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}

	return s.repo.Delete(id)
}

// UpdatePassword actualiza la contraseña de un usuario (Gestión Administrativa)
// Este método es exclusivo de USERS feature, no de AUTH
func (s *UserService) UpdatePassword(userID uuid.UUID, newPassword string) error {
	// Validar longitud de contraseña
	if len(newPassword) < 8 {
		return errors.New("contraseña debe tener al menos 8 caracteres")
	}

	// Obtener usuario
	user, err := s.repo.GetByID(userID)
	if err != nil {
		return err
	}

	// Hashear nueva contraseña con Argon2id
	hashedPassword, err := s.crypto.HashPassword(newPassword)
	if err != nil {
		return err
	}

	// Actualizar solo el password hash
	user.PasswordHash = hashedPassword

	return s.repo.Update(user)
}
