package main

import (
	"log"
	"os"
	"time"

	// Feature AUTH (register, login, logout)
	authApp "backend-go/features/auth/application"
	authInfra "backend-go/features/auth/infrastructure"
	authPres "backend-go/features/auth/presentation"

	// Shared Security Services (Crypto, JWT)
	"backend-go/shared/security"

	// Feature USERS (getUser, update)
	userApp "backend-go/features/users/application"
	userInfra "backend-go/features/users/infrastructure"
	userPres "backend-go/features/users/presentation"

	// Feature PROFILE (getProfile, follow, unfollow)
	profileApp "backend-go/features/profile/application"
	profileInfra "backend-go/features/profile/infrastructure"
	profilePres "backend-go/features/profile/presentation"

	bookingApp "backend-go/features/bookings/application"
	bookingInfra "backend-go/features/bookings/infrastructure"
	bookingPres "backend-go/features/bookings/presentation"
	classApp "backend-go/features/classes/application"
	classInfra "backend-go/features/classes/infrastructure"
	classPres "backend-go/features/classes/presentation"
	clubApp "backend-go/features/clubs/application"
	clubInfra "backend-go/features/clubs/infrastructure"
	clubPres "backend-go/features/clubs/presentation"
	paymentApp "backend-go/features/payments/application"
	paymentInfra "backend-go/features/payments/infrastructure"
	paymentPres "backend-go/features/payments/presentation"
	"backend-go/features/pista/application"
	"backend-go/features/pista/infrastructure"
	"backend-go/features/pista/presentation"
	roleApp "backend-go/features/roles/application"
	roleInfra "backend-go/features/roles/infrastructure"
	rolePres "backend-go/features/roles/presentation"
	"backend-go/internal/database"
	"backend-go/internal/scheduler"
	"backend-go/shared/availability"
	sharedMiddleware "backend-go/shared/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"

	_ "backend-go/docs" // Importar docs generados por swag

	fiberSwagger "github.com/swaggo/fiber-swagger"
)

