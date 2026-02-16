package presentation

import (
	"backend-go/features/clubs/application"
	"backend-go/features/clubs/domain"
	"net/url"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type ClubHandler struct {
	service           *application.ClubService
	membershipService *application.ClubMembershipService
	renewalService    *application.RenewalService
	userProvider      application.UserProvider
}

func NewClubHandler(
	service *application.ClubService,
	membershipService *application.ClubMembershipService,
	renewalService *application.RenewalService,
	userProvider application.UserProvider,
) *ClubHandler {
	return &ClubHandler{
		service:           service,
		membershipService: membershipService,
		renewalService:    renewalService,
		userProvider:      userProvider,
	}
}

// GetAll maneja GET /clubs
// @Summary Lista todos los clubs
// @Tags Clubs
// @Produce json
// @Success 200 {array} ClubResponse
// @Router /clubs [get]
func (h *ClubHandler) GetAll(c *fiber.Ctx) error {
	clubs, err := h.service.GetAllClubs()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	responses := make([]ClubResponse, len(clubs))
	for i, club := range clubs {
		responses[i] = ClubToResponse(&club)
	}

	return c.JSON(responses)
}

// GetBySlug maneja GET /clubs/:slug
// @Summary Obtiene un club por slug
// @Tags Clubs
// @Param slug path string true "Club slug"
// @Produce json
// @Success 200 {object} ClubResponse
// @Router /clubs/{slug} [get]
func (h *ClubHandler) GetBySlug(c *fiber.Ctx) error {
	slug, err := url.QueryUnescape(c.Params("slug"))
	if err != nil || slug == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Slug inválido"})
	}

	club, err := h.service.GetClubBySlug(slug)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(ClubToResponse(club))
}

// Create maneja POST /clubs
// @Summary Crea un nuevo club
// @Tags Clubs
// @Accept json
// @Produce json
// @Param club body CreateClubRequest true "Datos del club"
// @Success 201 {object} ClubResponse
// @Router /clubs [post]
func (h *ClubHandler) Create(c *fiber.Ctx) error {
	var req CreateClubRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	club := &domain.Club{
		Name:            req.Name,
		Description:     req.Description,
		LogoURL:         req.LogoURL,
		MaxMembers:      req.MaxMembers,
		MonthlyFeeCents: req.MonthlyFeeCents,
		IsActive:        req.IsActive,
	}

	// Si se proporciona ownerSlug, buscar el usuario y asignarlo
	if req.OwnerSlug != nil && *req.OwnerSlug != "" {
		owner, err := h.userProvider.GetUserBySlug(*req.OwnerSlug)
		if err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Usuario propietario no encontrado"})
		}

		// Verificar que el usuario sea de tipo CLUB (roleId = 3)
		if owner.RoleID != 3 {
			return c.Status(400).JSON(fiber.Map{"error": "Solo usuarios con rol CLUB pueden ser propietarios de clubs"})
		}

		club.OwnerID = &owner.ID
	}

	if err := h.service.CreateClub(club); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(ClubToResponse(club))
}

// Update maneja PUT /clubs/:slug
// @Summary Actualiza un club existente
// @Tags Clubs
// @Accept json
// @Produce json
// @Param slug path string true "Club slug"
// @Param club body UpdateClubRequest true "Datos del club"
// @Success 200 {object} ClubResponse
// @Router /clubs/{slug} [put]
func (h *ClubHandler) Update(c *fiber.Ctx) error {
	slug, err := url.QueryUnescape(c.Params("slug"))
	if err != nil || slug == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Slug inválido"})
	}

	club, err := h.service.GetClubBySlug(slug)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Club no encontrado"})
	}

	var req UpdateClubRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	club.Name = req.Name
	club.Description = req.Description
	club.LogoURL = req.LogoURL
	club.MaxMembers = req.MaxMembers
	club.MonthlyFeeCents = req.MonthlyFeeCents
	club.Status = req.Status
	club.IsActive = req.IsActive

	// Si se proporciona ownerSlug, buscar el usuario y asignarlo
	if req.OwnerSlug != nil {
		if *req.OwnerSlug == "" {
			// Si viene vacío, remover el owner
			club.OwnerID = nil
		} else {
			owner, err := h.userProvider.GetUserBySlug(*req.OwnerSlug)
			if err != nil {
				return c.Status(404).JSON(fiber.Map{"error": "Usuario propietario no encontrado"})
			}

			// Verificar que el usuario sea de tipo CLUB (roleId = 3)
			if owner.RoleID != 3 {
				return c.Status(400).JSON(fiber.Map{"error": "Solo usuarios con rol CLUB pueden ser propietarios de clubs"})
			}

			club.OwnerID = &owner.ID
		}
	}

	if err := h.service.UpdateClub(club); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(ClubToResponse(club))
}

