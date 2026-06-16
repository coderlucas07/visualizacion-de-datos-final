# Server estático SIN CACHÉ y MULTI-HILO para desarrollo.
# Uso: python3 serve.py [puerto]   (default 8000)
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
class NoCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    def log_message(self, *a):
        pass
httpd = ThreadingHTTPServer(('', PORT), NoCache)
print(f'Sirviendo SIN CACHÉ (multi-hilo) en http://localhost:{PORT}')
httpd.serve_forever()
