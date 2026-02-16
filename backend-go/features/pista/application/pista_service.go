package application

import (
	"backend-go/features/pista/domain"
	"errors"
)

// PistaService maneja la lógica de negocio de las pistas
type PistaService struct {
	repo domain.PistaRepository
}

// NewPistaService crea una nueva instancia del servicio
func NewPistaService(repo domain.PistaRepository) *PistaService {
	return &PistaService{repo: repo}
}

// GetAll obtiene todas las pistas
func (s *PistaService) GetAll() ([]domain.Pista, error) {
	return s.repo.FindAll()
}

// GetAllAdvanced obtiene pistas con búsqueda, filtros, ordenación y paginación
func (s *PistaService) GetAllAdvanced(params domain.PistaQueryParams) (*domain.PistaPagedResponse, error) {
	return s.repo.FindAllAdvanced(params)
}

// GetByID obtiene una pista por su ID
func (s *PistaService) GetByID(id int) (*domain.Pista, error) {
	if err := s.ValidateID(id); err != nil {
		return nil, err
	}
	return s.repo.FindByID(id)
}

// Create crea una nueva pista
func (s *PistaService) Create(pista *domain.Pista) (*domain.Pista, error) {
	// Validar datos de negocio
	if err := s.ValidatePista(pista); err != nil {
		return nil, err
	}

	// Establecer valores por defecto
	pista.EsActiva = true
	pista.Estado = "DISPONIBLE"

	if err := s.repo.Create(pista); err != nil {
		return nil, err
	}

	return pista, nil
}

// Update actualiza una pista existente
func (s *PistaService) Update(id int, pista *domain.Pista) (*domain.Pista, error) {
	if err := s.ValidateID(id); err != nil {
		return nil, err
	}

	if err := s.ValidatePista(pista); err != nil {
		return nil, err
	}

	// Verificar que la pista existe
	_, err := s.repo.FindByID(id)
	if err != nil {
		return nil, domain.ErrPistaNotFound
	}

	pista.ID = id
	if err := s.repo.Update(pista); err != nil {
		return nil, err
	}

	return pista, nil
}

// Delete elimina una pista
func (s *PistaService) Delete(id int) error {
	if err := s.ValidateID(id); err != nil {
		return err
	}

	// Verificar que la pista existe
	_, err := s.repo.FindByID(id)
	if err != nil {
		return domain.ErrPistaNotFound
	}

	return s.repo.Delete(id)
}

// ValidateID valida que el ID sea válido
func (s *PistaService) ValidateID(id int) error {
	if id <= 0 {
		return domain.ErrInvalidID
	}
	return nil
}

// ValidatePista valida los datos de la pista
func (s *PistaService) ValidatePista(pista *domain.Pista) error {
	if pista.Nombre == "" {
		return errors.New("el nombre es obligatorio")
	}
	if pista.PrecioHoraBase < 0 {
		return errors.New("el precio no puede ser negativo")
	}
	return nil
}
