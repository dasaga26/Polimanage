package database

import (
	"backend-go/shared/database"
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect() {
	var err error

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	// Configuración de GORM con logger
	config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	}

	DB, err = gorm.Open(postgres.Open(dsn), config)
	if err != nil {
		log.Fatal("❌ Error conectando a la base de datos: ", err)
	}

	log.Println("✅ Conectado a PostgreSQL exitosamente")

	// Ejecutar migraciones automáticas
	if err := Migrate(); err != nil {
		log.Fatal("❌ Error ejecutando migraciones: ", err)
	}

	// Seed data inicial
	if err := SeedData(); err != nil {
		log.Printf("⚠️  Advertencia al insertar seed data: %v", err)
	}
}

// Migrate ejecuta las migraciones automáticas de GORM
func Migrate() error {
	log.Println("🔧 Ejecutando migraciones de base de datos con GORM AutoMigrate...")

	// Dropear TODAS las tablas existentes para evitar conflictos de constraints
	// Esto ocurre cuando db_init.sql crea tablas con naming diferente a GORM
	log.Println("⚠️  Limpiando tablas existentes para evitar conflictos de constraints...")
	DB.Exec("DROP SCHEMA public CASCADE")
	DB.Exec("CREATE SCHEMA public")
	DB.Exec("GRANT ALL ON SCHEMA public TO postgres")
	DB.Exec("GRANT ALL ON SCHEMA public TO public")
	log.Println("✅ Schema recreado limpio, AutoMigrate creará todas las tablas")

	// Orden de migración respetando las dependencias (FKs)
	models := []interface{}{
		// Módulo 1: Identidad
		&database.Role{},
		&database.User{},

		// Módulo 2: Recursos y Reservas
		&database.Pista{},
		&database.Booking{},

		// Módulo 3: Academia
		&database.Class{},
		&database.ClassEnrollment{},

		// Módulo 4: Clubs
		&database.Club{},
		&database.ClubMembership{},

		// Módulo 5: Pagos
		&database.Payment{},
	}

	err := DB.AutoMigrate(models...)
	if err != nil {
		return fmt.Errorf("error en AutoMigrate: %w", err)
	}

	// Generar slugs para clases existentes que no lo tienen
	if err := generateMissingSlugs(); err != nil {
		return fmt.Errorf("error generando slugs: %w", err)
	}

	// Crear índices adicionales y constraints que GORM no crea automáticamente
	if err := createCustomConstraints(); err != nil {
		return fmt.Errorf("error creando constraints personalizados: %w", err)
	}

	log.Println("✅ Migraciones completadas exitosamente")
	return nil
}

// generateMissingSlugs genera slugs para las clases existentes que no tienen
func generateMissingSlugs() error {
	log.Println("🔧 Generando slugs para clases existentes...")

	// Obtener todas las clases sin slug
	var classes []database.Class
	if err := DB.Where("slug IS NULL OR slug = ''").Find(&classes).Error; err != nil {
		return err
	}

	if len(classes) == 0 {
		log.Println("✅ Todas las clases ya tienen slug")
		return nil
	}

	log.Printf("📝 Generando slugs para %d clases...", len(classes))

	// Generar y actualizar slugs
	for _, class := range classes {
		slug := generateClassSlug(class.Title, class.StartTime)
		if err := DB.Model(&class).Update("slug", slug).Error; err != nil {
			return fmt.Errorf("error actualizando slug para clase %d: %w", class.ID, err)
		}
	}

	log.Printf("✅ Slugs generados para %d clases", len(classes))
	return nil
}

// generateClassSlug genera un slug único para una clase
func generateClassSlug(title string, startTime time.Time) string {
	// Formato: "title-YYYYMMDD-HHMM"
	slug := title
	slug = fmt.Sprintf("%s-%s", slug, startTime.Format("20060102-1504"))
	return slug
}

// createCustomConstraints añade constraints que GORM no maneja automáticamente
func createCustomConstraints() error {
	// Constraint de Exclusive Arc en payments (solo Booking o ClassEnrollment)
	err := DB.Exec(`
		DO $$ BEGIN
			IF NOT EXISTS (
				SELECT 1 FROM pg_constraint WHERE conname = 'check_payment_origin'
			) THEN
				ALTER TABLE payments ADD CONSTRAINT check_payment_origin CHECK (
					(booking_id IS NOT NULL)::integer + 
					(class_enrollment_id IS NOT NULL)::integer
					= 1
				);
			END IF;
		END $$;
	`).Error

	if err != nil {
		return fmt.Errorf("error creando constraint de Exclusive Arc: %w", err)
	}

	// Índice único compuesto para prevenir solapamientos en bookings
	// GORM ya lo crea con uniqueIndex:idx_booking_overlap

	log.Println("✅ Constraints personalizados creados")
	return nil
}

