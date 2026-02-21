import json

def handler(request):
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({
            "status": "ok",
            "version": "37.0-PURE-PYTHON-BASELINE",
            "message": "Pure Python Handler is LIVE",
            "path": request.get('path', 'unknown')
        })
    }
