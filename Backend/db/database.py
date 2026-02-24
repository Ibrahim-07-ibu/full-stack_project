from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    logger.critical("DATABASE_URL is not set! Backend cannot start without a database.")
    raise RuntimeError("DATABASE_URL environment variable is required but not set. Please set it in Vercel Project Settings → Environment Variables.")

# Normalize PostgreSQL URL to use pg8000 driver
if DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("://", "+pg8000://", 1)
    logger.info("Using PostgreSQL with pg8000 driver.")

# Mask password for safe logging
safe_url = DATABASE_URL.split("@")[-1] if "@" in DATABASE_URL else "local"
logger.info(f"Connecting to database at: {safe_url}")

# Build engine kwargs — pool settings only apply to non-SQLite engines
engine_kwargs = {"pool_pre_ping": True, "echo": False}

if "sqlite" not in DATABASE_URL:
    # PostgreSQL / remote DB supports connection pooling
    engine_kwargs.update({
        "pool_recycle": 300,
        "pool_size": 5,
        "max_overflow": 10,
    })

engine = create_engine(DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

logger.info("Database engine initialized successfully.")
