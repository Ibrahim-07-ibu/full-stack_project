import os
import sys
import json
import traceback

def handler(request, context):
    try:
        # 1. PATHING SETUP
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(current_dir)
        backend_dir = os.path.join(project_root, "Backend")

        if project_root not in sys.path:
            sys.path.insert(0, project_root)
        if backend_dir not in sys.path:
            sys.path.insert(0, backend_dir)

        # 2. MINI-HEALTH CHECK
        if request.get('path', '').endswith('/infra-test'):
            return {
                "statusCode": 200,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({
                    "status": "ok",
                    "version": "57.0-GATEWAY-HANDSHAKE",
                    "message": "Gateway Entry Point is LIVE",
                    "sys_path": sys.path[:5]
                })
            }

        # 3. FASTAPI DEFERRED LOAD
        from fastapi import FastAPI
        from Backend.main import app as fastapi_app
        
        # This is a bit tricky for a raw handler, so we normally let Vercel handle FastAPI.
        # But here we are forcing a raw handler to see errors.
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "status": "ok",
                "message": "FastAPI and Backend imported successfully in deferred mode"
            })
        }

    except Exception as e:
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "status": "error",
                "message": str(e),
                "trace": traceback.format_exc()
            })
        }
