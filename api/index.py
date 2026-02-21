from fastapi import FastAPI
from mangum import Mangum
import os
import sys
import json
import traceback

# ABSOLUTE PATH INJECTION
# index.py is in api/
# project_root is the parent of api/
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)

if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Force Backend to be recognizable as a package
backend_dir = os.path.join(project_root, "Backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    # Import from the root-level 'Backend' package
    from Backend.main import app as fastapi_app
    
    @fastapi_app.get("/api/infra-test")
    def infra_test():
        return {
            "status": "ok", 
            "version": "64.0-ISOLATED", 
            "topology": "Isolated-API (Root Package)",
            "sys_path": sys.path[:3]
        }
    
    handler = Mangum(fastapi_app, lifespan="off")
    
except Exception as e:
    error_trace = traceback.format_exc()
    fallback_app = FastAPI()
    @fallback_app.get("/api/infra-test")
    def infra_test_error():
        return {
            "status": "error", 
            "message": f"Isolation initialization failed: {str(e)}",
            "trace": error_trace,
            "cwd": os.getcwd()
        }
    handler = Mangum(fallback_app, lifespan="off")

app = handler
