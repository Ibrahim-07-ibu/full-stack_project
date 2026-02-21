from fastapi import FastAPI
from mangum import Mangum
import os
import sys
import json
import traceback

# ABSOLUTE PATH INJECTION
# This ensures that even in serverless environments, 
# components in the same folder are discoverable.
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    # Import the FastAPI app from main.py in the same folder
    from main import app as fastapi_app
    
    # 1. ADD DIAGNOSTICS
    @fastapi_app.get("/api/infra-test")
    def infra_test():
        return {
            "status": "ok", 
            "version": "63.0-MANGUM", 
            "adapter": "Mangum/ASGI",
            "sys_path": sys.path[:3]
        }
    
    # 2. WRAP WITH MANGUM
    # This converts FastAPI to a standard AWS Lambda / Vercel handler
    handler = Mangum(fastapi_app, lifespan="off")
    
except Exception as e:
    error_trace = traceback.format_exc()
    fallback_app = FastAPI()
    @fallback_app.get("/api/infra-test")
    def infra_test_error():
        return {
            "status": "error", 
            "message": f"Mangum initialization failed: {str(e)}",
            "trace": error_trace
        }
    handler = Mangum(fallback_app, lifespan="off")

# Vercel's Python runtime will look for 'handler' or 'app'
# We provide 'handler' as the primary entry point
app = handler
