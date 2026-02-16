package infrastructure

import (
	"backend-go/features/users/domain"
	"backend-go/shared/database"
	"errors"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRepositoryImpl struct {
	db     *gorm.DB
	mapper *UserMapper
}

func NewUserRepository(db *gorm.DB) domain.UserRepository {
	return &UserRepositoryImpl{
		db:     db,
		mapper: NewUserMapper(),
	}
}

func (r *UserRepositoryImpl) GetAll() ([]domain.User, error) {
	var dbUsers []database.User
	if err := r.db.Preload("Role").Find(&dbUsers).Error; err != nil {
		return nil, err
	}

	users := make([]domain.User, len(dbUsers))
	for i := range dbUsers {
		users[i] = *r.mapper.ToDomain(&dbUsers[i])
	}

	return users, nil
}

func (r *UserRepositoryImpl) GetByRole(roleID uint) ([]domain.User, error) {
	var dbUsers []database.User
	if err := r.db.Preload("Role").Where("role_id = ?", roleID).Find(&dbUsers).Error; err != nil {
		return nil, err
	}

	users := make([]domain.User, len(dbUsers))
	for i := range dbUsers {
		users[i] = *r.mapper.ToDomain(&dbUsers[i])
	}

	return users, nil
}

func (r *UserRepositoryImpl) GetByID(id uuid.UUID) (*domain.User, error) {
	var dbUser database.User
	if err := r.db.Preload("Role").Where("id = ?", id).First(&dbUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrUserNotFound
		}
		return nil, err
	}

	return r.mapper.ToDomain(&dbUser), nil
}

func (r *UserRepositoryImpl) GetBySlug(slug string) (*domain.User, error) {
	var dbUser database.User
	if err := r.db.Preload("Role").Where("slug = ?", slug).First(&dbUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrUserNotFound
		}
		return nil, err
	}

	return r.mapper.ToDomain(&dbUser), nil
}

func (r *UserRepositoryImpl) Create(user *domain.User) error {
	dbUser := r.mapper.ToDatabase(user)
	if err := r.db.Create(dbUser).Error; err != nil {
		// Detectar violación de clave única
		if strings.Contains(err.Error(), "duplicate key value") ||
			strings.Contains(err.Error(), "UNIQUE constraint failed") {
			return domain.ErrUserAlreadyExists
		}
		return err
	}

	// Cargar el rol después de crear
	r.db.Preload("Role").First(dbUser, dbUser.ID)
	*user = *r.mapper.ToDomain(dbUser)
	return nil
}

func (r *UserRepositoryImpl) Update(user *domain.User) error {
	dbUser := r.mapper.ToDatabase(user)
	if err := r.db.Save(dbUser).Error; err != nil {
		return err
	}

	// Cargar el rol después de actualizar
	r.db.Preload("Role").First(dbUser, dbUser.ID)
	*user = *r.mapper.ToDomain(dbUser)
	return nil
}

func (r *UserRepositoryImpl) Delete(id uuid.UUID) error {
	return r.db.Where("id = ?", id).Delete(&database.User{}).Error
}

func (r *UserRepositoryImpl) GetByEmail(email string) (*domain.User, error) {
	var dbUser database.User
	if err := r.db.Preload("Role").Where("email = ?", email).First(&dbUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrUserNotFound
		}
		return nil, err
	}

	return r.mapper.ToDomain(&dbUser), nil
}

func (r *UserRepositoryImpl) EmailExists(email string) (bool, error) {
	var count int64
	if err := r.db.Model(&database.User{}).Where("email = ?", email).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *UserRepositoryImpl) SlugExists(slug string) (bool, error) {
	var count int64
	if err := r.db.Model(&database.User{}).Where("slug = ?", slug).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}
