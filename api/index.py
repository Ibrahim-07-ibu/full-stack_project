import sys
import os
import logging
from fastapi import FastAPI
from mangum import Mangum

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

backend_path = os.path.join(project_root, "Backend")
sys.path.insert(0, backend_path)

try:
    from Backend.main import app as fastapi_app
    # Bridge FastAPI to Lambda/Vercel
    handler = Mangum(fastapi_app, lifespan="off")
    app = fastapi_app # Vercel also detects 'app'
    logger.info("Vercel serverless function initialized successfully with Backend package")
except Exception as e:
    logger.error(f"Backend Initialization Failed: {e}")
    # Fallback app for debugging
    app = FastAPI()
    @app.get("/api/infra-test")
    def infra_test():
        return {"status": "error", "message": f"Backend failed to load: {e}"}
    handler = Mangum(app, lifespan="off")

# Vercel looks for 'app' or 'handler'
application = app
