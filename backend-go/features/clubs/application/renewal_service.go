package application

import (
	"backend-go/features/clubs/domain"
	paymentApp "backend-go/features/payments/application"
	"errors"
	"fmt"
	"time"
)

var (
	ErrMembershipNotFound = errors.New("membresía no encontrada")
	ErrClubNotFound       = errors.New("club no encontrado")
	ErrMembershipInactive = errors.New("la membresía no está activa")
	ErrPaymentFailed      = errors.New("el pago falló")
)

// RenewalService maneja la lógica de renovación de membresías
type RenewalService struct {
	membershipRepo domain.ClubMembershipRepository
	clubRepo       domain.ClubRepository
	paymentService *paymentApp.PaymentService
}

// NewRenewalService crea una nueva instancia del servicio
func NewRenewalService(
	membershipRepo domain.ClubMembershipRepository,
	clubRepo domain.ClubRepository,
	paymentService *paymentApp.PaymentService,
) *RenewalService {
	return &RenewalService{
		membershipRepo: membershipRepo,
		clubRepo:       clubRepo,
		paymentService: paymentService,
	}
}

// RenewMembership procesa la renovación (cobro) de una membresía
func (s *RenewalService) RenewMembership(membershipID int, customerID string) error {
	// 1. Obtener la membresía
	membership, err := s.membershipRepo.FindByID(membershipID)
	if err != nil {
		return ErrMembershipNotFound
	}

	// 2. Verificar que esté activa
	if membership.Status != domain.MembershipStatusActive {
		return ErrMembershipInactive
	}

	// 3. Obtener el club para conocer el precio
	club, err := s.clubRepo.FindByID(membership.ClubID)
	if err != nil {
		return ErrClubNotFound
	}

	// 4. Procesar el pago a través del PaymentService
	payment, err := s.paymentService.ProcessClubPayment(
		membership.UserID,
		uint(membershipID),
		club.MonthlyFeeCents,
		customerID,
	)
	if err != nil {
		// Marcar como PAST_DUE si el pago falla
		membership.PaymentStatus = domain.PaymentStatusPastDue
		s.membershipRepo.Update(membership)
		return fmt.Errorf("%w: %v", ErrPaymentFailed, err)
	}

	// 5. Actualizar la membresía con los datos del pago exitoso
	now := time.Now()
	nextBilling := now.AddDate(0, 1, 0) // +1 mes

	membership.PaymentStatus = domain.PaymentStatusUpToDate
	membership.NextBillingDate = &nextBilling
	paymentID := int(payment.ID)
	membership.LastPaymentID = &paymentID
	membership.UpdatedAt = now

	// 6. Guardar cambios
	if err := s.membershipRepo.Update(membership); err != nil {
		return fmt.Errorf("error al actualizar membresía: %w", err)
	}

	fmt.Printf("✅ Membresía #%d renovada exitosamente. Próximo cobro: %s\n",
		membershipID, nextBilling.Format("2006-01-02"))

	return nil
}

// GetPendingRenewals obtiene membresías que requieren renovación
func (s *RenewalService) GetPendingRenewals() ([]domain.ClubMembership, error) {
	// TODO: Implementar lógica para obtener membresías con NextBillingDate <= hoy
	// Por ahora retorna vacío, se puede implementar con un método en el repo
	return []domain.ClubMembership{}, nil
}

// AutoRenewMemberships ejecuta renovaciones automáticas
// Se puede llamar desde un scheduler/cron job
func (s *RenewalService) AutoRenewMemberships() (int, error) {
	pendingRenewals, err := s.GetPendingRenewals()
	if err != nil {
		return 0, err
	}

	successCount := 0
	for _, membership := range pendingRenewals {
		// Aquí necesitarías obtener el customerID del usuario
		// Por ahora es un placeholder
		if err := s.RenewMembership(membership.ID, "cus_auto"); err != nil {
			fmt.Printf("❌ Error renovando membresía #%d: %v\n", membership.ID, err)
			continue
		}
		successCount++
	}

	return successCount, nil
}
