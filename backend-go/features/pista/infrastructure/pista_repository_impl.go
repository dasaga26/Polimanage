package infrastructure

import (
	"backend-go/features/pista/domain"
	"backend-go/shared/database"
	"backend-go/shared/pagination"
	"errors"
	"strings"

	"gorm.io/gorm"
)

// PistaRepositoryImpl implementa domain.PistaRepository usando GORM
type PistaRepositoryImpl struct {
	db *gorm.DB
}

// NewPistaRepository crea una nueva instancia del repositorio
func NewPistaRepository(db *gorm.DB) domain.PistaRepository {
	return &PistaRepositoryImpl{db: db}
}

// FindAll obtiene todas las pistas
func (r *PistaRepositoryImpl) FindAll() ([]domain.Pista, error) {
	var models []database.Pista
	if err := r.db.Find(&models).Error; err != nil {
		return nil, err
	}

	pistas := make([]domain.Pista, len(models))
	for i := range models {
		pistas[i] = *ToEntity(&models[i])
	}

	return pistas, nil
}

// FindByID obtiene una pista por su ID
func (r *PistaRepositoryImpl) FindByID(id int) (*domain.Pista, error) {
	var model database.Pista
	if err := r.db.First(&model, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrPistaNotFound
		}
		return nil, err
	}

	return ToEntity(&model), nil
}

// Create crea una nueva pista
func (r *PistaRepositoryImpl) Create(pista *domain.Pista) error {
	model := FromEntity(pista)
	if err := r.db.Create(model).Error; err != nil {
		// Detectar violación de clave única
		if strings.Contains(err.Error(), "duplicate key value") ||
			strings.Contains(err.Error(), "UNIQUE constraint failed") {
			return domain.ErrPistaDuplicated
		}
		return err
	}

	pista.ID = int(model.ID)
	return nil
}

// Update actualiza una pista existente
func (r *PistaRepositoryImpl) Update(pista *domain.Pista) error {
	model := FromEntity(pista)
	return r.db.Save(model).Error
}

// Delete elimina una pista por su ID
func (r *PistaRepositoryImpl) Delete(id int) error {
	return r.db.Delete(&database.Pista{}, id).Error
}

// FindAllAdvanced implementa búsqueda, filtrado, ordenación y paginación avanzada
func (r *PistaRepositoryImpl) FindAllAdvanced(params domain.PistaQueryParams) (*domain.PistaPagedResponse, error) {
	// Inicializar query base
	query := r.db.Model(&database.Pista{})

	// 1. BÚSQUEDA (Search): texto libre en nombre o ubicación
	if params.Q != "" {
		searchPattern := "%" + params.Q + "%"
		query = query.Where("name ILIKE ? OR location_info ILIKE ?", searchPattern, searchPattern)
	}

	// 2. FILTROS
	// Filtro por deporte/tipo (exacto)
	if params.Deporte != "" {
		query = query.Where("type = ?", params.Deporte)
	}

	// Filtro por precio mínimo
	if params.MinPrice != nil {
		minPriceCents := *params.MinPrice * 100 // Convertir euros a centavos
		query = query.Where("base_price_cents >= ?", minPriceCents)
	}

	// Filtro por precio máximo
	if params.MaxPrice != nil {
		maxPriceCents := *params.MaxPrice * 100 // Convertir euros a centavos
		query = query.Where("base_price_cents <= ?", maxPriceCents)
	}

	// Solo pistas activas por defecto
	query = query.Where("is_active = ?", true)

	// 3. CONTAR TOTAL antes de paginación (IMPORTANTE)
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, err
	}

	// 4. ORDENACIÓN (Sort)
	switch params.Sort {
	case "precio_asc":
		query = query.Order("base_price_cents ASC")
	case "precio_desc":
		query = query.Order("base_price_cents DESC")
	case "nombre_asc":
		query = query.Order("name ASC")
	case "nombre_desc":
		query = query.Order("name DESC")
	default:
		// Default: Relevancia (más recientes primero)
		query = query.Order("id DESC")
	}

	// 5. PAGINACIÓN
	// Defaults: Page 1, Limit 12
	page := params.Page
	if page < 1 {
		page = 1
	}
	limit := params.Limit
	if limit < 1 {
		limit = 12
	}

	offset := (page - 1) * limit
	query = query.Limit(limit).Offset(offset)

	// 6. EJECUTAR QUERY
	var entities []database.Pista
	if err := query.Find(&entities).Error; err != nil {
		return nil, err
	}

	// 7. MAPPING a Domain Entities
	items := make([]domain.Pista, len(entities))
	for i := range entities {
		items[i] = *ToEntity(&entities[i])
	}

	// 8. CALCULAR TOTAL DE PÁGINAS
	totalPages := int(total) / limit
	if int(total)%limit != 0 {
		totalPages++
	}

	// 9. CONSTRUIR Y RETORNAR RESPUESTA PAGINADA
	return &domain.PistaPagedResponse{
		Items:      items,
		Total:      total,
		Page:       page,
		TotalPages: totalPages,
		Limit:      limit,
	}, nil
}

