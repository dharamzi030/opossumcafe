import http.server
import socketserver
import os

PORT = 5000

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Disable caching for easier development
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
    print(f"줌쥐카페 서버가 시작되었습니다: http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n서버를 종료합니다.")
        httpd.server_close()
