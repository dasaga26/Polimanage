package database

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ======================================================================================
// MÓDULO 1: IDENTIDAD (Auth)
// ======================================================================================

// Role representa el catálogo de roles del sistema
type Role struct {
	ID          uint   `gorm:"primaryKey"`
	Name        string `gorm:"type:varchar(50);not null;uniqueIndex"`
	Description string `gorm:"type:varchar(255)"`
}

// User representa un usuario del sistema con integración Stripe
type User struct {
	ID               uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	RoleID           uint           `gorm:"not null;default:5"`
	Slug             string         `gorm:"type:varchar(120);not null;uniqueIndex"`
	Email            string         `gorm:"type:varchar(255);not null;uniqueIndex;index:idx_users_email"`
	PasswordHash     string         `gorm:"type:varchar(255);not null"`
	FullName         string         `gorm:"type:varchar(100);not null"`
	Phone            *string        `gorm:"type:varchar(20)"`
	AvatarURL        *string        `gorm:"type:text"`
	StripeCustomerID *string        `gorm:"type:varchar(255)"`
	IsMember         bool           `gorm:"default:false"`
	IsActive         bool           `gorm:"default:true"`
	LastLoginAt      *time.Time     `gorm:"type:timestamptz"`
	CreatedAt        time.Time      `gorm:"type:timestamptz;default:NOW()"`
	UpdatedAt        time.Time      `gorm:"type:timestamptz;default:NOW()"`
	DeletedAt        gorm.DeletedAt `gorm:"index"`

	// Relaciones
	Role        Role              `gorm:"foreignKey:RoleID"`
	Bookings    []Booking         `gorm:"foreignKey:UserID"`
	Classes     []Class           `gorm:"foreignKey:InstructorID"`
	Enrollments []ClassEnrollment `gorm:"foreignKey:UserID"`
	Payments    []Payment         `gorm:"foreignKey:UserID"`
}

// ======================================================================================
// MÓDULO 2: RECURSOS Y RESERVAS (Core)
// ======================================================================================

// Pista representa un recurso reservable
type Pista struct {
	ID             uint           `gorm:"primaryKey"`
	Name           string         `gorm:"type:varchar(100);not null"`
	Slug           string         `gorm:"type:varchar(120);not null;uniqueIndex"`
	Type           string         `gorm:"type:varchar(50);not null"`
	Surface        *string        `gorm:"type:varchar(50)"`
	LocationInfo   *string        `gorm:"type:varchar(100)"`
	ImageURL       *string        `gorm:"type:text"`
	IsActive       bool           `gorm:"default:true"`
	Status         string         `gorm:"type:varchar(50);default:'AVAILABLE'"`
	BasePriceCents int            `gorm:"not null;check:base_price_cents >= 0"`
	CreatedAt      time.Time      `gorm:"type:timestamptz;default:NOW()"`
	UpdatedAt      time.Time      `gorm:"type:timestamptz;default:NOW()"`
	DeletedAt      gorm.DeletedAt `gorm:"index"`

	// Relaciones
	Bookings []Booking `gorm:"foreignKey:PistaID"`
	Classes  []Class   `gorm:"foreignKey:PistaID"`
}

// Booking representa una reserva con snapshot de precio
type Booking struct {
	ID                 uint           `gorm:"primaryKey"`
	UserID             uuid.UUID      `gorm:"type:uuid;not null"`
	PistaID            uint           `gorm:"not null;uniqueIndex:idx_booking_overlap,where:status != 'CANCELLED' AND deleted_at IS NULL"`
	StartTime          time.Time      `gorm:"type:timestamptz;not null;index:idx_bookings_dates;uniqueIndex:idx_booking_overlap,where:status != 'CANCELLED' AND deleted_at IS NULL"`
	EndTime            time.Time      `gorm:"type:timestamptz;not null;index:idx_bookings_dates;check:end_time > start_time"`
	PriceSnapshotCents int            `gorm:"not null"`
	Status             string         `gorm:"type:varchar(50);default:'PENDING'"`
	PaymentStatus      string         `gorm:"type:varchar(50);default:'UNPAID'"`
	Notes              *string        `gorm:"type:text"`
	CreatedAt          time.Time      `gorm:"type:timestamptz;default:NOW()"`
	UpdatedAt          time.Time      `gorm:"type:timestamptz;default:NOW()"`
	DeletedAt          gorm.DeletedAt `gorm:"index"`

	// Relaciones
	User    User     `gorm:"foreignKey:UserID"`
	Pista   Pista    `gorm:"foreignKey:PistaID"`
	Payment *Payment `gorm:"foreignKey:BookingID"`
}

// ======================================================================================
// MÓDULO 3: ACADEMIA
// ======================================================================================

// Class representa una clase grupal
type Class struct {
	ID           uint           `gorm:"primaryKey"`
	Slug         string         `gorm:"type:varchar(120);uniqueIndex"`
	PistaID      uint           `gorm:"not null"`
	InstructorID uint           `gorm:"not null"`
	Title        string         `gorm:"type:varchar(100);not null"`
	Description  *string        `gorm:"type:text"`
	StartTime    time.Time      `gorm:"type:timestamptz;not null"`
	EndTime      time.Time      `gorm:"type:timestamptz;not null"`
	Capacity     int            `gorm:"default:4"`
	PriceCents   int            `gorm:"not null"`
	Status       string         `gorm:"type:varchar(50);default:'OPEN'"`
	CreatedAt    time.Time      `gorm:"type:timestamptz;default:NOW()"`
	UpdatedAt    time.Time      `gorm:"type:timestamptz;default:NOW()"`
	DeletedAt    gorm.DeletedAt `gorm:"index"`

	// Relaciones
	Pista       Pista             `gorm:"foreignKey:PistaID"`
	Instructor  User              `gorm:"foreignKey:InstructorID"`
	Enrollments []ClassEnrollment `gorm:"foreignKey:ClassID"`
}

