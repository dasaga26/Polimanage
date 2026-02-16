"""
Club Service
Servicio de aplicación para clubes
"""
from typing import List
from domain.repositories.club_repository import ClubRepository
from domain.dtos.club_dto import ClubResponse


class ClubService:
    """Servicio para la lógica de negocio de clubes"""
    
    def __init__(self, club_repository: ClubRepository):
        self.club_repository = club_repository
    
    async def get_all_clubs(self) -> List[ClubResponse]:
        """Obtiene todos los clubes activos"""
        clubs = await self.club_repository.get_all()
        return [
            ClubResponse(
                id=club.id,
                name=club.name,
                slug=club.slug,
                description=club.description,
                logo_url=club.logo_url
            )
            for club in clubs
        ]
    
    async def get_club_by_id(self, club_id: int) -> ClubResponse | None:
        """Obtiene un club por ID"""
        club = await self.club_repository.get_by_id(club_id)
        if not club:
            return None
        
        return ClubResponse(
            id=club.id,
            name=club.name,
            slug=club.slug,
            description=club.description,
            logo_url=club.logo_url
        )
