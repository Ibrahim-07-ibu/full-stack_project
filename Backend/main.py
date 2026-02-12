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

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
APP_URL = os.getenv("APP_URL", "http://localhost:3000")

if ENVIRONMENT == "production":
    allowed_origins = [
        "https://homebuddy.vercel.app",
        "https://www.homebuddy.vercel.app",
        "https://homebuddy.vercel.app",
    ]
    allowed_origins.extend(
        [
            "http://localhost:3000",
            "http://localhost:8000",
            "http://localhost:8001",
            "http://localhost:5500",
            "http://localhost:5504",
            "http://localhost:5505",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8000",
            "http://127.0.0.1:8001",
            "http://127.0.0.1:5500",
            "http://127.0.0.1:5504",
            "http://127.0.0.1:5505",
            "http://127.0.0.1:5173",
        ]
    )
    frontend_url_env = os.getenv("FRONTEND_URL")
    if frontend_url_env:
        env_origins = [
            url.strip() for url in frontend_url_env.split(",") if url.strip()
        ]
        allowed_origins.extend(env_origins)
else:
    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:8001",
        "http://localhost:5500",
        "http://localhost:5504",
        "http://localhost:5505",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:8001",
        "http://127.0.0.1:5500",
        "http://127.0.0.1:5504",
        "http://127.0.0.1:5505",
        "http://127.0.0.1:5173",
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
        logger.info(
            f"RID: {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.4f}s"
        )
        return response
    except Exception as e:
        logger.error(f"Middleware Error: {str(e)}")
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error in Middleware", "error": str(e)},
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

    from db.database import SessionLocal
    from models.services import Service
    from models.users import User
    from pwd_utils import hash_password

    db_seed = SessionLocal()
    try:
        if db_seed.query(Service).count() == 0:
            logger.info("Seeding initial services...")
            services = [
                Service(
                    name="House Cleaning",
                    price=500,
                    description="Full professional house cleaning services",
                ),
                Service(
                    name="Deep Cleaning",
                    price=800,
                    description="Complete deep cleaning for home or office",
                ),
                Service(
                    name="Plumbing",
                    price=300,
                    description="Expert plumbing repairs and installations",
                ),
                Service(
                    name="Electrical Work",
                    price=400,
                    description="Safe electrical wiring and repair services",
                ),
                Service(
                    name="AC Repair",
                    price=600,
                    description="Air conditioner repair and servicing",
                ),
                Service(
                    name="Carpentry",
                    price=450,
                    description="Furniture repair and carpentry work",
                ),
                Service(
                    name="Painting",
                    price=700,
                    description="Home and office painting services",
                ),
                Service(
                    name="Home Cooking",
                    price=600,
                    description="Professional home-style meal preparation",
                ),
                Service(
                    name="Laundry & Washing",
                    price=200,
                    description="High-quality laundry and garment care",
                ),
            ]

            db_seed.add_all(services)
            db_seed.commit()
            logger.info(f"Successfully seeded {len(services)} services.")

        if db_seed.query(User).filter(User.role == "admin").count() == 0:
            logger.info("Seeding default admin...")
            admin_user = User(
                name="System Administrator",
                email="admin@homebuddy.com",
                password=hash_password("admin123"),
                phone="0000000000",
                address="Headquarters",
                role="admin",
            )
            db_seed.add(admin_user)
            db_seed.commit()
            logger.info("Successfully seeded admin account.")
    finally:
        db_seed.close()

except Exception as e:
    logger.error(f"Startup Error: {str(e)}")
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