// Delete maneja DELETE /clubs/:slug
// @Summary Elimina un club
// @Tags Clubs
// @Param slug path string true "Club slug"
// @Success 204
// @Router /clubs/{slug} [delete]
func (h *ClubHandler) Delete(c *fiber.Ctx) error {
	slug, err := url.QueryUnescape(c.Params("slug"))
	if err != nil || slug == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Slug inválido"})
	}

	if err := h.service.DeleteClubBySlug(slug); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(204).Send(nil)
}

// GetMembers maneja GET /clubs/:slug/members
// @Summary Obtiene los miembros de un club
// @Tags Clubs
// @Param slug path string true "Club slug"
// @Produce json
// @Success 200 {array} ClubMembershipResponse
// @Router /clubs/{slug}/members [get]
func (h *ClubHandler) GetMembers(c *fiber.Ctx) error {
	slug, err := url.QueryUnescape(c.Params("slug"))
	if err != nil || slug == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Slug inválido"})
	}

	club, err := h.service.GetClubBySlug(slug)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Club no encontrado"})
	}

	memberships, err := h.membershipService.GetMembershipsByClub(club.ID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	responses := make([]ClubMembershipResponse, len(memberships))
	for i, membership := range memberships {
		responses[i] = MembershipToResponse(&membership)
	}

	return c.JSON(responses)
}

// AddMember maneja POST /clubs/:slug/members
// @Summary Añade un miembro a un club
// @Tags Clubs
// @Accept json
// @Produce json
// @Param slug path string true "Club slug"
// @Param member body AddMemberRequest true "Datos del miembro"
// @Success 201 {object} ClubMembershipResponse
// @Router /clubs/{slug}/members [post]
func (h *ClubHandler) AddMember(c *fiber.Ctx) error {
	slug, err := url.QueryUnescape(c.Params("slug"))
	if err != nil || slug == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Slug inválido"})
	}

	club, err := h.service.GetClubBySlug(slug)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Club no encontrado"})
	}

	var req AddMemberRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	// Obtener usuario por slug usando UserProvider
	user, err := h.userProvider.GetUserBySlug(req.UserSlug)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	// Verificar que el usuario sea CLIENTE (role_id = 5)
	if user.RoleID != 5 {
		return c.Status(400).JSON(fiber.Map{"error": "Solo usuarios con rol CLIENTE pueden ser miembros de clubs"})
	}

	// Añadir miembro al club
	if err := h.membershipService.AddMember(int(club.ID), user.ID); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	// Obtener la membresía recién creada para retornarla
	memberships, err := h.membershipService.GetMembershipsByClub(int(club.ID))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener membresía creada"})
	}

	// Buscar la última membresía del usuario
	for _, m := range memberships {
		if m.UserID == user.ID {
			return c.Status(201).JSON(MembershipToResponse(&m))
		}
	}

	return c.Status(500).JSON(fiber.Map{"error": "Error al crear membresía"})
}

// RemoveMember maneja DELETE /clubs/memberships/:id
// @Summary Elimina un miembro de un club
// @Tags Clubs
// @Param id path int true "Membership ID"
// @Success 204
// @Router /clubs/memberships/{id} [delete]
func (h *ClubHandler) RemoveMember(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ID inválido"})
	}

	if err := h.membershipService.RemoveMember(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(204).Send(nil)
}

// ClubToResponse convierte una entidad de dominio a DTO
func ClubToResponse(club *domain.Club) ClubResponse {
	var ownerIDStr *string
	if club.OwnerID != nil {
		str := club.OwnerID.String()
		ownerIDStr = &str
	}

	return ClubResponse{
		ID:              club.ID,
		OwnerID:         ownerIDStr,
		OwnerSlug:       club.OwnerSlug,
		OwnerName:       club.OwnerName,
		Slug:            club.Slug,
		Name:            club.Name,
		Description:     club.Description,
		LogoURL:         club.LogoURL,
		MaxMembers:      club.MaxMembers,
		MonthlyFeeCents: club.MonthlyFeeCents,
		MonthlyFeeEuros: float64(club.MonthlyFeeCents) / 100.0,
		Status:          club.Status,
		IsActive:        club.IsActive,
		MemberCount:     club.MemberCount,
		CreatedAt:       club.CreatedAt,
		UpdatedAt:       club.UpdatedAt,
	}
}

