"""
Club Entity
Entidad de dominio para clubes deportivos
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class Club:
    """Entidad Club - Representa un club deportivo"""
    id: int
    name: str
    slug: str
    description: Optional[str]
    logo_url: Optional[str]
    is_active: bool
