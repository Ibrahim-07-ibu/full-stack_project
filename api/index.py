from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

# 1. FIX PATHING FOR RECURSIVE IMPORTS
# index.py is in api/
# project_root is the parent of api/
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
backend_dir = os.path.join(project_root, "Backend")

# Add root for 'from Backend.xxx'
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Add Backend root for 'from xxx' inside Backend
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# 2. BRIDGING TO BACKEND PACKAGE
try:
    from Backend.main import app as fastapi_app
    app = fastapi_app
    
    # Add a production diagnostic route
    @app.get("/api/infra-test")
    def infra_test():
        return {
            "status": "ok", 
            "version": "55.0-RECOVERY", 
            "message": "Backend Package (Package-Mode) is LIVE",
            "project_root": project_root
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
