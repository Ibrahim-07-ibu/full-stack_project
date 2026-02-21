import sys
import os
import logging
import traceback
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. ENVIROMENT
ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

# 2. PATHING
project_root = os.getcwd() 
api_dir = os.path.join(project_root, "api")
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

# 3. APP (No project imports yet!)
app = FastAPI(redirect_slashes=False, title="HomeBuddy API", version="5.0-SAFE-MODE")

# 4. DEFERRED DIAGNOSTICS
@app.get("/api/infra-test")
def infra_test():
    context = {
        "status": "diagnostic",
        "version": "5.0-SAFE-MODE",
        "env": ENVIRONMENT,
        "db_raw": os.getenv("DATABASE_URL", "NOT_SET")[:20] + "...",
        "sys_path": sys.path,
        "import_test": "Not Attempted"
    }
    
    try:
        # ATTEMPT URL REWRITE
        raw = os.getenv("DATABASE_URL", "")
        if "://" in raw:
            _, rest = raw.split("://", 1)
            fixed = f"postgresql+pg8000://{rest}"
            os.environ["DATABASE_URL"] = fixed
            context["db_fixed_prefix"] = fixed.split("://")[0]
        
        # ATTEMPT IMPORTS
        from db.database import Base, engine
        from routers import users
        context["import_test"] = "Success"
        
        # ATTEMPT ENGINE (Lazy test)
        context["engine_dialect"] = str(engine.dialect.name)
        
    except Exception as e:
        context["import_test"] = "Failed"
        context["error"] = str(e)
        context["traceback"] = traceback.format_exc()
        
    return context

@app.get("/api/health")
def health():
    return {"status": "ok"}

# Vercel entry
handler = app
