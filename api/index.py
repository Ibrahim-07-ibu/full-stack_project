import os
import sys
import traceback
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Pathing setup - Be extremely careful with relative paths on Vercel
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
backend_dir = os.path.join(project_root, "Backend")

if project_root not in sys.path:
    sys.path.insert(0, project_root)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

def create_error_app(error_msg, trace):
    error_app = FastAPI(title="Error Recovery App")
    error_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"], # In error mode, allow all for easier debugging
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    @error_app.get("/api/infra-test")
    def error_report():
        return {
            "status": "LOAD_ERROR", 
            "error": error_msg, 
            "trace": trace,
            "sys_path": sys.path[:5]
        }
    @error_app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    def catch_all(path: str):
        return {"detail": "Backend failed to load", "error": error_msg}
    return error_app

try:
    from Backend.main import app as backend_app
    app = backend_app
except Exception as e:
    app = create_error_app(str(e), traceback.format_exc())

# End of file
