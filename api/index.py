import sys
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

backend_path = os.path.join(project_root, "Backend")
sys.path.insert(0, backend_path)

# All environment variables (ENVIRONMENT, DATABASE_URL, SECRET_KEY, etc.)
# must be configured in the Vercel dashboard, not hardcoded here.

try:
    from Backend.main import app as fastapi_app
    from mangum import Mangum

    app = Mangum(fastapi_app, lifespan="off")
    application = app

    logger.info("Vercel serverless function initialized successfully")

except ImportError as e:
    logger.error(f"Import Error: Missing dependency - {e}")
    raise
except Exception as e:
    logger.error(f"Fatal Error during initialization: {e}")
    import traceback
    traceback.print_exc()
    raise
