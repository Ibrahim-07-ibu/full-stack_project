from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Get DB URL from environment or fallback to local SQLite
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./homebuddy.db"

# Deployment compatibility: ensure pg8000 is used for postgres URLs
is_postgres = SQLALCHEMY_DATABASE_URL.startswith("postgresql") or SQLALCHEMY_DATABASE_URL.startswith("postgres")
if is_postgres and "+pg8000" not in SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("://", "+pg8000://", 1)

# Base engine configuration
engine_args = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Driver-specific connect_args
connect_args = {}

if "sqlite" in SQLALCHEMY_DATABASE_URL:
    connect_args["check_same_thread"] = False
elif "+pg8000" not in SQLALCHEMY_DATABASE_URL:
    # Use keepalives only for standard postgres drivers (like psycopg2)
    # as per your provided template
    connect_args = {
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5
    }

if connect_args:
    engine_args["connect_args"] = connect_args

# Pooling configuration (not supported by SQLite)
if "sqlite" not in SQLALCHEMY_DATABASE_URL:
    engine_args.update({
        "pool_size": 20,
        "max_overflow": 0,
    })

engine = create_engine(SQLALCHEMY_DATABASE_URL, **engine_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
