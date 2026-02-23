from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    logger.warning("DATABASE_URL not found. Falling back to in-memory SQLite.")
    DATABASE_URL = "sqlite:///:memory:"

# Clearer way to add the pg8000 dialect
if DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("://", "+pg8000://", 1)

# Debug: Show everything except the actual password
safe_url = DATABASE_URL.split("@")[-1] if "@" in DATABASE_URL else "INVALID URL"
logger.info(f"Targeting Database at: {safe_url}")

# Create PostgreSQL engine with optimized pooling for serverless
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=10,
    echo=False,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

logger.info("PostgreSQL database engine initialized.")
