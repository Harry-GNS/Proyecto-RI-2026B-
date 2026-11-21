"""
Proyecto RI 2026-B — Servidor para Frontend en 'front/'
Sirve los archivos estáticos de la interfaz 'goggles'.
"""

import os
import sys
import mimetypes
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = int(os.environ.get("PORT", 5050))
ROOT_DIR = Path(__file__).resolve().parent.parent
FRONT_DIR = ROOT_DIR / "front"

# Asegurar mimetypes correctos
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")

class FrontHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FRONT_DIR), **kwargs)

    def log_message(self, format, *args):
        sys.stderr.write(f"[HTTP] {self.address_string()} - {format % args}\n")

def run():
    server_address = ("0.0.0.0", PORT)
    httpd = HTTPServer(server_address, FrontHandler)
    print(f"\n==========================================")
    print(f"  [goggles] Servidor Frontend Activo")
    print(f"  Directorio: {FRONT_DIR}")
    print(f"  URL Local: http://localhost:{PORT}")
    print(f"==========================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
        httpd.server_close()

if __name__ == "__main__":
    run()
