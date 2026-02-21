import sys
import os
import logging
import traceback

# 1. SETUP LOGGING
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 2. IMMEDIATE ERROR WRAPPER
def create_error_app(error_msg, stack_trace):
    from fastapi import FastAPI
    err_app = FastAPI()
    @err_app.get("/api/health")
    @err_app.get("/api/infra-test")
    def error_route():
        return {
            "status": "initialization_error",
            "message": error_msg,
            "traceback": stack_trace,
            "cwd": os.getcwd(),
            "sys_path": sys.path
        }
    return err_app

app = None

try:
    # 3. ATTEMPT FULL LOAD
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    
    # Imports from our co-located modules
    from db.database import Base, engine
    from routers import users, bookings, providers, reviews, services, supports
    import models

    # ... Rest of the app logic ...
    app = FastAPI(redirect_slashes=False, title="HomeBuddy API (Production)", version="1.0.0")

    # (Simplified middleware for diagnostics)
    @app.get("/api/infra-test")
    def infra_test():
        return {"status": "ok", "message": "Full Backend package is LIVE on flattened V1 stack"}

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    # Include routers
    app.include_router(users.router)
    app.include_router(bookings.router)
    app.include_router(providers.router)
    app.include_router(reviews.router)
    app.include_router(services.router)
    app.include_router(supports.router)

except Exception as e:
    logger.error(f"FATAL INITIALIZATION ERROR: {e}")
    stack = traceback.format_exc()
    app = create_error_app(str(e), stack)

# Vercel entry point
handler = app
