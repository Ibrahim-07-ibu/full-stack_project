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

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Startup: Syncing database...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database synchronized.")
    except Exception as e:
        logger.error(f"Post-startup DB sync failed: {e}")
    yield

app = FastAPI(
    title="HomeBuddy", 
    version="55.0-RECOVERY",
    redirect_slashes=False,
    lifespan=lifespan
)

static_dir = os.path.join(backend_root, "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir, exist_ok=True)

app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def read_root():
    return {"message": "HomeBuddy API is running", "version": "55.0-RECOVERY"}


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
from routers import auth
from db.database import engine, Base
import models.users, models.providers, models.services, models.bookings, models.reviews, models.supports



app.include_router(auth.router)
app.include_router(users.router)
app.include_router(bookings.router)
app.include_router(providers.router)
app.include_router(reviews.router)
app.include_router(services.router)
app.include_router(supports.router)

@app.get("/health")
def health():
    return {"status": "ok", "message": "Backend package is healthy"}