// FindAllPaginated implementa paginación usando la estructura compartida PaginationParams
func (r *PistaRepositoryImpl) FindAllPaginated(params pagination.PaginationParams) ([]domain.Pista, *pagination.PaginationMeta, error) {
	// Validar parámetros
	params.Validate()

	// Inicializar query base
	query := r.db.Model(&database.Pista{})

	// 1. BÚSQUEDA (Search): texto libre en nombre o ubicación
	if params.Search != "" {
		searchPattern := "%" + params.Search + "%"
		query = query.Where("name ILIKE ? OR location_info ILIKE ?", searchPattern, searchPattern)
	}

	// 2. FILTROS
	// Filtro por deporte/tipo (exacto)
	if params.Deporte != "" {
		query = query.Where("type = ?", params.Deporte)
	}

	// Filtro por precio mínimo (en céntimos)
	if params.MinPrice > 0 {
		query = query.Where("base_price_cents >= ?", params.MinPrice)
	}

	// Filtro por precio máximo (en céntimos)
	if params.MaxPrice > 0 {
		query = query.Where("base_price_cents <= ?", params.MaxPrice)
	}

	// Solo pistas activas por defecto
	query = query.Where("is_active = ?", true)

	// 3. CONTAR TOTAL antes de paginación
	var totalItems int64
	if err := query.Count(&totalItems).Error; err != nil {
		return nil, nil, err
	}

	// 4. CALCULAR MAX PRICE LIMIT
	// Obtener el precio máximo de TODA la tabla (respetando filtro de deporte, pero ignorando filtros de precio)
	var maxPrice int
	maxPriceQuery := r.db.Model(&database.Pista{}).Where("is_active = ?", true)
	if params.Deporte != "" {
		maxPriceQuery = maxPriceQuery.Where("type = ?", params.Deporte)
	}
	if err := maxPriceQuery.Select("COALESCE(MAX(base_price_cents), 0)").Scan(&maxPrice).Error; err != nil {
		return nil, nil, err
	}

	// 5. ORDENACIÓN (Sort)
	switch params.Sort {
	case "precio_asc":
		query = query.Order("base_price_cents ASC")
	case "precio_desc":
		query = query.Order("base_price_cents DESC")
	case "nombre_asc":
		query = query.Order("name ASC")
	case "nombre_desc":
		query = query.Order("name DESC")
	default:
		// Default: Más recientes primero
		query = query.Order("id DESC")
	}

	// 6. PAGINACIÓN
	offset := params.GetOffset()
	query = query.Limit(params.Limit).Offset(offset)

	// 7. EJECUTAR QUERY
	var entities []database.Pista
	if err := query.Find(&entities).Error; err != nil {
		return nil, nil, err
	}

	// 8. MAPPING a Domain Entities
	items := make([]domain.Pista, len(entities))
	for i := range entities {
		items[i] = *ToEntity(&entities[i])
	}

	// 9. CONSTRUIR METADATOS
	meta := pagination.NewPaginationMeta(totalItems, params.Page, params.Limit)
	meta.MaxPriceLimit = &maxPrice

	// Convertir a euros para comodidad del frontend
	maxPriceEur := float64(maxPrice) / 100.0
	meta.MaxPriceLimitEur = &maxPriceEur

	return items, meta, nil
}
