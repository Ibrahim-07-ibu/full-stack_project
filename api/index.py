import sys
import os

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

backend_path = os.path.join(project_root, "Backend")
sys.path.insert(0, backend_path)

os.environ['ENVIRONMENT'] = 'production'

try:
    from Backend.main import app as fastapi_app
    from mangum import Mangum
    
    app = Mangum(fastapi_app, lifespan="off")
    
    application = app
    
    print("✓ Vercel serverless function initialized successfully", flush=True)
    
except ImportError as e:
    print(f"✗ Import Error: Missing dependency - {e}", flush=True)
    raise
except Exception as e:
    print(f"✗ Fatal Error during initialization: {e}", flush=True)
    import traceback
    traceback.print_exc()
    raise
