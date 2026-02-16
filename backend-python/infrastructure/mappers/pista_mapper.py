"""
Mapper: Convierte entre registros de BD y entidades de dominio
"""
from typing import Dict, Any
from domain.entities.pista import Pista


class PistaMapper:
    """Mapper para convertir datos de BD a entidad Pista"""
    
    @staticmethod
    def to_entity(row: Dict[str, Any]) -> Pista:
        """Convierte un registro de BD a entidad Pista"""
        return Pista(
            id=row['id'],
            nombre=row['nombre'],
            tipo=row['tipo'],
            superficie=row['superficie'],
            image_url=row.get('image_url'),
            precio_hora_base=float(row['precio_hora_base']),
            es_activa=row['es_activa'],
            estado=row['estado']
        )