// MembershipToResponse convierte una entidad de membresía a DTO
func MembershipToResponse(membership *domain.ClubMembership) ClubMembershipResponse {
	return ClubMembershipResponse{
		ID:              membership.ID,
		ClubID:          membership.ClubID,
		ClubSlug:        membership.ClubSlug,
		ClubName:        membership.ClubName,
		UserID:          membership.UserID.String(),
		UserSlug:        membership.UserSlug,
		UserName:        membership.UserName,
		UserEmail:       membership.UserEmail,
		Status:          membership.Status,
		StartDate:       membership.StartDate,
		EndDate:         membership.EndDate,
		NextBillingDate: membership.NextBillingDate,
		PaymentStatus:   membership.PaymentStatus,
		IsActive:        membership.IsActive,
		CreatedAt:       membership.CreatedAt,
		UpdatedAt:       membership.UpdatedAt,
	}
}

// RenewMembership maneja POST /clubs/memberships/:id/renew
// @Summary Renueva una membresía procesando el pago
// @Tags Clubs
// @Accept json
// @Produce json
// @Param id path int true "Membership ID"
// @Param request body RenewMembershipRequest true "Datos del pago"
// @Success 200 {object} MessageResponse
// @Router /clubs/memberships/{id}/renew [post]
func (h *ClubHandler) RenewMembership(c *fiber.Ctx) error {
	membershipID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ID de membresía inválido"})
	}

	var req RenewMembershipRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos de renovación inválidos"})
	}

	if req.CustomerID == "" {
		return c.Status(400).JSON(fiber.Map{"error": "CustomerID es requerido"})
	}

	if err := h.renewalService.RenewMembership(membershipID, req.CustomerID); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message":      "Membresía renovada exitosamente",
		"membershipID": membershipID,
	})
}

// SuspendMembership maneja POST /clubs/memberships/:id/suspend
// @Summary Suspende una membresía
// @Tags Clubs
// @Produce json
// @Param id path int true "Membership ID"
// @Success 200 {object} MessageResponse
// @Router /clubs/memberships/{id}/suspend [post]
func (h *ClubHandler) SuspendMembership(c *fiber.Ctx) error {
	membershipID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ID de membresía inválido"})
	}

	if err := h.membershipService.SuspendMembership(membershipID); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message": "Membresía suspendida exitosamente",
	})
}

// ResumeMembership maneja POST /clubs/memberships/:id/resume
// @Summary Reanuda una membresía suspendida
// @Tags Clubs
// @Produce json
// @Param id path int true "Membership ID"
// @Success 200 {object} MessageResponse
// @Router /clubs/memberships/{id}/resume [post]
func (h *ClubHandler) ResumeMembership(c *fiber.Ctx) error {
	membershipID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ID de membresía inválido"})
	}

	if err := h.membershipService.ActivateMembership(membershipID); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message": "Membresía reactivada exitosamente",
	})
}

// CancelMembership maneja POST /clubs/memberships/:id/cancel
// @Summary Cancela permanentemente una membresía
// @Tags Clubs
// @Produce json
// @Param id path int true "Membership ID"
// @Success 200 {object} MessageResponse
// @Router /clubs/memberships/{id}/cancel [post]
func (h *ClubHandler) CancelMembership(c *fiber.Ctx) error {
	membershipID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ID de membresía inválido"})
	}

	if err := h.membershipService.CancelMembership(membershipID); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message": "Membresía cancelada exitosamente",
	})
}

// UpdateBillingDate maneja PUT /clubs/memberships/:id/billing-date
// @Summary Actualiza la fecha de próximo cobro
// @Tags Clubs
// @Accept json
// @Produce json
// @Param id path int true "Membership ID"
// @Param request body UpdateBillingDateRequest true "Nueva fecha"
// @Success 200 {object} MessageResponse
// @Router /clubs/memberships/{id}/billing-date [put]
func (h *ClubHandler) UpdateBillingDate(c *fiber.Ctx) error {
	membershipID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ID de membresía inválido"})
	}

	var req UpdateBillingDateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	if err := h.membershipService.UpdateNextBillingDate(membershipID, req.NextBillingDate); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message": "Fecha de cobro actualizada exitosamente",
	})
}
