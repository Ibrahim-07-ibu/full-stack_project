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

def create_debug_app(error_msg, trace):
    error_app = FastAPI(title="Diagnostic App")
    error_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @error_app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    async def catch_all(request: Request, path: str = ""):
        return {
            "status": "LOAD_ERROR",
            "path_received": path,
            "url": str(request.url),
            "method": request.method,
            "error": error_msg,
            "trace": trace
        }
    return error_app

try:
    from Backend.main import app as backend_app
    app = backend_app
except Exception as e:
    from fastapi import Request
    app = create_debug_app(str(e), traceback.format_exc())

# End of file
