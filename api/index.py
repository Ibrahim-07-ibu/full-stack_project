import sys
import os
import logging
from fastapi import FastAPI

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

backend_path = os.path.join(project_root, "Backend")
sys.path.insert(0, backend_path)

try:
    # Import the main FastAPI app from our project
    from Backend.main import app as fastapi_app
    
    # Export it directly for Vercel auto-detection
    app = fastapi_app
    
    # Add a diagnostic route to the existing app
    @app.get("/api/infra-test")
    def infra_test():
        return {"status": "ok", "message": "Backend Package (No Mangum) is working on Pydantic V1"}
    
    logger.info("Vercel: Successfully loaded Backend.main app")
    
except Exception as e:
    import traceback
    error_trace = traceback.format_exc()
    logger.error(f"Backend Import Failed: {e}\n{error_trace}")
    
    # Fallback app to show the error
    app = FastAPI()
    @app.get("/api/infra-test")
    def infra_test():
        return {
            "status": "error", 
            "message": f"Backend failed to load: {str(e)}",
            "trace": error_trace
        }

# Vercel's zero-config Python runtime will use the 'app' object
# No Mangum handler needed
