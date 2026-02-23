package infrastructure

import (
	"backend-go/features/users/domain"
	"backend-go/shared/database"
	"backend-go/shared/pagination"
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

// FindAllPaginated obtiene usuarios con paginación y filtros
func (r *UserRepositoryImpl) FindAllPaginated(params pagination.PaginationParams) ([]domain.User, *pagination.PaginationMeta, error) {
	var dbUsers []database.User
	var totalItems int64

	// Query base con Preload
	query := r.db.Model(&database.User{}).Preload("Role")

	// 1. Filtro de búsqueda (nombre, email, teléfono)
	if params.Search != "" {
		searchPattern := "%" + params.Search + "%"
		query = query.Where(
			"full_name ILIKE ? OR email ILIKE ? OR phone ILIKE ?",
			searchPattern, searchPattern, searchPattern,
		)
	}

	// 2. Filtro por estado (status: active/inactive)
	if params.Status != "" {
		switch params.Status {
		case "active":
			query = query.Where("is_active = ?", true)
		case "inactive":
			query = query.Where("is_active = ?", false)
		}
	}

	// 3. Filtro por rol (usando el campo existente role_id)
	// Nota: params.Deporte lo reutilizamos como filtro de rol
	if params.Deporte != "" {
		// Intentar parsear como número
		query = query.Where("role_id = ?", params.Deporte)
	}

	// 4. Contar total de items (después de aplicar filtros)
	if err := query.Count(&totalItems).Error; err != nil {
		return nil, nil, err
	}

	// 5. Ordenación
	switch params.Sort {
	case "nombre_asc":
		query = query.Order("full_name ASC")
	case "nombre_desc":
		query = query.Order("full_name DESC")
	case "email_asc":
		query = query.Order("email ASC")
	case "email_desc":
		query = query.Order("email DESC")
	case "recientes":
		query = query.Order("created_at DESC")
	default:
		query = query.Order("created_at DESC")
	}

	// 6. Aplicar paginación
	offset := params.GetOffset()
	query = query.Limit(params.Limit).Offset(offset)

	// 7. Ejecutar query
	if err := query.Find(&dbUsers).Error; err != nil {
		return nil, nil, err
	}

	// 8. Mapear a dominio
	users := make([]domain.User, len(dbUsers))
	for i := range dbUsers {
		users[i] = *r.mapper.ToDomain(&dbUsers[i])
	}

	// 9. Construir metadata
	meta := pagination.NewPaginationMeta(
		totalItems,
		params.Page,
		params.Limit,
	)

	return users, meta, nil
}
