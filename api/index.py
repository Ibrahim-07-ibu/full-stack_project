from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
import traceback

# Path setup: api/index.py → project root → Backend package
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)

if project_root not in sys.path:
    sys.path.insert(0, project_root)

try:
    from Backend.main import app as fastapi_app

    @fastapi_app.get("/api/infra-test")
    def infra_test():
        return {"status": "ok", "version": "66.0-FINAL"}

    app = fastapi_app

except Exception as e:
    app = FastAPI()

    @app.get("/api/infra-test")
    def infra_test_error():
        return {
            "status": "error",
            "message": str(e),
            "trace": traceback.format_exc(),
        }

handler = app
