import sys
import os

# Root directory (where Backend and api folders live)
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

# Backend directory
backend_path = os.path.join(project_root, "Backend")
sys.path.insert(0, backend_path)

# Import the FastAPI app instance from Backend/main.py
try:
    from Backend.main import app
except ImportError:
    from main import app

# Vercel natively supports FastAPI 'app' instances.
# No Mangum wrapper needed for the modern @vercel/python runtime.
handler = app
