from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

# 1. FIX PATHING
# index.py is in api/
# project_root is the parent of api/
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)

if project_root not in sys.path:
    sys.path.insert(0, project_root)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

app = FastAPI(title="HomeBuddy", version="41.0-RESO")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Relative imports from Backend namespace
from Backend.routers import users, bookings, providers, reviews, services, supports

app.include_router(users.router)
app.include_router(bookings.router)
app.include_router(providers.router)
app.include_router(reviews.router)
app.include_router(services.router)
app.include_router(supports.router)

@app.get("/api/infra-test")
def infra_test():
    return {
        "status": "ok", 
        "version": "41.0-RESO", 
        "project_root": project_root,
        "sys_path": sys.path
    }

@app.get("/health")
def health():
    return {"status": "ok", "message": "Backend restored and healthy"}

handler = app
