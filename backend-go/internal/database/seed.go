package database

import (
	"backend-go/shared/database"
	"backend-go/shared/security"
	"fmt"
	"log"
	"time"
)

// seedDemoData inserta un conjunto completo de datos de demostración para PoliManage.
// Se salta si ya existen usuarios en la base de datos.
func seedDemoData() {
	var userCount int64
	DB.Model(&database.User{}).Count(&userCount)
	if userCount > 0 {
		log.Println("ℹ️  Datos de demostración ya existen, saltando seed...")
		return
	}

	log.Println("🎭 Insertando datos de demostración completos...")

	cryptoService := security.NewArgon2CryptoService()

	adminHash, _ := cryptoService.HashPassword("admin123")
	gestorHash, _ := cryptoService.HashPassword("gestor123")
	clubHash, _ := cryptoService.HashPassword("club123")
	monitorHash, _ := cryptoService.HashPassword("monitor123")
	clienteHash, _ := cryptoService.HashPassword("cliente123")

	p := func(s string) *string { return &s }

	now := time.Now().UTC()
	day := func(offset int) time.Time {
		return now.Truncate(24*time.Hour).AddDate(0, 0, offset)
	}
	at := func(base time.Time, h, m int) time.Time {
		return time.Date(base.Year(), base.Month(), base.Day(), h, m, 0, 0, time.UTC)
	}

	// =========================================================================
	// USUARIOS
	// =========================================================================

	// — ADMIN —
	admin := database.User{
		RoleID:       1,
		Slug:         "alejandro-sanchez",
		Email:        "admin@polimanage.com",
		PasswordHash: adminHash,
		FullName:     "Alejandro Sánchez",
		Phone:        p("+34600000001"),
		AvatarURL:    p("https://i.pravatar.cc/200?img=11"),
		IsActive:     true,
	}
	must(DB.Create(&admin).Error, "admin")

	// — GESTORES —
	gestor1 := database.User{
		RoleID:       2,
		Slug:         "patricia-moreno",
		Email:        "gestor@polimanage.com",
		PasswordHash: gestorHash,
		FullName:     "Patricia Moreno",
		Phone:        p("+34600000002"),
		AvatarURL:    p("https://i.pravatar.cc/200?img=47"),
		IsActive:     true,
	}
	gestor2 := database.User{
		RoleID:       2,
		Slug:         "roberto-jimenez",
		Email:        "gestor2@polimanage.com",
		PasswordHash: gestorHash,
		FullName:     "Roberto Jiménez",
		Phone:        p("+34600000003"),
		AvatarURL:    p("https://i.pravatar.cc/200?img=33"),
		IsActive:     true,
	}
	must(DB.Create(&gestor1).Error, "gestor1")
	must(DB.Create(&gestor2).Error, "gestor2")

	// — PROPIETARIOS DE CLUB —
	clubOwner1 := database.User{
		RoleID:       3,
		Slug:         "marcos-fernandez",
		Email:        "marcos@padelfcb.com",
		PasswordHash: clubHash,
		FullName:     "Marcos Fernández",
		Phone:        p("+34600000004"),
		AvatarURL:    p("https://i.pravatar.cc/200?img=57"),
		IsActive:     true,
	}
	clubOwner2 := database.User{
		RoleID:       3,
		Slug:         "elena-vidal",
		Email:        "elena@tennisclub.com",
		PasswordHash: clubHash,
		FullName:     "Elena Vidal",
		Phone:        p("+34600000005"),
		AvatarURL:    p("https://i.pravatar.cc/200?img=16"),
		IsActive:     true,
	}
	clubOwner3 := database.User{
		RoleID:       3,
		Slug:         "diego-torres",
		Email:        "diego@basketclub.com",
		PasswordHash: clubHash,
		FullName:     "Diego Torres",
		Phone:        p("+34600000006"),
		AvatarURL:    p("https://i.pravatar.cc/200?img=52"),
		IsActive:     true,
	}
	must(DB.Create(&clubOwner1).Error, "clubOwner1")
	must(DB.Create(&clubOwner2).Error, "clubOwner2")
	must(DB.Create(&clubOwner3).Error, "clubOwner3")

	// — MONITORES (instructores) —
	monitor1 := database.User{ // Pádel
		RoleID:       4,
		Slug:         "javier-garcia-padel",
		Email:        "javier.garcia@polimanage.com",
		PasswordHash: monitorHash,
		FullName:     "Javier García",
		Phone:        p("+34600000007"),
		AvatarURL:    p("https://i.pravatar.cc/200?img=12"),
		IsActive:     true,
	}
	monitor2 := database.User{ // Tenis
		RoleID:       4,
		Slug:         "carmen-ruiz-tenis",
		Email:        "carmen.ruiz@polimanage.com",
		PasswordHash: monitorHash,
		FullName:     "Carmen Ruiz",
		Phone:        p("+34600000008"),
		AvatarURL:    p("https://i.pravatar.cc/200?img=25"),
		IsActive:     true,
	}
	monitor3 := database.User{ // Baloncesto
		RoleID:       4,
		Slug:         "david-lopez-basket",
		Email:        "david.lopez@polimanage.com",
		PasswordHash: monitorHash,
		FullName:     "David López",
		Phone:        p("+34600000009"),
		AvatarURL:    p("https://i.pravatar.cc/200?img=53"),
		IsActive:     true,
	}
	monitor4 := database.User{ // Fitness / Yoga
		RoleID:       4,
		Slug:         "isabel-martinez-fitness",
		Email:        "isabel.martinez@polimanage.com",
		PasswordHash: monitorHash,
		FullName:     "Isabel Martínez",
		Phone:        p("+34600000010"),
		AvatarURL:    p("https://i.pravatar.cc/200?img=21"),
		IsActive:     true,
	}
	must(DB.Create(&monitor1).Error, "monitor1")
	must(DB.Create(&monitor2).Error, "monitor2")
	must(DB.Create(&monitor3).Error, "monitor3")
	must(DB.Create(&monitor4).Error, "monitor4")

	// — CLIENTES (10) —
	type clientSeed struct {
		name  string
		slug  string
		email string
		phone string
		img   int
	}
	clientSeeds := []clientSeed{
		{"Ana González", "ana-gonzalez", "ana.gonzalez@email.com", "+34611000011", 1},
		{"Luis Rodríguez", "luis-rodriguez", "luis.rodriguez@email.com", "+34611000012", 3},
		{"Sara Pérez", "sara-perez", "sara.perez@email.com", "+34611000013", 10},
		{"Miguel Hernández", "miguel-hernandez", "miguel.hernandez@email.com", "+34611000014", 5},
		{"Laura Díaz", "laura-diaz", "laura.diaz@email.com", "+34611000015", 28},
		{"Pedro Alonso", "pedro-alonso", "pedro.alonso@email.com", "+34611000016", 8},
		{"María Fernández", "maria-fernandez-cliente", "maria.fernandez@email.com", "+34611000017", 32},
		{"Carlos Navarro", "carlos-navarro", "carlos.navarro@email.com", "+34611000018", 14},
		{"Sofía Muñoz", "sofia-munoz", "sofia.munoz@email.com", "+34611000019", 46},
		{"Andrés Castro", "andres-castro", "andres.castro@email.com", "+34611000020", 17},
	}
	clients := make([]database.User, len(clientSeeds))
	for i, cs := range clientSeeds {
		av := fmt.Sprintf("https://i.pravatar.cc/200?img=%d", cs.img)
		u := database.User{
			RoleID:       5,
			Slug:         cs.slug,
			Email:        cs.email,
			PasswordHash: clienteHash,
			FullName:     cs.name,
			Phone:        p(cs.phone),
			AvatarURL:    &av,
			IsActive:     true,
		}
		must(DB.Create(&u).Error, "cliente "+cs.name)
		clients[i] = u
	}

	log.Println("✅ Usuarios creados")

	// =========================================================================
	// PISTAS (con imágenes de Unsplash)
	// =========================================================================
	type pistaSeed struct {
		name   string
		slug   string
		tipo   string
		surf   string
		loc    string
		img    string
		price  int
		status string
	}
	pistaSeeds := []pistaSeed{
		{
			"Pista Pádel 1", "pista-padel-1", "Pádel",
			"Moqueta azul", "Interior climatizado · Zona A",
			"https://cdn.pixabay.com/photo/2021/01/07/15/41/padel-5897641_1280.jpg",
			2000, "AVAILABLE",
		},
		{
			"Pista Pádel 2", "pista-padel-2", "Pádel",
			"Moqueta verde", "Interior climatizado · Zona A",
			"https://cdn.pixabay.com/photo/2021/01/07/15/41/padel-5897641_1280.jpg",
			2000, "AVAILABLE",
		},
		{
			"Pista Pádel Cristal", "pista-padel-cristal", "Pádel",
			"Cristal panorámico", "Interior Premium · Zona VIP",
			"https://cdn.pixabay.com/photo/2021/01/07/15/41/padel-5897641_1280.jpg",
			2800, "AVAILABLE",
		},
		{
			"Pista Tenis 1", "pista-tenis-1", "Tenis",
			"Tierra batida", "Exterior · Zona B",
			"https://cdn.pixabay.com/photo/2014/10/22/17/25/tennis-498256_1280.jpg",
			2200, "AVAILABLE",
		},
		{
			"Pista Tenis 2", "pista-tenis-2", "Tenis",
			"Pista rápida (resina)", "Interior climatizado · Zona B",
			"https://cdn.pixabay.com/photo/2014/10/22/17/25/tennis-498256_1280.jpg",
			2500, "AVAILABLE",
		},
		{
			"Pista Fútbol Sala", "pista-futbol-sala", "Fútbol Sala",
			"Parquet deportivo", "Pabellón principal · Planta baja",
			"https://cdn.pixabay.com/photo/2014/10/14/20/24/ball-488700_1280.jpg",
			3500, "AVAILABLE",
		},
		{
			"Pista Baloncesto", "pista-baloncesto", "Baloncesto",
			"Parquet profesional", "Pabellón principal · Planta baja",
			"https://cdn.pixabay.com/photo/2016/11/18/14/05/basketball-1834730_1280.jpg",
			3000, "AVAILABLE",
		},
		{
			"Pista Voleibol", "pista-voleibol", "Voleibol",
			"Parquet multiusos", "Pabellón principal · Planta baja",
			"https://cdn.pixabay.com/photo/2017/04/27/08/36/gym-2264825_1280.jpg",
			2500, "AVAILABLE",
		},
		{
			"Pista Squash 1", "pista-squash-1", "Squash",
			"Cemento pulido", "Zona squash · Interior",
			"https://cdn.pixabay.com/photo/2017/04/27/08/36/gym-2264825_1280.jpg",
			1800, "AVAILABLE",
		},
		{
			"Pista Squash 2", "pista-squash-2", "Squash",
			"Cemento pulido", "Zona squash · Interior",
			"https://cdn.pixabay.com/photo/2017/04/27/08/36/gym-2264825_1280.jpg",
			1800, "AVAILABLE",
		},
	}
	pistas := make([]database.Pista, len(pistaSeeds))
	for i, ps := range pistaSeeds {
		pista := database.Pista{
			Name:           ps.name,
			Slug:           ps.slug,
			Type:           ps.tipo,
			Surface:        p(ps.surf),
			LocationInfo:   p(ps.loc),
			ImageURL:       p(ps.img),
			BasePriceCents: ps.price,
			Status:         ps.status,
			IsActive:       true,
		}
		must(DB.Create(&pista).Error, "pista "+ps.name)
		pistas[i] = pista
	}

	// Índice: pistas[0]=Padel1, [1]=Padel2, [2]=PadelCristal, [3]=Tenis1, [4]=Tenis2,
	//         [5]=FutbolSala, [6]=Baloncesto, [7]=Voleibol, [8]=Squash1, [9]=Squash2

	log.Println("✅ Pistas creadas")

	// =========================================================================
	// CLUBS (con logos de Unsplash)
	// =========================================================================
	type clubSeed struct {
		ownerIdx    int // índice en [clubOwner1, clubOwner2, clubOwner3]
		slug        string
		name        string
		description string
		logoURL     string
		maxMembers  int
		feeCents    int
	}
	owners := []database.User{clubOwner1, clubOwner2, clubOwner3}
	clubSeeds := []clubSeed{
		{
			0, "padel-fc-barcelona", "Pádel FC Barcelona",
			"Club de pádel",
			"https://cdn.pixabay.com/photo/2016/09/15/15/06/tennis-1671842_1280.jpg",
			200, 4500,
		},
		{
			1, "club-tennis-elite", "Club Tennis Elite",
			"Tenis de élite",
			"https://cdn.pixabay.com/photo/2016/09/15/15/06/tennis-1671842_1280.jpg",
			150, 5500,
		},
		{
			2, "club-basket-valencia", "Club Basket Valencia",
			"Club de baloncesto",
			"https://cdn.pixabay.com/photo/2016/03/27/07/08/gym-1282214_1280.jpg",
			80, 3500,
		},
		{
			1, "club-wellness-360", "Club Wellness 360",
			"Club de bienestar integral",
			"https://cdn.pixabay.com/photo/2016/03/27/07/08/gym-1282214_1280.jpg",
			300, 3000,
		},
		{
			0, "academia-junior-sport", "Academia Junior Sport",
			"Academia deportiva",
			"https://cdn.pixabay.com/photo/2016/03/27/07/08/gym-1282214_1280.jpg",
			100, 4000,
		},
	}
	clubs := make([]database.Club, len(clubSeeds))
	for i, cs := range clubSeeds {
		ownerID := owners[cs.ownerIdx].ID
		club := database.Club{
			OwnerID:         &ownerID,
			Slug:            cs.slug,
			Name:            cs.name,
			Description:     p(cs.description),
			LogoURL:         p(cs.logoURL),
			MaxMembers:      cs.maxMembers,
			MonthlyFeeCents: cs.feeCents,
			Status:          "ACTIVE",
			IsActive:        true,
		}
		must(DB.Create(&club).Error, "club "+cs.name)
		clubs[i] = club
	}

	log.Println("✅ Clubs creados")

	// =========================================================================
	// MEMBRESÍAS DE CLUBS
	// =========================================================================
	// clubs[0] = Pádel FC Barcelona  → clients 0,1,2,3,4
	// clubs[1] = Club Tennis Elite   → clients 2,3,4,5,6
	// clubs[2] = Club Basket Valencia → clients 5,6,7,8,9
	// clubs[3] = Club Wellness 360   → clients 0,1,2,3,7,8
	// clubs[4] = Academia Junior     → clients 4,5,6,9
	membershipGroups := []struct {
		clubIdx    int
		clientIdxs []int
	}{
		{0, []int{0, 1, 2, 3, 4}},
		{1, []int{2, 3, 4, 5, 6}},
		{2, []int{5, 6, 7, 8, 9}},
		{3, []int{0, 1, 2, 3, 7, 8}},
		{4, []int{4, 5, 6, 9}},
	}
	memberships := []database.ClubMembership{}
	pastMonth := now.AddDate(0, -1, 0)
	nextMonth := now.AddDate(0, 1, 0)
	for _, group := range membershipGroups {
		club := clubs[group.clubIdx]
		for _, ci := range group.clientIdxs {
			m := database.ClubMembership{
				ClubID:          club.ID,
				UserID:          clients[ci].ID,
				Status:          "ACTIVE",
				StartDate:       pastMonth,
				NextBillingDate: &nextMonth,
				PaymentStatus:   "UP_TO_DATE",
				IsActive:        true,
			}
			must(DB.Create(&m).Error, fmt.Sprintf("membership club%d client%d", group.clubIdx, ci))
			memberships = append(memberships, m)
		}
	}

	log.Println("✅ Membresías de clubs creadas")

	// =========================================================================
	// CLASES
	// =========================================================================
	type classSeed struct {
		title       string
		slug        string
		desc        string
		monitorUser database.User
		pistaIdx    int
		startDay    int // offset desde today
		startHour   int
		endHour     int
		capacity    int
		priceCents  int
		status      string
	}

	descPadelBasico := "Clase de pádel para principiantes. Aprende los fundamentos: técnica de golpeo, posicionamiento en pista y reglas básicas del juego. Material disponible para préstamo."
	descPadelAvanzado := "Perfecciona tu pádel con técnicas avanzadas: volea, bandeja, globo y smash. Entrenamiento táctico y estrategia de juego en pareja. Nivel medio-alto requerido."
	descPadelTorneos := "Preparación específica para torneos. Simulaciones de partidos, gestión de puntos clave y trabajo bajo presión. Exclusivo para jugadores con experiencia."
	descTenisIniciacion := "Iniciación al tenis: revés, derecha, saque y volea. Ejercicios progresivos y partidos supervisados. Raqueta disponible para préstamo sin coste adicional."
	descTenisIntensivo := "Entrenamiento intensivo de tenis enfocado en la mejora técnica y física. Ejercicios de velocidad, potencia y resistencia. Nivel intermedio-avanzado."
	descTenisAdultos := "Clases de tenis para adultos de todos los niveles. Ambiente relajado y social, mejora continua, con partidos amistosos al final de la sesión."
	descBasketIniciacion := "Iniciación al baloncesto: dribble, pase, tiro y defensa básica. Para jóvenes y adultos sin experiencia previa en este deporte. Ambiente dinámico."
	descBasketComp := "Entrenamiento orientado a la competición: estrategias ofensivas y defensivas, jugadas ensayadas y trabajo en equipo. Para jugadores con base en baloncesto."
	descZumba := "¡Muévete al ritmo de la música! Clase de Zumba energética con mezcla de ritmos latinos. Cardio de alto impacto, coordinación y mucha diversión. Para todos los niveles."
	descPilates := "Pilates de suelo enfocado en fortalecimiento de core y corrección postural. Mejora tu postura, alivia el dolor de espalda y gana conciencia corporal."
	descYoga := "Yoga para principiantes y nivel medio. Trabajo de respiración, flexibilidad y equilibrio. Encuentra la calma en una sesión de 60 minutos. Esterilla no incluida."
	descSquash := "Introducción al squash: reglas del juego, técnica básica de raqueta y movimiento en pista. Sesión práctica con ejercicios guiados. Raqueta incluida en el precio."

	classSeeds := []classSeed{
		// ── PASADAS (completadas) ──
		{"Pádel Básico", "padel-basico-" + day(-21).Format("20060102") + "-0900",
			descPadelBasico, monitor1, 0, -21, 9, 10, 8, 1500, "COMPLETED"},
		{"Tenis Iniciación", "tenis-iniciacion-" + day(-15).Format("20060102") + "-1000",
			descTenisIniciacion, monitor2, 3, -15, 10, 11, 8, 1500, "COMPLETED"},
		{"Yoga Mat", "yoga-mat-" + day(-10).Format("20060102") + "-1800",
			descYoga, monitor4, 5, -10, 18, 19, 15, 900, "COMPLETED"},

		// ── FUTURAS (abiertas) ──
		{"Pádel Básico", "padel-basico-" + day(7).Format("20060102") + "-0900",
			descPadelBasico, monitor1, 0, 7, 9, 10, 8, 1500, "OPEN"},
		{"Tenis Iniciación", "tenis-iniciacion-" + day(8).Format("20060102") + "-1000",
			descTenisIniciacion, monitor2, 3, 8, 10, 11, 8, 1500, "OPEN"},
		{"Baloncesto Básico", "baloncesto-basico-" + day(8).Format("20060102") + "-1700",
			descBasketIniciacion, monitor3, 6, 8, 17, 18, 12, 1200, "OPEN"},
		{"Zumba Fitness", "zumba-fitness-" + day(9).Format("20060102") + "-1900",
			descZumba, monitor4, 5, 9, 19, 20, 20, 1000, "OPEN"},
		{"Pádel Avanzado", "padel-avanzado-" + day(10).Format("20060102") + "-1100",
			descPadelAvanzado, monitor1, 1, 10, 11, 12, 6, 1800, "OPEN"},
		{"Tenis Avanzado", "tenis-avanzado-" + day(11).Format("20060102") + "-1100",
			descTenisIntensivo, monitor2, 4, 11, 11, 12, 6, 2000, "FULL"},
		{"Yoga Mat", "yoga-mat-" + day(12).Format("20060102") + "-1800",
			descYoga, monitor4, 5, 12, 18, 19, 15, 900, "OPEN"},
		{"Squash Iniciación", "squash-iniciacion-" + day(13).Format("20060102") + "-1700",
			descSquash, monitor1, 8, 13, 17, 18, 4, 1200, "OPEN"},
		{"Pádel Torneos", "padel-torneos-" + day(14).Format("20060102") + "-1000",
			descPadelTorneos, monitor1, 2, 14, 10, 11, 4, 2200, "OPEN"},
		{"Baloncesto Competición", "baloncesto-comp-" + day(16).Format("20060102") + "-1900",
			descBasketComp, monitor3, 6, 16, 19, 20, 12, 1500, "OPEN"},
		{"Pilates Core", "pilates-core-" + day(19).Format("20060102") + "-1900",
			descPilates, monitor4, 5, 19, 19, 20, 12, 1100, "OPEN"},
		{"Tenis Adultos", "tenis-adultos-" + day(22).Format("20060102") + "-0900",
			descTenisAdultos, monitor2, 3, 22, 9, 10, 8, 1300, "OPEN"},
	}

	classes := make([]database.Class, len(classSeeds))
	for i, cs := range classSeeds {
		baseDay := day(cs.startDay)
		st := at(baseDay, cs.startHour, 0)
		et := at(baseDay, cs.endHour, 0)
		class := database.Class{
			Slug:         cs.slug,
			PistaID:      pistas[cs.pistaIdx].ID,
			InstructorID: cs.monitorUser.ID,
			Title:        cs.title,
			Description:  p(cs.desc),
			StartTime:    st,
			EndTime:      et,
			Capacity:     cs.capacity,
			PriceCents:   cs.priceCents,
			Status:       cs.status,
		}
		must(DB.Create(&class).Error, "clase "+cs.title)
		classes[i] = class
	}

	log.Println("✅ Clases creadas")

	// =========================================================================
	// ENROLLMENTS (inscripciones a clases)
	// =========================================================================
	// Índice de clases:
	// [0] Pádel Básico COMPLETED      → clients 0,1,2,3
	// [1] Tenis Iniciación COMPLETED   → clients 2,3,4,5,6
	// [2] Yoga COMPLETED               → clients 0,1,5,7,8
	// [3] Pádel Básico OPEN            → clients 0,1,2,3
	// [4] Tenis Iniciación OPEN        → clients 2,4,5
	// [5] Baloncesto Básico OPEN       → clients 3,6,7,8
	// [6] Zumba OPEN                   → clients 0,1,4,7,8,9
	// [7] Pádel Avanzado OPEN          → clients 0,1,3,4,5  (5/6)
	// [8] Tenis Avanzado FULL          → clients 2,3,4,5,6,7 (6/6 full)
	// [9] Yoga OPEN                    → clients 1,5,6,7,9
	// [10] Squash OPEN                 → clients 0,2,4
	// [11] Pádel Torneos OPEN          → clients 1,3
	// [12] Baloncesto Comp OPEN        → clients 6,7,8,9
	// [13] Pilates OPEN                → clients 0,1,8
	// [14] Tenis Adultos OPEN          → clients 4,5,9
	enrollmentGroups := []struct {
		classIdx   int
		clientIdxs []int
	}{
		{0, []int{0, 1, 2, 3}},
		{1, []int{2, 3, 4, 5, 6}},
		{2, []int{0, 1, 5, 7, 8}},
		{3, []int{0, 1, 2, 3}},
		{4, []int{2, 4, 5}},
		{5, []int{3, 6, 7, 8}},
		{6, []int{0, 1, 4, 7, 8, 9}},
		{7, []int{0, 1, 3, 4, 5}},
		{8, []int{2, 3, 4, 5, 6, 7}},
		{9, []int{1, 5, 6, 7, 9}},
		{10, []int{0, 2, 4}},
		{11, []int{1, 3}},
		{12, []int{6, 7, 8, 9}},
		{13, []int{0, 1, 8}},
		{14, []int{4, 5, 9}},
	}
	enrollments := []database.ClassEnrollment{}
	for _, group := range enrollmentGroups {
		class := classes[group.classIdx]
		for _, ci := range group.clientIdxs {
			e := database.ClassEnrollment{
				ClassID:      class.ID,
				UserID:       clients[ci].ID,
				Status:       "CONFIRMED",
				RegisteredAt: now.AddDate(0, 0, -5),
			}
			must(DB.Create(&e).Error, fmt.Sprintf("enrollment class%d client%d", group.classIdx, ci))
			enrollments = append(enrollments, e)
		}
	}

	log.Println("✅ Inscripciones a clases creadas")

	// =========================================================================
	// RESERVAS (BOOKINGS)
	// =========================================================================
	// 8 pasadas (COMPLETED) y 7 futuras (CONFIRMED/PENDING)
	type bookingSeed struct {
		userIdx   int
		pistaIdx  int
		dayOffset int
		startHour int
		endHour   int
		status    string
		payStatus string
	}
	bookingSeeds := []bookingSeed{
		// — Pasadas —
		{0, 0, -20, 8, 9, "COMPLETED", "PAID"},
		{1, 0, -18, 10, 11, "COMPLETED", "PAID"},
		{2, 3, -17, 16, 17, "COMPLETED", "PAID"},
		{3, 6, -15, 20, 21, "COMPLETED", "PAID"},
		{4, 8, -13, 9, 10, "COMPLETED", "PAID"},
		{5, 1, -10, 20, 21, "COMPLETED", "PAID"},
		{6, 4, -8, 16, 17, "COMPLETED", "UNPAID"},
		{7, 9, -5, 20, 21, "COMPLETED", "PAID"},
		// — Futuras —
		{0, 1, 3, 8, 9, "CONFIRMED", "UNPAID"},
		{1, 2, 5, 20, 21, "CONFIRMED", "PAID"},
		{2, 4, 6, 16, 17, "CONFIRMED", "PAID"},
		{3, 5, 7, 20, 21, "CONFIRMED", "UNPAID"},
		{4, 7, 10, 8, 9, "CONFIRMED", "PAID"},
		{5, 9, 12, 20, 21, "CONFIRMED", "UNPAID"},
		{6, 0, 15, 20, 21, "PENDING", "UNPAID"},
		{7, 6, 20, 8, 9, "PENDING", "UNPAID"},
		{8, 3, 35, 10, 11, "CONFIRMED", "PAID"},
		{9, 1, 40, 16, 17, "PENDING", "UNPAID"},
	}
	bookings := make([]database.Booking, len(bookingSeeds))
	for i, bs := range bookingSeeds {
		baseDay := day(bs.dayOffset)
		st := at(baseDay, bs.startHour, 0)
		et := at(baseDay, bs.endHour, 0)
		pista := pistas[bs.pistaIdx]
		b := database.Booking{
			UserID:             clients[bs.userIdx].ID,
			PistaID:            pista.ID,
			StartTime:          st,
			EndTime:            et,
			PriceSnapshotCents: pista.BasePriceCents,
			Status:             bs.status,
			PaymentStatus:      bs.payStatus,
		}
		must(DB.Create(&b).Error, fmt.Sprintf("booking user%d pista%d", bs.userIdx, bs.pistaIdx))
		bookings[i] = b
	}

	log.Println("✅ Reservas creadas")

	// =========================================================================
	// PAGOS (PAYMENTS)
	// =========================================================================
	// Pagos para reservas ya pagadas
	paidBookingIdxs := []int{0, 1, 2, 3, 4, 5, 7, 10, 11, 14, 16}
	piStr := func(n int) *string { s := fmt.Sprintf("pi_demo_%04d", n); return &s }

	payIdx := 0
	for _, bi := range paidBookingIdxs {
		if bi >= len(bookings) {
			continue
		}
		b := bookings[bi]
		if b.PaymentStatus != "PAID" {
			continue
		}
		bID := b.ID
		pay := database.Payment{
			UserID:                b.UserID,
			AmountCents:           b.PriceSnapshotCents,
			Currency:              "EUR",
			Status:                "SUCCEEDED",
			Provider:              "STRIPE",
			StripePaymentIntentID: piStr(payIdx + 1),
			BookingID:             &bID,
		}
		must(DB.Create(&pay).Error, fmt.Sprintf("payment booking %d", bi))
		payIdx++
	}

	// Pagos para inscripciones a clases (primeras 4 inscripciones de clases pasadas)
	enrollmentPayIdxs := []int{0, 1, 2, 4, 6}
	for _, ei := range enrollmentPayIdxs {
		if ei >= len(enrollments) {
			continue
		}
		e := enrollments[ei]
		classForEnroll := classes[ei/5] // aproximación al grupo de clase
		eID := e.ID
		pay := database.Payment{
			UserID:                e.UserID,
			AmountCents:           classForEnroll.PriceCents,
			Currency:              "EUR",
			Status:                "SUCCEEDED",
			Provider:              "STRIPE",
			StripePaymentIntentID: piStr(payIdx + 1),
			ClassEnrollmentID:     &eID,
		}
		must(DB.Create(&pay).Error, fmt.Sprintf("payment enrollment %d", ei))
		payIdx++
	}

	// Pagos de membresías de clubs
	clubMembershipPayIdxs := []int{0, 2, 5}
	for _, mi := range clubMembershipPayIdxs {
		if mi >= len(memberships) {
			continue
		}
		m := memberships[mi]
		club := clubs[0] // approx
		for _, c := range clubs {
			if c.ID == m.ClubID {
				club = c
				break
			}
		}
		mID := m.ID
		pay := database.Payment{
			UserID:                m.UserID,
			AmountCents:           club.MonthlyFeeCents,
			Currency:              "EUR",
			Status:                "SUCCEEDED",
			Provider:              "STRIPE",
			StripePaymentIntentID: piStr(payIdx + 1),
			ClubMembershipID:      &mID,
		}
		must(DB.Create(&pay).Error, fmt.Sprintf("payment membership %d", mi))
		payIdx++
	}

	log.Printf("✅ %d pagos creados", payIdx)
	log.Println("🎉 Seed de datos de demostración completado exitosamente")
	log.Println("")
	log.Println("╔══════════════════════════════════════════════════════════╗")
	log.Println("║              ACCESOS DE DEMOSTRACIÓN                    ║")
	log.Println("╠══════════════════════════════════════════════════════════╣")
	log.Println("║  ADMIN    admin@polimanage.com       / admin123         ║")
	log.Println("║  GESTOR   gestor@polimanage.com      / gestor123        ║")
	log.Println("║  CLUB     marcos@padelfcb.com        / club123          ║")
	log.Println("║  MONITOR  javier.garcia@polimanage.com / monitor123     ║")
	log.Println("║  CLIENTE  ana.gonzalez@email.com     / cliente123       ║")
	log.Println("╚══════════════════════════════════════════════════════════╝")
}

// must registra un error no fatal en el seed
func must(err error, context string) {
	if err != nil {
		log.Printf("⚠️  Seed warning [%s]: %v", context, err)
	}
}
