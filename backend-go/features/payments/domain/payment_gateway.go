package domain

// PaymentGateway define la interfaz para proveedores de pago
// Puede ser implementada por Stripe, PayPal, Mock, etc.
type PaymentGateway interface {
	// CreateCustomer crea un cliente en el proveedor de pagos
	// Retorna el ID del cliente en el sistema del proveedor
	CreateCustomer(email, name string) (string, error)

	// Charge procesa un cargo
	// Retorna el ID de la transacción/intento de pago
	Charge(amountCents int, customerID string, description string) (string, error)

	// Refund procesa un reembolso
	// Retorna el ID del reembolso
	Refund(paymentIntentID string, amountCents int) (string, error)
}
