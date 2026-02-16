package application

import (
	"backend-go/features/clubs/domain"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// UserProvider define la interfaz para obtener información de usuarios
type UserProvider interface {
	GetUserBySlug(slug string) (UserInfo, error)
}

// UserInfo representa la información necesaria de un usuario
type UserInfo struct {
	ID     uuid.UUID
	RoleID int
}

type ClubMembershipService struct {
	repo domain.ClubMembershipRepository
}

func NewClubMembershipService(repo domain.ClubMembershipRepository) *ClubMembershipService {
	return &ClubMembershipService{repo: repo}
}

// GetMembershipsByClub obtiene todas las membresías de un club
func (s *ClubMembershipService) GetMembershipsByClub(clubID int) ([]domain.ClubMembership, error) {
	return s.repo.FindByClub(clubID)
}

// GetMembershipsByUser obtiene todas las membresías de un usuario
func (s *ClubMembershipService) GetMembershipsByUser(userID uuid.UUID) ([]domain.ClubMembership, error) {
	return s.repo.FindByUser(userID)
}

// AddMember añade un miembro a un club
func (s *ClubMembershipService) AddMember(clubID int, userID uuid.UUID) error {
	// VALIDACIÓN: Verificar que no esté ya inscrito
	exists, err := s.repo.CheckExists(clubID, userID)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("el usuario ya es miembro de este club")
	}

	// Crear membresía
	membership := &domain.ClubMembership{
		ClubID:    clubID,
		UserID:    userID,
		Status:    domain.MembershipStatusActive,
		StartDate: time.Now(),
		IsActive:  true,
	}

	return s.repo.Create(membership)
}

// RemoveMember elimina un miembro de un club
func (s *ClubMembershipService) RemoveMember(membershipID int) error {
	return s.repo.Delete(membershipID)
}

// SuspendMembership suspende una membresía
func (s *ClubMembershipService) SuspendMembership(membershipID int) error {
	membership, err := s.repo.FindByID(membershipID)
	if err != nil {
		return err
	}

	membership.Status = domain.MembershipStatusSuspended
	membership.IsActive = false

	return s.repo.Update(membership)
}

// ActivateMembership activa una membresía suspendida
func (s *ClubMembershipService) ActivateMembership(membershipID int) error {
	membership, err := s.repo.FindByID(membershipID)
	if err != nil {
		return err
	}

	if membership.Status == domain.MembershipStatusExpired {
		return fmt.Errorf("no se puede activar una membresía expirada")
	}

	membership.Status = domain.MembershipStatusActive
	membership.IsActive = true

	return s.repo.Update(membership)
}

// CancelMembership cancela permanentemente una membresía
func (s *ClubMembershipService) CancelMembership(membershipID int) error {
	membership, err := s.repo.FindByID(membershipID)
	if err != nil {
		return err
	}

	if membership.Status == domain.MembershipStatusCancelled {
		return fmt.Errorf("la membresía ya está cancelada")
	}

	membership.Status = domain.MembershipStatusCancelled
	membership.IsActive = false
	now := time.Now()
	membership.EndDate = &now

	return s.repo.Update(membership)
}

// UpdateNextBillingDate actualiza la fecha de próximo cobro
func (s *ClubMembershipService) UpdateNextBillingDate(membershipID int, newDate time.Time) error {
	membership, err := s.repo.FindByID(membershipID)
	if err != nil {
		return err
	}

	if !membership.IsActive {
		return fmt.Errorf("no se puede actualizar la fecha de una membresía inactiva")
	}

	membership.NextBillingDate = &newDate
	return s.repo.Update(membership)
}
