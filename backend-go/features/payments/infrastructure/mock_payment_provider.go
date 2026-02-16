package infrastructure

import (
	"backend-go/features/payments/domain"
	"fmt"
	"math/rand"
	"time"
)

// MockPaymentProvider implementa PaymentGateway para desarrollo y testing
type MockPaymentProvider struct{}

// NewMockPaymentProvider crea una nueva instancia del proveedor mock
func NewMockPaymentProvider() domain.PaymentGateway {
	return &MockPaymentProvider{}
}

// CreateCustomer simula la creación de un cliente
func (m *MockPaymentProvider) CreateCustomer(email, name string) (string, error) {
	customerID := fmt.Sprintf("cus_mock_%d", time.Now().UnixNano())

	fmt.Printf("🔵 [MOCK PAYMENT] CreateCustomer:\n")
	fmt.Printf("   Email: %s\n", email)
	fmt.Printf("   Name: %s\n", name)
	fmt.Printf("   ✅ Customer ID: %s\n\n", customerID)

	return customerID, nil
}

// Charge simula un cargo
func (m *MockPaymentProvider) Charge(amountCents int, customerID string, description string) (string, error) {
	paymentIntentID := fmt.Sprintf("pi_mock_%d", time.Now().UnixNano())
	amountEuros := float64(amountCents) / 100.0

	fmt.Printf("💳 [MOCK PAYMENT] Charge:\n")
	fmt.Printf("   Amount: %.2f EUR (%d cents)\n", amountEuros, amountCents)
	fmt.Printf("   Customer: %s\n", customerID)
	fmt.Printf("   Description: %s\n", description)

	// Simular una pequeña latencia de red
	time.Sleep(100 * time.Millisecond)

	// 95% de éxito, 5% de fallo simulado
	if rand.Intn(100) < 95 {
		fmt.Printf("   ✅ SUCCESS - Payment Intent: %s\n\n", paymentIntentID)
		return paymentIntentID, nil
	}

	fmt.Printf("   ❌ FAILED - Simulated payment failure\n\n")
	return "", domain.ErrPaymentFailed
}

// Refund simula un reembolso
func (m *MockPaymentProvider) Refund(paymentIntentID string, amountCents int) (string, error) {
	refundID := fmt.Sprintf("re_mock_%d", time.Now().UnixNano())
	amountEuros := float64(amountCents) / 100.0

	fmt.Printf("↩️  [MOCK PAYMENT] Refund:\n")
	fmt.Printf("   Amount: %.2f EUR (%d cents)\n", amountEuros, amountCents)
	fmt.Printf("   Payment Intent: %s\n", paymentIntentID)

	// Simular latencia
	time.Sleep(100 * time.Millisecond)

	fmt.Printf("   ✅ SUCCESS - Refund ID: %s\n\n", refundID)

	return refundID, nil
}
