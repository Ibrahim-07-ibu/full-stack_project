import os
import sys
import json
import traceback

# 1. IMMEDIATE PATH INJECTION
# index.py is in api/
# project_root is the parent of api/
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)

if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Force Backend to be recognizable
backend_dir = os.path.join(project_root, "Backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

def handler(request, context=None):
    """
    Bulletproof entry point for Vercel Python runtime.
    Moves all complex imports inside the handler to capture every possible crash.
    """
    try:
        # Delayed framework imports
        from fastapi import FastAPI
        from mangum import Mangum
        from Backend.main import app as fastapi_app

        # Standard Mangum flow
        # In Vercel, 'request' is a dictionary containing the event data
        asgi_handler = Mangum(fastapi_app, lifespan="off")
        return asgi_handler(request, context)

    except Exception as e:
        # If ANY import or initialization fails, return a JSON error instead of a 500
        error_info = {
            "status": "error",
            "message": f"Critical Gateway Failure: {str(e)}",
            "trace": traceback.format_exc(),
            "env": {
                "cwd": os.getcwd(),
                "sys_path": sys.path[:5],
                "python_version": sys.version
            }
        }
        
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(error_info)
        }

# For Vercel direct discovery, we also export an 'app' instance
# but the 'builds' configuration in vercel.json prioritizes the handler.
app = handler
