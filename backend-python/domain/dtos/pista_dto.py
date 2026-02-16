"""
DTOs: Data Transfer Objects para Pistas
"""
from pydantic import BaseModel
from typing import Optional


class PistaResponseDTO(BaseModel):
    """DTO para respuesta de pista"""
    id: int
    nombre: str
    tipo: str
    superficie: Optional[str]
    image_url: Optional[str]
    precio_hora_base: float
    es_activa: bool
    estado: str
    
    class Config:
        from_attributes = True
