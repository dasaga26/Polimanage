package application

import (
	"backend-go/features/clubs/domain"
	"backend-go/shared/pagination"
	"errors"
	"fmt"
	"regexp"
	"strings"
)

type ClubService struct {
	repo           domain.ClubRepository
	membershipRepo domain.ClubMembershipRepository
}

func NewClubService(repo domain.ClubRepository, membershipRepo domain.ClubMembershipRepository) *ClubService {
	return &ClubService{
		repo:           repo,
		membershipRepo: membershipRepo,
	}
}

// GetAllClubs obtiene todos los clubs
func (s *ClubService) GetAllClubs() ([]domain.Club, error) {
	clubs, err := s.repo.FindAll()
	if err != nil {
		return nil, err
	}

	// Cargar contador de miembros para cada club
	for i := range clubs {
		count, err := s.membershipRepo.Count(clubs[i].ID)
		if err == nil {
			clubs[i].MemberCount = count
		}
	}

	return clubs, nil
}

// GetAllPaginated obtiene clubs con paginación
func (s *ClubService) GetAllPaginated(params pagination.PaginationParams) (*pagination.PaginatedResponse, error) {
	items, meta, err := s.repo.FindAllPaginated(params)
	if err != nil {
		return nil, err
	}

	// Cargar contador de miembros para cada club
	for i := range items {
		count, err := s.membershipRepo.Count(items[i].ID)
		if err == nil {
			items[i].MemberCount = count
		}
	}

	return pagination.NewPaginatedResponse(items, meta), nil
}

// GetClubByID obtiene un club por ID
func (s *ClubService) GetClubByID(id int) (*domain.Club, error) {
	club, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// Cargar contador de miembros
	count, err := s.membershipRepo.Count(club.ID)
	if err == nil {
		club.MemberCount = count
	}

	return club, nil
}

// GetClubBySlug obtiene un club por slug
func (s *ClubService) GetClubBySlug(slug string) (*domain.Club, error) {
	club, err := s.repo.FindBySlug(slug)
	if err != nil {
		return nil, err
	}

	// Cargar contador de miembros
	count, err := s.membershipRepo.Count(club.ID)
	if err == nil {
		club.MemberCount = count
	}

	return club, nil
}

// CreateClub crea un nuevo club con validaciones
func (s *ClubService) CreateClub(club *domain.Club) error {
	// VALIDACIÓN 1: Nombre requerido
	if club.Name == "" {
		return errors.New("el nombre del club es obligatorio")
	}

	// VALIDACIÓN 2: Capacidad mínima
	if club.MaxMembers < 1 {
		return errors.New("el club debe permitir al menos 1 miembro")
	}

	// VALIDACIÓN 3: Precio válido
	if club.MonthlyFeeCents < 0 {
		return errors.New("la cuota mensual no puede ser negativa")
	}

	// Generar slug único
	if club.Slug == "" {
		club.Slug = s.generateUniqueSlug(club.Name)
	}

	// Estado por defecto
	if club.Status == "" {
		club.Status = domain.ClubStatusActive
	}

	return s.repo.Create(club)
}

// UpdateClub actualiza un club existente
func (s *ClubService) UpdateClub(club *domain.Club) error {
	// Validaciones similares a Create
	if club.Name == "" {
		return errors.New("el nombre del club es obligatorio")
	}

	if club.MaxMembers < 1 {
		return errors.New("el club debe permitir al menos 1 miembro")
	}

	if club.MonthlyFeeCents < 0 {
		return errors.New("la cuota mensual no puede ser negativa")
	}

	return s.repo.Update(club)
}

// DeleteClub elimina un club
func (s *ClubService) DeleteClub(id int) error {
	// Verificar que no tenga miembros activos
	count, err := s.membershipRepo.Count(id)
	if err != nil {
		return err
	}

	if count > 0 {
		return fmt.Errorf("no se puede eliminar el club porque tiene %d miembros activos", count)
	}

	return s.repo.Delete(id)
}

// DeleteClubBySlug elimina un club por slug
func (s *ClubService) DeleteClubBySlug(slug string) error {
	club, err := s.repo.FindBySlug(slug)
	if err != nil {
		return err
	}

	return s.DeleteClub(club.ID)
}

// generateUniqueSlug genera un slug único para un club
func (s *ClubService) generateUniqueSlug(name string) string {
	baseSlug := generateClubSlug(name)
	slug := baseSlug
	counter := 1

	// Intentar hasta encontrar un slug único
	for {
		_, err := s.repo.FindBySlug(slug)
		if err != nil {
			// Slug no existe, podemos usarlo
			break
		}
		// Slug existe, añadir sufijo numérico
		slug = fmt.Sprintf("%s-%d", baseSlug, counter)
		counter++
	}

	return slug
}

// generateClubSlug genera el slug base para un club
func generateClubSlug(name string) string {
	slug := strings.ToLower(name)
	slug = strings.TrimSpace(slug)

	reg := regexp.MustCompile("[^a-z0-9]+")
	slug = reg.ReplaceAllString(slug, "-")

	if len(slug) > 50 {
		slug = slug[:50]
	}

	slug = strings.Trim(slug, "-")
	return slug
}
