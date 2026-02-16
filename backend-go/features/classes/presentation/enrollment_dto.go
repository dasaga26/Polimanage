package presentation

import "time"

// EnrollUserRequest representa los datos para inscribir a un usuario
type EnrollUserRequest struct {
	UserSlug string `json:"user_slug" validate:"required"`
}

// EnrollmentResponse representa la respuesta de una inscripción
type EnrollmentResponse struct {
	ID           int       `json:"id"`
	ClassID      int       `json:"classId"`
	ClassName    string    `json:"className"`
	UserID       string    `json:"userId"` // UUID como string
	UserName     string    `json:"userName"`
	UserEmail    string    `json:"userEmail"`
	Status       string    `json:"status"`
	RegisteredAt time.Time `json:"registeredAt"`
	EnrolledAt   time.Time `json:"enrolledAt"` // Alias para compatibilidad
}
