"""
Controller: Pista Controller
Controlador para endpoints de pistas
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from domain.dtos.pista_dto import PistaResponseDTO
from application.services.pista_service import PistaService
from infrastructure.database.connection import get_db


router = APIRouter(
    prefix="/pistas",
    tags=["Pistas"]
)


@router.get("", response_model=List[PistaResponseDTO])
async def get_all_pistas(db: Session = Depends(get_db)):
    service = PistaService(db)
    pistas = service.get_all_pistas()
    return [PistaResponseDTO.model_validate(pista) for pista in pistas]