// @title PoliManage API
// @version 2.0
// @description API REST para gestión de instalaciones deportivas - Clean Architecture
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /api
// @schemes http

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No se encontró archivo .env, asegúrate de tener las variables configuradas.")
	}

	database.Connect()

	app := fiber.New(fiber.Config{
		AppName: "PoliManage Backend Go v2.0 - Clean Architecture",
	})

	// Middleware CORS - V2: Soporte para cookies con withCredentials
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173,http://localhost:3000", // Frontend Vite y alternativas
		AllowMethods:     "GET,POST,PUT,DELETE,PATCH,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization",
		AllowCredentials: true, // V2: Permite envío de cookies
	}))

	// ============================================================
	// SHARED SECURITY SERVICES (Argon2, JWT)
	// ============================================================
	cryptoService := security.NewArgon2CryptoService()

	// Leer JWT secret desde variable de entorno
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("❌ JWT_SECRET no está configurado en las variables de entorno")
	}
	jwtService := security.NewJWTService(jwtSecret)

	// ============================================================
	// MÓDULO 1: FEATURE AUTH (CtrlAuth: register, login, logout)
	// ============================================================
	// Infraestructura - Servicios específicos de Auth (DiceBear)
	avatarService := authInfra.NewDiceBearService()

	// Repository compartido
	userRepo := userInfra.NewUserRepository(database.DB)

	// V2: Repository para RefreshSessions
	sessionRepo := authInfra.NewRefreshSessionRepository(database.DB)

	// Aplicación - AuthService (V2: Incluye sessionRepo)
	authService := authApp.NewAuthService(userRepo, sessionRepo, cryptoService, jwtService, avatarService)

	// Presentación - AuthHandler
	authHandler := authPres.NewAuthHandler(authService)

	// Rutas públicas Auth
	authPres.RegisterAuthRoutes(app, authHandler)

	// ============================================================
	// MÓDULO 2: FEATURE USERS (CtrlUser: getUser, update, updatePassword)
	// ============================================================
	// Aplicación - UserService (usa CryptoService para UpdatePassword)
	userService := userApp.NewUserService(userRepo, cryptoService)

	// Presentación - UserHandler
	userHandler := userPres.NewUserHandler(userService)

	// Rutas Users
	userPres.RegisterRoutes(app, userHandler, jwtService)

	// ============================================================
	// MÓDULO 3: FEATURE PROFILE (CtrlProfile: getProfile, follow, unfollow)
	// ============================================================
	// Repository Profile
	profileRepo := profileInfra.NewProfileRepository(database.DB)

	// Aplicación - ProfileService (necesita cryptoService)
	profileService := profileApp.NewProfileService(profileRepo, cryptoService)

	// Presentación - ProfileHandler
	profileHandler := profilePres.NewProfileHandler(profileService)

	// Rutas Profile (protegidas con JWT)
	profilePres.RegisterProfileRoutes(app, profileHandler, jwtService)

	// ============================================================
	// MÓDULO ROLES (Catálogo de Roles)
	// ============================================================
	roleRepo := roleInfra.NewRoleRepository(database.DB)
	roleService := roleApp.NewRoleService(roleRepo)
	roleHandler := rolePres.NewRoleHandler(roleService)
	rolePres.RegisterRoutes(app, roleHandler, jwtService)

	// ============================================================
	// OTROS MÓDULOS (Pistas, Bookings, Classes, Clubs, Payments)
	// ============================================================
	pistaRepo := infrastructure.NewPistaRepository(database.DB)
	pistaService := application.NewPistaService(pistaRepo)
	pistaHandler := presentation.NewPistaHandler(pistaService)
	presentation.RegisterRoutes(app, pistaHandler, jwtService)

	// Servicio de disponibilidad compartido (pistas no pueden tener booking Y clase al mismo tiempo)
	bookingRepo := bookingInfra.NewBookingRepository(database.DB)
	classRepo := classInfra.NewClassRepository(database.DB)
	availabilityService := availability.NewAvailabilityService(database.DB)

	// Módulo Bookings (Reservas)
	bookingService := bookingApp.NewBookingService(bookingRepo, database.DB)
	bookingHandler := bookingPres.NewBookingHandler(bookingService)
	bookingPres.RegisterRoutes(app, bookingHandler, jwtService)

	// Módulo Classes (Clases Grupales)
	classService := classApp.NewClassService(classRepo, availabilityService)
	classHandler := classPres.NewClassHandler(classService)

	// Módulo Enrollments (Inscripciones a Clases) - Dentro de Classes
	enrollmentRepo := classInfra.NewEnrollmentRepository(database.DB)
	classProvider := classApp.NewClassProvider(classService)
	classUserProvider := userApp.NewClassUserProvider(userRepo)
	enrollmentService := classApp.NewEnrollmentService(enrollmentRepo, classProvider, classUserProvider)
	enrollmentHandler := classPres.NewEnrollmentHandler(enrollmentService)

	// Registrar rutas con enrollmentHandler
	classPres.RegisterRoutes(app, classHandler, enrollmentHandler, jwtService)
	classPres.RegisterEnrollmentRoutes(app.Group("/api/enrollments"), enrollmentHandler, jwtService)

	// Módulo Clubs (Clubs deportivos y membresías)
	clubRepo := clubInfra.NewClubRepository(database.DB)
	clubMembershipRepo := clubInfra.NewClubMembershipRepository(database.DB)
	clubService := clubApp.NewClubService(clubRepo, clubMembershipRepo)
	clubMembershipService := clubApp.NewClubMembershipService(clubMembershipRepo)
	clubUserProvider := userApp.NewClubUserProvider(userRepo)

	// Módulo Payments (Pagos con Mock Provider)
	paymentGateway := paymentInfra.NewMockPaymentProvider()
	paymentRepo := paymentInfra.NewPaymentRepository(database.DB)
	paymentService := paymentApp.NewPaymentService(paymentRepo, paymentGateway)
	paymentHandler := paymentPres.NewPaymentHandler(paymentService)
	paymentPres.RegisterRoutes(app, paymentHandler, jwtService)

	// Servicio de renovación de membresías (integra Clubs + Payments)
	renewalService := clubApp.NewRenewalService(clubMembershipRepo, clubRepo, paymentService)
	clubHandler := clubPres.NewClubHandler(clubService, clubMembershipService, renewalService, clubUserProvider)
	clubPres.RegisterRoutes(app, clubHandler, jwtService)

	// ============================================================
	// RUTAS PROTEGIDAS CON JWT MIDDLEWARE
	// 🧠 El backend NO confía en el JWT - Validación en 7 pasos
	// ============================================================

	// Auth protegidas (GET /me, POST /refresh, POST /logout)
	protectedAuth := app.Group("/api/auth")
	protectedAuth.Use(sharedMiddleware.JWTMiddleware(jwtService))
	authPres.RegisterProtectedAuthRoutes(protectedAuth, authHandler)

	// ============================================================
	// SWAGGER - Documentación de API
	// ============================================================
	app.Get("/swagger/*", fiberSwagger.WrapHandler)

	// ============================================================
	// SCHEDULER - Tareas automáticas en segundo plano
	// ============================================================
	taskScheduler := scheduler.NewScheduler(10 * time.Minute) // Ejecutar cada 10 minutos

	// Tarea 1: Actualizar estados de reservas
	taskScheduler.AddTask(scheduler.ScheduledTask{
		Name:     "Actualizar estados de reservas",
		Interval: 10 * time.Minute,
		Execute: func() error {
			count, err := bookingService.AutoUpdateBookingStatuses()
			if err != nil {
				log.Printf("[Scheduler] Error actualizando estados de reservas: %v", err)
				return err
			}
			if count > 0 {
				log.Printf("[Scheduler] %d reservas actualizadas automáticamente", count)
			}
			return nil
		},
	})

	// Tarea 2: Actualizar estados de clases
	taskScheduler.AddTask(scheduler.ScheduledTask{
		Name:     "Actualizar estados de clases",
		Interval: 10 * time.Minute,
		Execute: func() error {
			count, err := classService.AutoUpdateClassStatuses()
			if err != nil {
				log.Printf("[Scheduler] Error actualizando estados de clases: %v", err)
				return err
			}
			if count > 0 {
				log.Printf("[Scheduler] %d clases actualizadas automáticamente", count)
			}
			return nil
		},
	})

	// Iniciar el scheduler
	taskScheduler.Start()

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Servidor GO (Identity & Finance) funcionando correctamente",
			"status":  "ok",
		})
	})

	log.Println("🚀 Servidor corriendo en http://localhost:8080")
	log.Fatal(app.Listen(":8080"))
}
