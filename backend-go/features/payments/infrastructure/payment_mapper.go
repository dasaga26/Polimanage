package infrastructure

import (
	"backend-go/features/payments/domain"
	"backend-go/shared/database"
)

type PaymentMapper struct{}

func NewPaymentMapper() *PaymentMapper {
	return &PaymentMapper{}
}

func (m *PaymentMapper) ToDomain(dbPayment *database.Payment) *domain.Payment {
	return &domain.Payment{
		ID:                    dbPayment.ID,
		UserID:                dbPayment.UserID,
		AmountCents:           dbPayment.AmountCents,
		Currency:              dbPayment.Currency,
		Status:                dbPayment.Status,
		Provider:              dbPayment.Provider,
		StripePaymentIntentID: dbPayment.StripePaymentIntentID,
		BookingID:             dbPayment.BookingID,
		ClassEnrollmentID:     dbPayment.ClassEnrollmentID,
		ClubMembershipID:      dbPayment.ClubMembershipID,
		CreatedAt:             dbPayment.CreatedAt,
		UpdatedAt:             dbPayment.UpdatedAt,
	}
}

func (m *PaymentMapper) ToDatabase(payment *domain.Payment) *database.Payment {
	return &database.Payment{
		ID:                    payment.ID,
		UserID:                payment.UserID,
		AmountCents:           payment.AmountCents,
		Currency:              payment.Currency,
		Status:                payment.Status,
		Provider:              payment.Provider,
		StripePaymentIntentID: payment.StripePaymentIntentID,
		BookingID:             payment.BookingID,
		ClassEnrollmentID:     payment.ClassEnrollmentID,
		ClubMembershipID:      payment.ClubMembershipID,
		CreatedAt:             payment.CreatedAt,
		UpdatedAt:             payment.UpdatedAt,
	}
}
