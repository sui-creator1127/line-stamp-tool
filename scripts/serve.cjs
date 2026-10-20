const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../docs');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
function handler(req, res) {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const relative = pathname.replace(/^\/line-stamp-tool\//, '/');
    const target = path.resolve(root, '.' + (relative === '/' ? '/index.html' : relative));
    if (!target.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    const body = fs.readFileSync(target);
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
}
module.exports = handler;
if (require.main === module) {
  http.createServer(handler).listen(8000, '127.0.0.1', () => console.log('Open http://localhost:8000/line-stamp-tool/ (Ctrl+C to stop)'));
}
