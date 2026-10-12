"""Máy chủ thử cục bộ có nén gzip (giống GitHub Pages) để đo hiệu năng sát thực tế.
Chạy ở gốc repo: python3 tools/perf/serve.py 8770"""
import gzip, http.server, os, sys
TEXT = ('.html', '.js', '.css', '.svg', '.json', '.webmanifest', '.txt', '.xml')
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path): path = os.path.join(path, 'index.html')
        if path.endswith(TEXT) and os.path.isfile(path) and 'gzip' in self.headers.get('Accept-Encoding', ''):
            body = gzip.compress(open(path, 'rb').read(), 6)
            self.send_response(200)
            self.send_header('Content-Type', self.guess_type(path)); self.send_header('Content-Encoding', 'gzip')
            self.send_header('Content-Length', str(len(body))); self.end_headers()
            import io; return io.BytesIO(body)
        return super().send_head()
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8770
http.server.ThreadingHTTPServer(('', port), H).serve_forever()