// ClassEnrollment representa la inscripción de un usuario a una clase
type ClassEnrollment struct {
	ID           uint      `gorm:"primaryKey"`
	ClassID      uint      `gorm:"not null;uniqueIndex:uq_class_user"`
	UserID       uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:uq_class_user"`
	Status       string    `gorm:"type:varchar(50);default:'CONFIRMED'"`
	RegisteredAt time.Time `gorm:"type:timestamptz;default:NOW()"`

	// Relaciones
	Class    Class     `gorm:"foreignKey:ClassID"`
	User     User      `gorm:"foreignKey:UserID"`
	Payments []Payment `gorm:"foreignKey:ClassEnrollmentID"`
}

// ======================================================================================
// MÓDULO 3: CLUBS Y MEMBRESÍAS
// ======================================================================================

// Club representa un club deportivo o social
type Club struct {
	ID              uint       `gorm:"primaryKey"`
	OwnerID         *uuid.UUID `gorm:"type:uuid;index"`
	Slug            string     `gorm:"type:varchar(120);not null;uniqueIndex"`
	Name            string     `gorm:"type:varchar(100);not null"`
	Description     *string    `gorm:"type:text"`
	LogoURL         *string    `gorm:"type:text"`
	MaxMembers      int        `gorm:"not null;default:50"`
	MonthlyFeeCents int        `gorm:"not null;default:0"`
	Status          string     `gorm:"type:varchar(50);default:'ACTIVE'"`
	IsActive        bool       `gorm:"default:true"`
	CreatedAt       time.Time  `gorm:"type:timestamptz;default:NOW()"`
	UpdatedAt       time.Time  `gorm:"type:timestamptz;default:NOW()"`

	// Relaciones
	Owner       *User            `gorm:"foreignKey:OwnerID"`
	Memberships []ClubMembership `gorm:"foreignKey:ClubID"`
}

// ClubMembership representa la membresía de un usuario a un club
type ClubMembership struct {
	ID              uint       `gorm:"primaryKey"`
	ClubID          uint       `gorm:"not null;index:idx_club_user,unique"`
	UserID          uuid.UUID  `gorm:"type:uuid;not null;index:idx_club_user,unique"`
	Status          string     `gorm:"type:varchar(50);default:'ACTIVE'"`
	StartDate       time.Time  `gorm:"type:timestamptz;default:NOW()"`
	EndDate         *time.Time `gorm:"type:timestamptz"`
	NextBillingDate *time.Time `gorm:"type:timestamptz"`
	PaymentStatus   string     `gorm:"type:varchar(50);default:'UP_TO_DATE'"`
	IsActive        bool       `gorm:"default:true"`
	CreatedAt       time.Time  `gorm:"type:timestamptz;default:NOW()"`
	UpdatedAt       time.Time  `gorm:"type:timestamptz;default:NOW()"`

	// Relaciones
	Club     Club      `gorm:"foreignKey:ClubID"`
	User     User      `gorm:"foreignKey:UserID"`
	Payments []Payment `gorm:"foreignKey:ClubMembershipID"`
}

// ======================================================================================
// MÓDULO 4: PAGOS UNIFICADOS (Stripe)
// ======================================================================================

// Payment representa un pago con patrón Exclusive Arc
type Payment struct {
	ID                    uint      `gorm:"primaryKey"`
	UserID                uuid.UUID `gorm:"type:uuid;not null"`
	AmountCents           int       `gorm:"not null"`
	Currency              string    `gorm:"type:varchar(3);default:'EUR'"`
	Status                string    `gorm:"type:varchar(50);not null"`
	Provider              string    `gorm:"type:varchar(50);default:'STRIPE'"`
	StripePaymentIntentID *string   `gorm:"type:varchar(255);uniqueIndex"`

	// Exclusive Arc - Solo uno puede ser NOT NULL
	BookingID         *uint `gorm:"index"`
	ClassEnrollmentID *uint `gorm:"index"`
	ClubMembershipID  *uint `gorm:"index"` // Nuevo: pagos de membresías

	CreatedAt time.Time `gorm:"type:timestamptz;default:NOW()"`
	UpdatedAt time.Time `gorm:"type:timestamptz;default:NOW()"`

	// Relaciones
	User            User             `gorm:"foreignKey:UserID"`
	Booking         *Booking         `gorm:"foreignKey:BookingID"`
	ClassEnrollment *ClassEnrollment `gorm:"foreignKey:ClassEnrollmentID"`
	ClubMembership  *ClubMembership  `gorm:"foreignKey:ClubMembershipID"`
}

// TableName overrides
func (Role) TableName() string            { return "roles" }
func (User) TableName() string            { return "users" }
func (Pista) TableName() string           { return "pistas" }
func (Booking) TableName() string         { return "bookings" }
func (Class) TableName() string           { return "classes" }
func (ClassEnrollment) TableName() string { return "class_enrollments" }
func (Club) TableName() string            { return "clubs" }
func (ClubMembership) TableName() string  { return "club_memberships" }
func (Payment) TableName() string         { return "payments" }
