from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

# Backend/main.py is now in the root Backend/ folder
# Ensure the parent of Backend is in path for absolute imports
# Or use relative imports

app = FastAPI(title="HomeBuddy", version="64.0-ISOLATED")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use relative imports within the package
from .routers import users, bookings, providers, reviews, services, supports

app.include_router(users.router)
app.include_router(bookings.router)
app.include_router(providers.router)
app.include_router(reviews.router)
app.include_router(services.router)
app.include_router(supports.router)

@app.get("/health")
def health():
    return {"status": "ok", "message": "Backend package is healthy"}
