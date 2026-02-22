from fastapi import FastAPI
from mangum import Mangum
import os
import sys
import traceback

# Path setup: api/index.py → project root → Backend package
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)

if project_root not in sys.path:
    sys.path.insert(0, project_root)

try:
    # Try to import from the root Backend package
    from Backend.main import app as fastapi_app

    @fastapi_app.get("/api/infra-test")
    def infra_test():
        return {"status": "ok", "version": "67.4-FINAL-MANGUM"}

    # Wrap the FastAPI app for Vercel's serverless environment
    app = Mangum(fastapi_app, lifespan="off")

except Exception as e:
    # Fallback app to report errors if initialization fails
    fallback_app = FastAPI()
    
    @fallback_app.get("/api/infra-test")
    def infra_test_error():
        return {
            "status": "error",
            "message": str(e),
            "trace": traceback.format_exc(),
        }
    
    app = Mangum(fallback_app, lifespan="off")

# Vercel's @vercel/python looks for 'app' by default
handler = app
