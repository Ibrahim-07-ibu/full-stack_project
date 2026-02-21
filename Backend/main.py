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
    allowed_origins = [os.getenv("FRONTEND_URL")]
else:
    allowed_origins = [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:8000"
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
    if ENVIRONMENT == "development":
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created successfully.")
        
        from db.database import SessionLocal
        from models.services import Service
        from models.users import User
        from pwd_utils import hash_password
        
        db_seed = SessionLocal()
        try:
            logger.info("Syncing services...")
            seed_services = [
                Service(name="House Cleaning", price=250, description="Full professional house cleaning services"),
                Service(name="Deep Cleaning", price=450, description="Complete deep cleaning for home or office"),
                Service(name="Plumbing", price=150, description="Expert plumbing repairs and installations"),
                Service(name="Electrical Work", price=150, description="Safe electrical wiring and repair services"),
                Service(name="AC Repair", price=350, description="Air conditioner repair and servicing"),
                Service(name="Carpentry", price=250, description="Furniture repair and carpentry work"),
                Service(name="Painting", price=450, description="Home and office painting services"),
                Service(name="Home Cooking", price=350, description="Professional home-style meal preparation"),
                Service(name="Laundry & Washing", price=99, description="High-quality laundry and garment care"),
                Service(name="Garden Maintenance", price=199, description="Professional gardening and lawn care"),
                Service(name="Appliance Repair", price=299, description="Fixing refrigerators, washing machines, and more"),
                Service(name="Pest Control", price=499, description="Complete pest and termite control solutions"),
                Service(name="Home Salon", price=599, description="Beauty and grooming services at your doorstep"),
                Service(name="Packing & Moving", price=1499, description="Safe and secure shifting for your home or office"),
                Service(name="Window Cleaning", price=199, description="Crystal clear window and glass cleaning"),
                Service(name="Sofa & Upholstery Cleaning", price=349, description="Deep cleaning for sofas, carpets, and curtains"),
                Service(name="Water Purifier (RO) Service", price=249, description="RO installation, repair, and filter replacement"),
                Service(name="CCTV & Security Setup", price=899, description="Installation of security cameras and alarm systems"),
                Service(name="Smart Home Automation", price=1199, description="Setup of smart lights, locks, and voice assistants"),
                Service(name="Interior Designing", price=2499, description="Professional consultation for home decor and layout"),
            ]

            added_count = 0
            updated_count = 0
            for service_to_seed in seed_services:
                existing_service = db_seed.query(Service).filter(Service.name == service_to_seed.name).first()
                if not existing_service:
                    db_seed.add(service_to_seed)
                    added_count += 1
                else:
                    if existing_service.price != service_to_seed.price:
                        existing_service.price = service_to_seed.price
                        existing_service.description = service_to_seed.description
                        updated_count += 1
            
            if added_count > 0 or updated_count > 0:
                db_seed.commit()
                logger.info(f"Database Sync: Added {added_count} new services, Updated {updated_count} existing prices.")
            else:
                logger.info("All services are already up to date.")

                
            if db_seed.query(User).filter(User.role == "admin").count() == 0:
                logger.info("Seeding default admin...")
                admin_user = User(
                    name="System Administrator",
                    email="admin@homebuddy.com",
                    password=hash_password("admin123"),
                    phone="0000000000",
                    address="Headquarters",
                    role="admin"
                )
                db_seed.add(admin_user)
                db_seed.commit()
                logger.info("Successfully seeded admin account.")
        finally:
            db_seed.close()
    else:
        logger.info("Skipping database migration and seeding in production.")
        
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

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    # Enforce no-reload in production, allow it in development
    reload_enabled = True if ENVIRONMENT == "development" else False
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=reload_enabled)
