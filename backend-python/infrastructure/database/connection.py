"""
Database Connection
Gestión de la conexión a PostgreSQL usando SQLAlchemy
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from typing import AsyncGenerator
import os

# Base para modelos SQLAlchemy
Base = declarative_base()

# Database URL (async version)
DATABASE_URL = (
    f"postgresql+asyncpg://{os.getenv('DB_USER', 'postgres')}:"
    f"{os.getenv('DB_PASSWORD', '1234')}@"
    f"{os.getenv('DB_HOST', 'localhost')}:"
    f"{os.getenv('DB_PORT', '5432')}/"
    f"{os.getenv('DB_NAME', 'polimanage')}"
)

# Async Engine SQLAlchemy
engine = create_async_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verifica conexiones antes de usarlas
    echo=False  # True para debug SQL
)

# Async SessionLocal factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency para obtener sesión de BD async"""
    async with AsyncSessionLocal() as session:
        yield session
