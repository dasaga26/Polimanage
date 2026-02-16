"""
Repository Implementation: Pista Repository
Implementación concreta del repositorio de pistas usando SQLAlchemy
"""
from typing import List
from sqlalchemy.orm import Session
from domain.entities.pista import Pista
from domain.repositories.pista_repository import PistaRepository
from infrastructure.database.models import PistaModel


class PistaRepositoryImpl(PistaRepository):
    """Implementación del repositorio de pistas usando SQLAlchemy"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_all(self) -> List[Pista]:
        """Obtiene todas las pistas de la base de datos"""
        pistas_db = self.db.query(PistaModel).order_by(PistaModel.id).all()
        
        # Convertir modelos ORM a entidades de dominio
        return [
            Pista(
                id=pista.id,
                nombre=pista.nombre,
                tipo=pista.tipo,
                superficie=pista.superficie,
                precio_hora_base=float(pista.precio_hora_base),
                es_activa=pista.es_activa,
                estado=pista.estado
            )
            for pista in pistas_db
        ]
