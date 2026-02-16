"""
Application Service: Pista Service
Lógica de aplicación para gestión de pistas
"""
from typing import List
from sqlalchemy.orm import Session
from domain.entities.pista import Pista
from infrastructure.repositories.pista_repository_impl import PistaRepositoryImpl


class PistaService:
    """Servicio de aplicación para pistas"""
    
    def __init__(self, db: Session):
        self.repository = PistaRepositoryImpl(db)
    
    def get_all_pistas(self) -> List[Pista]:
        """Obtiene todas las pistas"""
        return self.repository.get_all()
