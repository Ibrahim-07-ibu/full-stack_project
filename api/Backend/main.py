from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

# Backend/main.py is now in api/Backend/main.py
# The 'api' directory should be in sys.path
backend_root = os.path.dirname(os.path.abspath(__file__))
api_root = os.path.dirname(backend_root)

if api_root not in sys.path:
    sys.path.insert(0, api_root)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

app = FastAPI(title="HomeBuddy", version="61.0-INTERNAL")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Relative imports will work if the package is structured correctly
from .routers import users, bookings, providers, reviews, services, supports

app.include_router(users.router)
app.include_router(bookings.router)
app.include_router(providers.router)
app.include_router(reviews.router)
app.include_router(services.router)
app.include_router(supports.router)

@app.get("/health")
def health():
    return {"status": "ok", "message": "Backend internal package is healthy"}
