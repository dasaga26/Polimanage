"""
Club Controller
Controlador HTTP para endpoints de clubes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from infrastructure.database.connection import get_db
from infrastructure.repositories.club_repository_impl import ClubRepositoryImpl
from application.services.club_service import ClubService
from domain.dtos.club_dto import ClubResponse


router = APIRouter(prefix="/clubs", tags=["Clubs"])


@router.get("", response_model=List[ClubResponse])
async def get_all_clubs(db: AsyncSession = Depends(get_db)):
    """
    Obtiene todos los clubes activos
    """
    club_repository = ClubRepositoryImpl(db)
    club_service = ClubService(club_repository)
    clubs = await club_service.get_all_clubs()
    return clubs


@router.get("/{club_id}", response_model=ClubResponse)
async def get_club_by_id(club_id: int, db: AsyncSession = Depends(get_db)):
    """
    Obtiene un club por ID
    """
    club_repository = ClubRepositoryImpl(db)
    club_service = ClubService(club_repository)
    club = await club_service.get_club_by_id(club_id)
    
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    
    return club
