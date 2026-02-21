from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

# index.py is in api/
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
backend_dir = os.path.join(project_root, "Backend")

if project_root not in sys.path:
    sys.path.insert(0, project_root)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from Backend.main import app as fastapi_app
    app = fastapi_app
    
    @app.get("/api/infra-test")
    def infra_test():
        return {
            "status": "ok", 
            "version": "59.0-FINAL", 
            "message": "Backend Package is LIVE"
        }
    
except Exception as e:
    import traceback
    error_trace = traceback.format_exc()
    app = FastAPI()
    @app.get("/api/infra-test")
    def infra_test():
        return {
            "status": "error", 
            "message": f"Backend failed to load: {str(e)}",
            "trace": error_trace
        }

handler = app
