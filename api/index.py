import sys
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import traceback

# 1. ENVIRONMENT CONFIG
ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

# 2. PATHING FOR SERVERLESS
# Ensure 'api' folder is in sys.path so we can import modules directly
project_root = os.getcwd() # /var/task on Vercel
api_dir = os.path.join(project_root, "api")
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

# 3. LOGGING
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 4. FASTAPI APP INITIALIZATION
app = FastAPI(redirect_slashes=False, title="HomeBuddy API (Production)", version="1.0.0")

# 5. CORS CONFIG
if ENVIRONMENT == "production":
    frontend_url = os.getenv("FRONTEND_URL", "").strip()
    allowed_origins = [u for u in [frontend_url] if u]
else:
    allowed_origins = ["*"] # Local development

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 6. APP CONTENT (Logic re-integration)
try:
    from db.database import Base, engine
    from routers import users, bookings, providers, reviews, services, supports
    import models

    # Verify/Create tables (No import-time DB tests, handled by SQLAlchemy pre-ping)
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified.")

    # Include routers with /api prefix as required by Vercel rewrites
    app.include_router(users.router)
    app.include_router(bookings.router)
    app.include_router(providers.router)
    app.include_router(reviews.router)
    app.include_router(services.router)
    app.include_router(supports.router)

except Exception as e:
    logger.error(f"Logic Import Error: {e}")
    traceback.print_exc()

# 7. TOP-LEVEL ROUTES
@app.get("/api/infra-test")
def infra_test():
    return {
        "status": "ok",
        "message": "Full Backend package is LIVE on flattened V1 stack",
        "env": ENVIRONMENT,
        "files_in_api": os.listdir(api_dir) if os.path.exists(api_dir) else "N/A"
    }

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api")
def root():
    return {"message": "HomeBuddy API Running"}
