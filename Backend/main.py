import os
import sys
import logging
from contextlib import asynccontextmanager

backend_root = os.path.dirname(os.path.abspath(__file__))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from db.database import engine, Base
from routers import auth, users, bookings, providers, reviews, services, supports
import models.users, models.providers, models.services, models.bookings, models.reviews, models.supports

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming Request: {request.method} {request.url.path}")
    response = await call_next(request)
    return response

@app.get("/")
def health():
    return {"message": "HomeBuddy API is running"}


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(bookings.router)
app.include_router(providers.router)
app.include_router(reviews.router)
app.include_router(services.router)
app.include_router(supports.router)
