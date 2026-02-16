"""
Club Repository Implementation
Implementación del repositorio de clubes usando SQLAlchemy
"""
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from domain.entities.club import Club
from domain.repositories.club_repository import ClubRepository
from infrastructure.database.models import ClubModel
from infrastructure.mappers.club_mapper import ClubMapper


class ClubRepositoryImpl(ClubRepository):
    """Implementación del repositorio de clubes"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_all(self) -> List[Club]:
        """Obtiene todos los clubes activos"""
        result = await self.db.execute(
            select(ClubModel)
            .where(ClubModel.is_active == True)
            .order_by(ClubModel.created_at.desc())
        )
        models = result.scalars().all()
        return [ClubMapper.to_entity(model) for model in models]
    
    async def get_by_id(self, club_id: int) -> Club | None:
        """Obtiene un club por ID"""
        result = await self.db.execute(
            select(ClubModel).where(ClubModel.id == club_id)
        )
        model = result.scalar_one_or_none()
        return ClubMapper.to_entity(model) if model else None
