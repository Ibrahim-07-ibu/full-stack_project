def handler(request):
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": '{"status":"ok","version":"65.0-ZERO-DEP","message":"Pure Python handler is LIVE"}'
    }
