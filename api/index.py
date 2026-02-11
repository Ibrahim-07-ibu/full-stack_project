import sys
import os

# Root directory
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

# Backend directory
backend_path = os.path.join(project_root, "Backend")
sys.path.insert(0, backend_path)

try:
    from Backend.main import app as fastapi_app
    from mangum import Mangum
    
    # Vercel's Python runtime expects 'app' or 'application' as the variable name
    app = Mangum(fastapi_app)
    application = app
except Exception as e:
    print(f"Import Error: {e}")
    raise e
