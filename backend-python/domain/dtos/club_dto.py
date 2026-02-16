"""
Club DTOs
Data Transfer Objects para clubes
"""
from pydantic import BaseModel, Field
from typing import Optional


class ClubResponse(BaseModel):
    """DTO para respuesta de club"""
    id: int
    name: str = Field(..., description="Nombre del club")
    slug: str = Field(..., description="Slug único del club")
    description: Optional[str] = Field(None, description="Descripción o eslogan del club")
    logo_url: Optional[str] = Field(None, description="URL del logo del club")
    
    class Config:
        from_attributes = True
