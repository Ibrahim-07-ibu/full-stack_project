from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
import logging
from fastapi.staticfiles import StaticFiles

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure Backend directory parts are in path
backend_root = os.path.dirname(os.path.abspath(__file__))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

app = FastAPI(
    title="HomeBuddy", 
    version="55.0-RECOVERY",
    redirect_slashes=False  
)

static_dir = os.path.join(backend_root, "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir, exist_ok=True)

app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def read_root():
    return {"message": "HomeBuddy API is running", "version": "55.0-RECOVERY"}

@app.api_route("/api/debug-path", methods=["GET", "POST"])
async def debug_path(request: Request):
    return {
        "url": str(request.url),
        "method": request.method,
        "headers": dict(request.headers)
    }

@app.middleware("http")
async def log_requests(request: Request, call_next):
    path = request.url.path
    method = request.method
    logger.info(f"Incoming Request: {method} {path}")
    response = await call_next(request)
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import users, bookings, providers, reviews, services, supports

from db.database import engine, Base
import models.users, models.providers, models.services, models.bookings, models.reviews, models.supports

@app.on_event("startup")
def startup_event():
    logger.info("Startup: Syncing database...")
    try:
        if "sqlite" not in str(engine.url):
            Base.metadata.create_all(bind=engine)
            logger.info("Database synchronized.")
    except Exception as e:
        logger.error(f"Post-startup DB sync failed: {e}")

@app.get("/api/infra-test")
def infra_test():
    return {
        "status": "ok", 
        "message": "Backend Is Live", 
        "db": str(engine.url).split("@")[-1] if "@" in str(engine.url) else "local"
    }

app.include_router(users.router)
app.include_router(bookings.router)
app.include_router(providers.router)
app.include_router(reviews.router)
app.include_router(services.router)
app.include_router(supports.router)

@app.get("/health")
def health():
    return {"status": "ok", "message": "Backend package is healthy"}
