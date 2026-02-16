package presentation

import (
	"backend-go/features/payments/domain"
	"time"
)

// PaymentResponse representa la respuesta de un pago
type PaymentResponse struct {
	ID                    uint    `json:"id"`
	UserID                string  `json:"user_id"` // UUID como string
	AmountCents           int     `json:"amount_cents"`
	AmountEuros           float64 `json:"amount_euros"`
	Currency              string  `json:"currency"`
	Status                string  `json:"status"`
	Provider              string  `json:"provider"`
	StripePaymentIntentID *string `json:"stripe_payment_intent_id,omitempty"`
	BookingID             *uint   `json:"booking_id,omitempty"`
	ClassEnrollmentID     *uint   `json:"class_enrollment_id,omitempty"`
	ClubMembershipID      *uint   `json:"club_membership_id,omitempty"`
	PaymentType           string  `json:"payment_type"`
	CreatedAt             string  `json:"created_at"`
	UpdatedAt             string  `json:"updated_at"`
}

// ToPaymentResponse convierte un domain.Payment a PaymentResponse
func ToPaymentResponse(payment *domain.Payment) PaymentResponse {
	response := PaymentResponse{
		ID:                    payment.ID,
		UserID:                payment.UserID.String(),
		AmountCents:           payment.AmountCents,
		AmountEuros:           float64(payment.AmountCents) / 100.0,
		Currency:              payment.Currency,
		Status:                payment.Status,
		Provider:              payment.Provider,
		StripePaymentIntentID: payment.StripePaymentIntentID,
		BookingID:             payment.BookingID,
		ClassEnrollmentID:     payment.ClassEnrollmentID,
		ClubMembershipID:      payment.ClubMembershipID,
		CreatedAt:             payment.CreatedAt.Format(time.RFC3339),
		UpdatedAt:             payment.UpdatedAt.Format(time.RFC3339),
	}

	// Determinar tipo de pago
	if payment.BookingID != nil {
		response.PaymentType = "booking"
	} else if payment.ClassEnrollmentID != nil {
		response.PaymentType = "class"
	} else if payment.ClubMembershipID != nil {
		response.PaymentType = "club"
	} else {
		response.PaymentType = "generic"
	}

	return response
}

// MessageResponse representa una respuesta simple con mensaje
type MessageResponse struct {
	Message string `json:"message"`
}
