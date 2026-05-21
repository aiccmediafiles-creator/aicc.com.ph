import http.server, os, sys

PORT = int(os.environ.get("PORT", 3456))
os.chdir(os.path.dirname(os.path.abspath(__file__)))

handler = http.server.SimpleHTTPRequestHandler
httpd = http.server.HTTPServer(("", PORT), handler)
print(f"Serving on port {PORT}", flush=True)
httpd.serve_forever()
