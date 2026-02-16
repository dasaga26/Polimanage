"""
Domain Entity: Pista
Representa una pista deportiva en el dominio del negocio
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class Pista:
    """Entidad de dominio para una pista deportiva"""
    id: int
    nombre: str
    tipo: str
    superficie: Optional[str]
    image_url: Optional[str]
    precio_hora_base: float
    es_activa: bool
    estado: str
