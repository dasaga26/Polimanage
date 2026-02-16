"""
Repository Interface: Pista Repository
Define el contrato para el acceso a datos de pistas
"""
from abc import ABC, abstractmethod
from typing import List
from domain.entities.pista import Pista


class PistaRepository(ABC):
    """Interfaz del repositorio de pistas"""
    
    @abstractmethod
    def get_all(self) -> List[Pista]:
        """Obtiene todas las pistas"""
        pass
