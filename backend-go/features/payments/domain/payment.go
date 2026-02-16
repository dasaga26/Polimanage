package domain

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

// Errores de dominio
var (
	ErrPaymentNotFound    = errors.New("pago no encontrado")
	ErrInvalidAmount      = errors.New("monto inválido")
	ErrPaymentFailed      = errors.New("error al procesar el pago")
	ErrCustomerNotFound   = errors.New("cliente no encontrado")
	ErrInvalidPaymentType = errors.New("tipo de pago inválido")
	ErrMultipleReferences = errors.New("el pago solo puede estar asociado a un concepto")
)

// Payment estados
const (
	StatusPending   = "PENDING"
	StatusCompleted = "COMPLETED"
	StatusFailed    = "FAILED"
	StatusRefunded  = "REFUNDED"
)

// Payment providers
const (
	ProviderStripe = "STRIPE"
	ProviderMock   = "MOCK"
)

// Payment representa un pago en el dominio
type Payment struct {
	ID                    uint
	UserID                uuid.UUID
	AmountCents           int
	Currency              string
	Status                string
	Provider              string
	StripePaymentIntentID *string
	BookingID             *uint
	ClassEnrollmentID     *uint
	ClubMembershipID      *uint
	CreatedAt             time.Time
	UpdatedAt             time.Time
}

// Validate verifica la integridad del pago
func (p *Payment) Validate() error {
	if p.AmountCents <= 0 {
		return ErrInvalidAmount
	}

	// Verificar Exclusive Arc - solo una referencia puede existir
	references := 0
	if p.BookingID != nil {
		references++
	}
	if p.ClassEnrollmentID != nil {
		references++
	}
	if p.ClubMembershipID != nil {
		references++
	}

	if references == 0 {
		return ErrInvalidPaymentType
	}
	if references > 1 {
		return ErrMultipleReferences
	}

	return nil
}
