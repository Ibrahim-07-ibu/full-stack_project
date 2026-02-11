from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("WARNING: DATABASE_URL is not set. Database connection will fail.")
    # Fallback to a dummy URL to prevent crash at import time, 
    # but real operations will still fail appropriately.
    DATABASE_URL = "sqlite:///./test.db"

print(f"DEBUG: Using DATABASE_URL starting with: {DATABASE_URL[:15]}...")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()
