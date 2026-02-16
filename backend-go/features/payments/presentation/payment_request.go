package presentation

// CreatePaymentRequest representa la petición para crear un pago
type CreatePaymentRequest struct {
	UserID      string `json:"user_id" validate:"required"` // UUID como string
	AmountCents int    `json:"amount_cents" validate:"required,gt=0"`
	CustomerID  string `json:"customer_id" validate:"required"`
	Description string `json:"description" validate:"required"`
}

// CreateBookingPaymentRequest representa la petición para pago de reserva
type CreateBookingPaymentRequest struct {
	UserID      string `json:"user_id" validate:"required"` // UUID como string
	BookingID   uint   `json:"booking_id" validate:"required"`
	AmountCents int    `json:"amount_cents" validate:"required,gt=0"`
	CustomerID  string `json:"customer_id" validate:"required"`
}

// CreateClassPaymentRequest representa la petición para pago de clase
type CreateClassPaymentRequest struct {
	UserID       string `json:"user_id" validate:"required"` // UUID como string
	EnrollmentID uint   `json:"enrollment_id" validate:"required"`
	AmountCents  int    `json:"amount_cents" validate:"required,gt=0"`
	CustomerID   string `json:"customer_id" validate:"required"`
}

// CreateClubPaymentRequest representa la petición para pago de membresía
type CreateClubPaymentRequest struct {
	UserID       string `json:"user_id" validate:"required"` // UUID como string
	MembershipID uint   `json:"membership_id" validate:"required"`
	AmountCents  int    `json:"amount_cents" validate:"required,gt=0"`
	CustomerID   string `json:"customer_id" validate:"required"`
}

// RefundPaymentRequest representa la petición para reembolsar un pago
type RefundPaymentRequest struct {
	PaymentID uint `json:"payment_id" validate:"required"`
}
