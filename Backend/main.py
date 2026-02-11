from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import Base, engine
from routers import users, bookings, providers, reviews, services, supports
import models

from fastapi import Request
import time
import logging
import os
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)

# Environment detection
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
APP_URL = os.getenv("APP_URL", "http://localhost:3000")

# Configure CORS based on environment
if ENVIRONMENT == "production":
    allowed_origins = [
        "https://homebuddy.vercel.app",
        "https://www.homebuddy.vercel.app",
        os.getenv("FRONTEND_URL", "").split(",") if os.getenv("FRONTEND_URL") else []
    ]
    allowed_origins = [url.strip() for url_group in allowed_origins for url in (url_group.split(",") if isinstance(url_group, str) else [url_group])]
    allowed_origins = [url for url in allowed_origins if url]
else:
    allowed_origins = [
        "http://localhost:3000", 
        "http://localhost:8000", 
        "http://localhost:8001",
        "http://127.0.0.1:3000", 
        "http://127.0.0.1:8000",
        "http://127.0.0.1:8001"
    ]

app = FastAPI(redirect_slashes=False, title="HomeBuddy API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



from fastapi.responses import JSONResponse
import traceback

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"RID: {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.4f}s")
        return response
    except Exception as e:
        logger.error(f"Middleware Error: {str(e)}")
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error in Middleware", "error": str(e)}
        )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Exception: {str(exc)}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": "Global Internal Server Error", "error": str(exc)},
    )

try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created successfully.")
except Exception as e:
    logger.error(f"Startup Database Error: {str(e)}")
    traceback.print_exc()

app.include_router(users.router)
app.include_router(bookings.router)
app.include_router(providers.router)
app.include_router(reviews.router)
app.include_router(services.router)
app.include_router(supports.router)


@app.get("/")
def greet():
    return {"message": "Home Buddy API Running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