// SeedData inserta datos iniciales en la base de datos
func SeedData() error {
	log.Println("🌱 Insertando datos iniciales (seed data)...")

	// Seed Roles
	roles := []database.Role{
		{ID: 1, Name: "ADMIN", Description: "Administrador con acceso completo al sistema"},
		{ID: 2, Name: "GESTOR", Description: "Personal del polideportivo con permisos de gestión"},
		{ID: 3, Name: "CLUB", Description: "Dueño/Gestor de club deportivo"},
		{ID: 4, Name: "MONITOR", Description: "Monitor de clases y entrenamientos"},
		{ID: 5, Name: "CLIENTE", Description: "Usuario externo del polideportivo"},
	}

	for _, role := range roles {
		result := DB.FirstOrCreate(&role, database.Role{ID: role.ID})
		if result.Error != nil {
			return fmt.Errorf("error insertando rol %s: %w", role.Name, result.Error)
		}
	}

	log.Println("✅ Seed data insertado correctamente")

	// Seed datos de prueba adicionales (solo si no existen)
	seedDemoData()

	return nil
}

// seedDemoData inserta datos de demostración
func seedDemoData() {
	// Verificar si ya hay usuarios (aparte del sistema)
	var userCount int64
	DB.Model(&database.User{}).Count(&userCount)

	if userCount > 0 {
		log.Println("ℹ️  Datos de demostración ya existen, saltando seed...")
		return
	}

	log.Println("🎭 Insertando datos de demostración...")

	// Usuario admin de prueba
	phone1 := "+34600000001"
	adminUser := database.User{
		RoleID:       1,
		Slug:         "admin-demo",
		Email:        "admin@polimanage.com",
		PasswordHash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
		FullName:     "Admin Demo",
		Phone:        &phone1,
		IsActive:     true,
	}
	DB.Create(&adminUser)

	// Usuario cliente de prueba
	phone2 := "+34600000002"
	clientUser := database.User{
		RoleID:       5,
		Slug:         "cliente-demo",
		Email:        "cliente@polimanage.com",
		PasswordHash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
		FullName:     "Cliente Demo",
		Phone:        &phone2,
		IsActive:     true,
	}
	DB.Create(&clientUser)

	// Pistas con deportes reales
	desc1 := "Césped artificial de alta calidad"
	desc2 := "Césped artificial de alta calidad"
	desc3 := "Cristal panorámico con iluminación LED"
	desc4 := "Tierra batida profesional"
	desc5 := "Superficie dura con marcado oficial"
	desc6 := "Parquet deportivo con marcado para fútbol sala"
	desc7 := "Parquet deportivo con marcado para baloncesto"
	desc8 := "Parquet multiusos con red de voleibol"
	desc9 := "Cemento pulido con paredes de vidrio"
	desc10 := "Cemento pulido con paredes de vidrio"

	pistas := []database.Pista{
		{Name: "Pista Pádel 1", Slug: "pista-padel-1", Type: "Pádel", Status: "AVAILABLE", BasePriceCents: 2000, LocationInfo: &desc1},
		{Name: "Pista Pádel 2", Slug: "pista-padel-2", Type: "Pádel", Status: "AVAILABLE", BasePriceCents: 2000, LocationInfo: &desc2},
		{Name: "Pista Pádel 3", Slug: "pista-padel-3", Type: "Pádel", Status: "AVAILABLE", BasePriceCents: 2500, LocationInfo: &desc3},
		{Name: "Pista Tenis 1", Slug: "pista-tenis-1", Type: "Tenis", Status: "AVAILABLE", BasePriceCents: 2200, LocationInfo: &desc4},
		{Name: "Pista Tenis 2", Slug: "pista-tenis-2", Type: "Tenis", Status: "AVAILABLE", BasePriceCents: 2000, LocationInfo: &desc5},
		{Name: "Pista Fútbol Sala", Slug: "pista-futbol-sala", Type: "Fútbol Sala", Status: "AVAILABLE", BasePriceCents: 3500, LocationInfo: &desc6},
		{Name: "Pista Baloncesto", Slug: "pista-baloncesto", Type: "Baloncesto", Status: "AVAILABLE", BasePriceCents: 3000, LocationInfo: &desc7},
		{Name: "Pista Voleibol", Slug: "pista-voleibol", Type: "Voleibol", Status: "AVAILABLE", BasePriceCents: 2500, LocationInfo: &desc8},
		{Name: "Pista Squash 1", Slug: "pista-squash-1", Type: "Squash", Status: "AVAILABLE", BasePriceCents: 1800, LocationInfo: &desc9},
		{Name: "Pista Squash 2", Slug: "pista-squash-2", Type: "Squash", Status: "AVAILABLE", BasePriceCents: 1800, LocationInfo: &desc10},
	}
	for _, pista := range pistas {
		DB.Create(&pista)
	}

	log.Println("✅ Datos de demostración insertados")
}
