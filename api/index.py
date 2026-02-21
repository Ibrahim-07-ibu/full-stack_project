def handler(environ, start_response):
    status = '200 OK'
    headers = [('Content-Type', 'application/json')]
    start_response(status, headers)
    
    import sys, os
    import json
    
    response = {
        "status": "ok",
        "version": "30.0-WSGI-BASELINE",
        "message": "WSGI Handler is LIVE",
        "sys_path": sys.path,
        "env": {k: v for k, v in os.environ.items() if "KEY" not in k and "PASS" not in k and "TOKEN" not in k}
    }
    
    return [json.dumps(response).encode('utf-8')]
