package domain

// PaymentRepository define las operaciones de persistencia para pagos
type PaymentRepository interface {
	Create(payment *Payment) error
	GetByID(id uint) (*Payment, error)
	GetByUser(userID uint) ([]Payment, error)
	GetByBooking(bookingID uint) (*Payment, error)
	GetByClassEnrollment(enrollmentID uint) (*Payment, error)
	GetByClubMembership(membershipID uint) ([]Payment, error)
	Update(payment *Payment) error
}
