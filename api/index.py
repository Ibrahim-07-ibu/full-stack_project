import sys
import os

# Ensure the project root and Backend directory are in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Backend directory
backend_path = os.path.join(project_root, "Backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

try:
    from Backend.main import app
    from mangum import Mangum
    
    # Wrap FastAPI with Mangum for Vercel/AWS Lambda
    handler = Mangum(app)
    # Also expose 'app' for Vercel's auto-detection
    app = app 
except Exception as e:
    # Explicit logging for Vercel logs
    print(f"Initialization Error: {e}")
    raise e
