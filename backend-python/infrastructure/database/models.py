"""
SQLAlchemy Models
Modelos ORM para las tablas de la base de datos
"""
from sqlalchemy import Column, Integer, String, Boolean, Numeric, Text, TIMESTAMP
from sqlalchemy.sql import func
from infrastructure.database.connection import Base


class PistaModel(Base):
    """Modelo SQLAlchemy para la tabla PISTAS"""
    __tablename__ = "pistas"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    tipo = Column(String(50), nullable=False)
    superficie = Column(String(50), nullable=True)
    image_url = Column(String, nullable=True)
    precio_hora_base = Column(Numeric(10, 2), nullable=False)
    es_activa = Column(Boolean, default=True)
    estado = Column(String(50), default='DISPONIBLE')


class ClubModel(Base):
    """Modelo SQLAlchemy para la tabla CLUBS"""
    __tablename__ = "clubs"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(120), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    logo_url = Column(Text, nullable=True)
    owner_id = Column(Integer, nullable=True)
    max_members = Column(Integer, default=50)
    monthly_fee_cents = Column(Integer, default=0)
    status = Column(String(50), default='ACTIVE')
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

