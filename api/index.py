import sys
import os
import logging
import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

# 1. ENVIRONMENT
ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

# 2. PATHING
project_root = os.getcwd() 
api_dir = os.path.join(project_root, "api")
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

# 3. INITIALIZATION
app = FastAPI(redirect_slashes=False, title="HomeBuddy API", version="15.0-WILDCARD")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. WILDCARD AUDITOR
@app.api_route("/api/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def catch_all_api(request: Request, full_path: str):
    return {
        "status": "intercepted",
        "path_param": full_path,
        "method": request.method,
        "url": str(request.url),
        "headers": dict(request.headers),
        "base_url": str(request.base_url)
    }

# 5. DIAGNOSTICS
@app.get("/api/infra-test")
def infra_test():
    return {
        "status": "ok",
        "version": "15.0-WILDCARD",
        "env": ENVIRONMENT,
        "sys_path": sys.path
    }

@app.get("/api/health")
def health():
    return {"status": "ok"}

# Vercel entry
handler = app
