from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
import json
import traceback

# This is the flat Vercel gateway
# Everything is now in the same directory (api/)

try:
    from main import app as fastapi_app
    app = fastapi_app
    
    @app.get("/api/infra-test")
    def infra_test():
        return {
            "status": "ok", 
            "version": "62.0-FLAT", 
            "message": "Flat API Topology is LIVE"
        }
    
except Exception as e:
    error_trace = traceback.format_exc()
    app = FastAPI()
    @app.get("/api/infra-test")
    def infra_test():
        return {
            "status": "error", 
            "message": f"Flat API failed to load: {str(e)}",
            "trace": error_trace
        }

handler = app
