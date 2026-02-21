import sys
import os
import logging
from fastapi import FastAPI

# 1. PATHING
api_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(api_dir, "Backend")

if api_dir not in sys.path:
    sys.path.insert(0, api_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# 2. FASTAPI APP
try:
    from Backend.main import app as fastapi_app
    app = fastapi_app
    
    @app.get("/api/infra-test")
    def infra_test():
        return {"status": "ok", "version": "40.0-RELEASE", "message": "Backend package is LIVE"}

except Exception as e:
    import traceback
    error_trace = traceback.format_exc()
    app = FastAPI()
    @app.get("/api/infra-test")
    def infra_test():
        return {"status": "error", "message": str(e), "trace": error_trace}

handler = app
