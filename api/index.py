from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

# When moved to api/Backend, we can use relative imports or add api to path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    # Now that Backend is INSIDE api/, we can import it directly
    from Backend.main import app as fastapi_app
    app = fastapi_app
    
    @app.get("/api/infra-test")
    def infra_test():
        return {
            "status": "ok", 
            "version": "61.0-INTERNAL", 
            "message": "Backend Package (Internal Mode) is LIVE"
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
