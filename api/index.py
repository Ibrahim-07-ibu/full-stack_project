import sys
import os
import logging
import traceback
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. ENVIRONMENT CONFIG
ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

# 2. PATHING FOR SERVERLESS
project_root = os.getcwd() # /var/task on Vercel
api_dir = os.path.join(project_root, "api")
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

# 3. LOGGING
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 4. FASTAPI APP INITIALIZATION
app = FastAPI(redirect_slashes=False, title="HomeBuddy API", version="6.0-FINAL-STABILIZED")

# 5. CORS CONFIG
if ENVIRONMENT == "production":
    frontend_url = os.getenv("FRONTEND_URL", "").strip()
    allowed_origins = [u for u in [frontend_url] if u]
else:
    allowed_origins = ["*"] 

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 6. APP CONTENT (Logic re-integration)
init_status = "Not Started"
init_error = None

try:
    from db.database import Base, engine
    from routers import users, bookings, providers, reviews, services, supports
    import models

    # Verify/Create tables
    Base.metadata.create_all(bind=engine)
    
    # Include routers with /api prefix as required by Vercel rewrites
    app.include_router(users.router)
    app.include_router(bookings.router)
    app.include_router(providers.router)
    app.include_router(reviews.router)
    app.include_router(services.router)
    app.include_router(supports.router)
    
    init_status = "Success"
    logger.info("Vercel: Successfully loaded all HomeBuddy routers")

except Exception as e:
    init_status = "Failed"
    init_error = f"{str(e)}\n{traceback.format_exc()}"
    logger.error(f"Logic Import Error: {init_error}")

# 7. ROUTES
@app.get("/api/infra-test")
def infra_test():
    return {
        "status": "ok",
        "version": "6.0-FINAL-STABILIZED",
        "init_status": init_status,
        "init_error": init_error,
        "env": ENVIRONMENT,
        "files_in_api": os.listdir(api_dir) if os.path.exists(api_dir) else "N/A"
    }

@app.get("/api/health")
def health():
    return {"status": "ok", "init": init_status}

@app.get("/api")
def root():
    return {"message": "HomeBuddy API v6.0 Live"}

# Vercel entry
handler = app
