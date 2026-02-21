from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

import logging
logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not set")

try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  
        pool_recycle=3600,   
        echo=False 
    )
    
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    
    logger.info(f"Database connection established: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else 'local'}")
    
except Exception as e:
    logger.error(f"Database connection error: {e}")
    raise

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()
