package infrastructure

import (
	"backend-go/features/payments/domain"
	"backend-go/shared/database"

	"gorm.io/gorm"
)

type PaymentRepositoryImpl struct {
	db     *gorm.DB
	mapper *PaymentMapper
}

func NewPaymentRepository(db *gorm.DB) domain.PaymentRepository {
	return &PaymentRepositoryImpl{
		db:     db,
		mapper: NewPaymentMapper(),
	}
}

func (r *PaymentRepositoryImpl) Create(payment *domain.Payment) error {
	dbPayment := r.mapper.ToDatabase(payment)
	return r.db.Create(dbPayment).Error
}

func (r *PaymentRepositoryImpl) GetByID(id uint) (*domain.Payment, error) {
	var dbPayment database.Payment
	if err := r.db.Preload("User").First(&dbPayment, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrPaymentNotFound
		}
		return nil, err
	}
	return r.mapper.ToDomain(&dbPayment), nil
}

func (r *PaymentRepositoryImpl) GetByUser(userID uint) ([]domain.Payment, error) {
	var dbPayments []database.Payment
	if err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&dbPayments).Error; err != nil {
		return nil, err
	}

	payments := make([]domain.Payment, len(dbPayments))
	for i := range dbPayments {
		payments[i] = *r.mapper.ToDomain(&dbPayments[i])
	}
	return payments, nil
}

func (r *PaymentRepositoryImpl) GetByBooking(bookingID uint) (*domain.Payment, error) {
	var dbPayment database.Payment
	if err := r.db.Where("booking_id = ?", bookingID).First(&dbPayment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrPaymentNotFound
		}
		return nil, err
	}
	return r.mapper.ToDomain(&dbPayment), nil
}

func (r *PaymentRepositoryImpl) GetByClassEnrollment(enrollmentID uint) (*domain.Payment, error) {
	var dbPayment database.Payment
	if err := r.db.Where("class_enrollment_id = ?", enrollmentID).First(&dbPayment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrPaymentNotFound
		}
		return nil, err
	}
	return r.mapper.ToDomain(&dbPayment), nil
}

func (r *PaymentRepositoryImpl) GetByClubMembership(membershipID uint) ([]domain.Payment, error) {
	var dbPayments []database.Payment
	if err := r.db.Where("club_membership_id = ?", membershipID).Order("created_at DESC").Find(&dbPayments).Error; err != nil {
		return nil, err
	}

	payments := make([]domain.Payment, len(dbPayments))
	for i := range dbPayments {
		payments[i] = *r.mapper.ToDomain(&dbPayments[i])
	}
	return payments, nil
}

func (r *PaymentRepositoryImpl) Update(payment *domain.Payment) error {
	dbPayment := r.mapper.ToDatabase(payment)
	return r.db.Save(dbPayment).Error
}
