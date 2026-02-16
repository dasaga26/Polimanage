"""
Club Mapper
Mapea entre el modelo de base de datos y la entidad de dominio
"""
from infrastructure.database.models import ClubModel
from domain.entities.club import Club


class ClubMapper:
    """Mapper para convertir entre ClubModel y Club"""
    
    @staticmethod
    def to_entity(model: ClubModel) -> Club:
        """Convierte ClubModel a entidad Club"""
        return Club(
            id=model.id,
            name=model.name,
            slug=model.slug,
            description=model.description,
            logo_url=model.logo_url,
            is_active=model.is_active
        )
