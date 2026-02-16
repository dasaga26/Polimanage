# 💸 Módulo de Pagos - PoliManage

## Arquitectura

Este módulo sigue **Clean Architecture** con separación completa de capas:

```
features/payments/
├── domain/              # Entidades puras + interfaces
│   ├── payment.go
│   ├── payment_gateway.go
│   └── payment_repository.go
├── application/         # Lógica de negocio
│   └── payment_service.go
├── infrastructure/      # Implementaciones externas
│   ├── mock_payment_provider.go
│   ├── payment_repository_impl.go
│   └── payment_mapper.go
└── presentation/        # HTTP handlers + DTOs
    ├── payment_handler.go
    ├── payment_request.go
    ├── payment_response.go
    └── payment_routes.go
```

## PaymentGateway - Patrón Provider

El sistema usa **Dependency Injection** con la interfaz `PaymentGateway`:

```go
type PaymentGateway interface {
    CreateCustomer(email, name string) (string, error)
    Charge(amountCents int, customerID string, description string) (string, error)
    Refund(paymentIntentID string, amountCents int) (string, error)
}
```

### Implementaciones:

1. **MockPaymentProvider** (actual) - Para desarrollo
2. **StripePaymentProvider** (futuro) - Para producción

## Uso del Servicio

### 1. Pago de Reserva (Booking)

```go
payment, err := paymentService.ProcessBookingPayment(
    userID,      // ID del usuario
    bookingID,   // ID de la reserva
    2500,        // 25.00 EUR en centavos
    "cus_xyz",   // ID del cliente en Stripe
)
```

### 2. Pago de Clase

```go
payment, err := paymentService.ProcessClassPayment(
    userID,
    enrollmentID,
    1500,        // 15.00 EUR
    "cus_abc",
)
```

### 3. Pago de Membresía a Club

```go
payment, err := paymentService.ProcessClubPayment(
    userID,
    membershipID,
    5000,        // 50.00 EUR
    "cus_def",
)
```

### 4. Reembolso

```go
err := paymentService.RefundPayment(paymentID)
```

## Endpoints API

### Procesar Pagos

```http
POST /api/payments
Content-Type: application/json

{
  "user_id": 1,
  "amount_cents": 2500,
  "customer_id": "cus_mock_123",
  "description": "Pago de reserva"
}
```

```http
POST /api/payments/booking
POST /api/payments/class
POST /api/payments/club
```

### Consultar Pagos

```http
GET /api/payments/:id
GET /api/payments/user/:user_id
```

### Reembolsar

```http
POST /api/payments/refund
Content-Type: application/json

{
  "payment_id": 42
}
```

## MockPaymentProvider - Simulación

El proveedor mock simula el comportamiento de Stripe:

### Características:

- ✅ Genera IDs ficticios: `cus_mock_xxx`, `pi_mock_xxx`
- ✅ Loguea operaciones en consola con emojis
- ✅ Simula latencia de red (100ms)
- ✅ 95% de éxito, 5% de fallo aleatorio
- ✅ No requiere claves API reales

### Ejemplo de Log:

```
💳 [MOCK PAYMENT] Charge:
   Amount: 25.00 EUR (2500 cents)
   Customer: cus_mock_1234567890
   Description: Pago de reserva #42
   ✅ SUCCESS - Payment Intent: pi_mock_9876543210
```

## Validación de Pagos

El dominio valida automáticamente:

- ✅ Monto mayor a 0
- ✅ **Exclusive Arc**: Solo una referencia (booking, class, club)
- ❌ No permite múltiples referencias simultáneas

```go
payment.BookingID = &bookingID
payment.ClassEnrollmentID = &enrollmentID  // ❌ Error: ErrMultipleReferences
```

## Estados de Pago

- `PENDING` - Pago iniciado
- `COMPLETED` - Pago exitoso
- `FAILED` - Pago fallido
- `REFUNDED` - Reembolsado

## Migración a Stripe Real

Para cambiar a Stripe en producción:

1. Crear `StripePaymentProvider` implementando `PaymentGateway`
2. En `main.go`, cambiar:

```go
// ANTES (Mock)
paymentGateway := paymentInfra.NewMockPaymentProvider()

// DESPUÉS (Stripe)
paymentGateway := paymentInfra.NewStripePaymentProvider(stripeKey)
```

3. ✅ El resto del código **NO CAMBIA** (Dependency Inversion)

## Integración con otros módulos

### Desde Bookings:

```go
// Después de crear una reserva
payment, err := paymentService.ProcessBookingPayment(
    booking.UserID,
    booking.ID,
    booking.PriceSnapshotCents,
    user.StripeCustomerID,
)
```

### Desde Classes:

```go
// Al inscribir a un estudiante
payment, err := paymentService.ProcessClassPayment(
    enrollment.UserID,
    enrollment.ID,
    class.PriceCents,
    user.StripeCustomerID,
)
```

## Testing

El `MockPaymentProvider` facilita el testing:

```go
func TestPaymentFlow(t *testing.T) {
    mockGateway := infrastructure.NewMockPaymentProvider()
    repo := infrastructure.NewPaymentRepository(db)
    service := application.NewPaymentService(repo, mockGateway)
    
    payment, err := service.ProcessPayment(1, 1000, "cus_test", "Test")
    assert.NoError(t, err)
    assert.Equal(t, "COMPLETED", payment.Status)
}
```

## Ventajas del Diseño

✅ **Desacoplamiento**: El dominio no conoce Stripe  
✅ **Testeable**: Mock provider para tests rápidos  
✅ **Extensible**: Fácil agregar PayPal, etc.  
✅ **Clean**: Cumple SOLID y Clean Architecture  
✅ **Flexible**: Cambiar provider sin tocar lógica de negocio
