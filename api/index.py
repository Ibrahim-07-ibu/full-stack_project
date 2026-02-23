import os
import sys
import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

# Pathing setup
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
backend_dir = os.path.join(project_root, "Backend")

# Add paths to sys.path for Backend imports
for path in [project_root, backend_dir]:
    if path not in sys.path:
        sys.path.insert(0, path)

def create_diagnostic_app(error_msg, trace):
    diag_app = FastAPI(title="HB Diagnostic App")
    diag_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @diag_app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    async def diagnostic_handler(request: Request, path: str = ""):
        return {
            "status": "BACKEND_LOAD_FAILURE",
            "message": "The backend failed to initialize in the Vercel runtime.",
            "received_path": path,
            "received_method": request.method,
            "error_detail": error_msg,
            "traceback": trace
        }
    return diag_app

try:
    # Import the main FastAPI app from Backend/main.py
    from Backend.main import app as backend_app
    app = backend_app
except Exception as e:
    # Fallback to diagnostic app if initialization fails
    app = create_diagnostic_app(str(e), traceback.format_exc())

# End of file
