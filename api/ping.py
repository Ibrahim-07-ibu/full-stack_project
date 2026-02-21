from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            "status": "ping_received",
            "version": "48.0-PING",
            "message": "Vercel Python Ping Success"
        }).encode('utf-8'))
        return
