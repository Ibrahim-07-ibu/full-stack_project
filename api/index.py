import sys
import os
import logging
import traceback
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. ENVIRONMENT
ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

# 2. PATHING
project_root = os.getcwd() 
api_dir = os.path.join(project_root, "api")
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

# 3. INITIALIZATION
app = FastAPI(redirect_slashes=False, title="HomeBuddy API", version="9.0-STABILIZED")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_status = "In Progress"
init_error = None

try:
    from db.database import Base, engine
    from routers import users, bookings, providers, reviews, services, supports
    import models

    # Verify/Create tables
    Base.metadata.create_all(bind=engine)
    
    # Include routers
    app.include_router(users.router)
    app.include_router(bookings.router)
    app.include_router(providers.router)
    app.include_router(reviews.router)
    app.include_router(services.router)
    app.include_router(supports.router)
    
    init_status = "Success"
except Exception as e:
    init_status = "Failed"
    # Capture only the last few lines of traceback to avoid serialization issues
    init_error = traceback.format_exc()[-1000:] 

# 4. ROUTES
@app.get("/api/infra-test")
def infra_test():
    db_url = os.getenv("DATABASE_URL", "NOT_SET")
    return {
        "status": "ok",
        "version": "9.0-STABILIZED",
        "init_status": init_status,
        "init_error": init_error,
        "db": {
            "raw_prefix": db_url.split("://")[0] if "://" in db_url else "N/A"
        },
        "env": ENVIRONMENT
    }

@app.get("/api/health")
def health():
    return {"status": "ok", "init": init_status}

@app.get("/api")
def root():
    return {"message": "HomeBuddy API v9.0 Live"}

# Vercel entry
handler = app
