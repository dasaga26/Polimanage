"""
Club Repository Interface
"""
from abc import ABC, abstractmethod
from typing import List
from domain.entities.club import Club


class ClubRepository(ABC):
    """Interfaz del repositorio de clubes"""
    
    @abstractmethod
    async def get_all(self) -> List[Club]:
        """Obtiene todos los clubes activos"""
        pass
    
    @abstractmethod
    async def get_by_id(self, club_id: int) -> Club | None:
        """Obtiene un club por ID"""
        pass
