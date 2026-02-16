package application

import (
	"backend-go/features/payments/domain"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// PaymentService maneja la lógica de negocio de pagos
type PaymentService struct {
	repo    domain.PaymentRepository
	gateway domain.PaymentGateway
}

// NewPaymentService crea una nueva instancia del servicio
func NewPaymentService(repo domain.PaymentRepository, gateway domain.PaymentGateway) *PaymentService {
	return &PaymentService{
		repo:    repo,
		gateway: gateway,
	}
}

// ProcessPayment procesa un pago genérico
func (s *PaymentService) ProcessPayment(userID uuid.UUID, amountCents int, customerID, description string) (*domain.Payment, error) {
	// 1. Validar monto
	if amountCents <= 0 {
		return nil, domain.ErrInvalidAmount
	}

	// 2. Procesar el cargo con el gateway
	paymentIntentID, err := s.gateway.Charge(amountCents, customerID, description)
	if err != nil {
		return nil, err
	}

	// 3. Crear el registro del pago
	payment := &domain.Payment{
		UserID:                userID,
		AmountCents:           amountCents,
		Currency:              "EUR",
		Status:                domain.StatusCompleted,
		Provider:              domain.ProviderMock,
		StripePaymentIntentID: &paymentIntentID,
		CreatedAt:             time.Now(),
		UpdatedAt:             time.Now(),
	}

	// 4. Guardar en BD
	if err := s.repo.Create(payment); err != nil {
		return nil, err
	}

	return payment, nil
}

// ProcessBookingPayment procesa un pago para una reserva
func (s *PaymentService) ProcessBookingPayment(userID uuid.UUID, bookingID uint, amountCents int, customerID string) (*domain.Payment, error) {
	description := fmt.Sprintf("Pago de reserva #%d", bookingID)

	paymentIntentID, err := s.gateway.Charge(amountCents, customerID, description)
	if err != nil {
		return nil, err
	}

	payment := &domain.Payment{
		UserID:                userID,
		BookingID:             &bookingID,
		AmountCents:           amountCents,
		Currency:              "EUR",
		Status:                domain.StatusCompleted,
		Provider:              domain.ProviderMock,
		StripePaymentIntentID: &paymentIntentID,
		CreatedAt:             time.Now(),
		UpdatedAt:             time.Now(),
	}

	if err := payment.Validate(); err != nil {
		return nil, err
	}

	if err := s.repo.Create(payment); err != nil {
		return nil, err
	}

	return payment, nil
}

// ProcessClassPayment procesa un pago para una inscripción a clase
func (s *PaymentService) ProcessClassPayment(userID uuid.UUID, enrollmentID uint, amountCents int, customerID string) (*domain.Payment, error) {
	description := fmt.Sprintf("Pago de inscripción a clase #%d", enrollmentID)

	paymentIntentID, err := s.gateway.Charge(amountCents, customerID, description)
	if err != nil {
		return nil, err
	}

	payment := &domain.Payment{
		UserID:                userID,
		ClassEnrollmentID:     &enrollmentID,
		AmountCents:           amountCents,
		Currency:              "EUR",
		Status:                domain.StatusCompleted,
		Provider:              domain.ProviderMock,
		StripePaymentIntentID: &paymentIntentID,
		CreatedAt:             time.Now(),
		UpdatedAt:             time.Now(),
	}

	if err := payment.Validate(); err != nil {
		return nil, err
	}

	if err := s.repo.Create(payment); err != nil {
		return nil, err
	}

	return payment, nil
}

// ProcessClubPayment procesa un pago de membresía a club
func (s *PaymentService) ProcessClubPayment(userID uuid.UUID, membershipID uint, amountCents int, customerID string) (*domain.Payment, error) {
	description := fmt.Sprintf("Pago de membresía #%d", membershipID)

	paymentIntentID, err := s.gateway.Charge(amountCents, customerID, description)
	if err != nil {
		return nil, err
	}

	payment := &domain.Payment{
		UserID:                userID,
		ClubMembershipID:      &membershipID,
		AmountCents:           amountCents,
		Currency:              "EUR",
		Status:                domain.StatusCompleted,
		Provider:              domain.ProviderMock,
		StripePaymentIntentID: &paymentIntentID,
		CreatedAt:             time.Now(),
		UpdatedAt:             time.Now(),
	}

	if err := payment.Validate(); err != nil {
		return nil, err
	}

	if err := s.repo.Create(payment); err != nil {
		return nil, err
	}

	return payment, nil
}

// GetUserPayments obtiene todos los pagos de un usuario
func (s *PaymentService) GetUserPayments(userID uint) ([]domain.Payment, error) {
	return s.repo.GetByUser(userID)
}

// GetPaymentByID obtiene un pago por su ID
func (s *PaymentService) GetPaymentByID(id uint) (*domain.Payment, error) {
	return s.repo.GetByID(id)
}

// RefundPayment procesa un reembolso
func (s *PaymentService) RefundPayment(paymentID uint) error {
	payment, err := s.repo.GetByID(paymentID)
	if err != nil {
		return err
	}

	if payment.Status == domain.StatusRefunded {
		return fmt.Errorf("el pago ya está reembolsado")
	}

	if payment.StripePaymentIntentID == nil {
		return fmt.Errorf("no se puede reembolsar un pago sin payment intent")
	}

	// Procesar reembolso con el gateway
	_, err = s.gateway.Refund(*payment.StripePaymentIntentID, payment.AmountCents)
	if err != nil {
		return err
	}

	// Actualizar estado
	payment.Status = domain.StatusRefunded
	payment.UpdatedAt = time.Now()

	return s.repo.Update(payment)
}
