from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    DATABASE_URL = "postgresql+psycopg2://postgres:password@localhost:5432/homebuddy"
    print("WARNING: Using fallback database URL. Set DATABASE_URL in .env for production!")

try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  
        pool_recycle=3600,   
        echo=os.getenv("ENVIRONMENT") == "development"  
    )
    
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    
    print(f"Database connection established: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else 'local'}")
    
except Exception as e:
    print(f"Database connection error: {e}")
    raise

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()
