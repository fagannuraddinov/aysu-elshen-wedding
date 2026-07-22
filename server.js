const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const DB_PATH = path.join(__dirname, 'db.json');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.m4a': 'audio/mp4',
    '.mp3': 'audio/mpeg',
    '.json': 'application/json'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // CORS Headers for API requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // API: GET /api/wishes
    if (pathname === '/api/wishes' && method === 'GET') {
        fs.readFile(DB_PATH, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Database read error' }));
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data || '[]');
        });
        return;
    }

    // API: POST /api/wishes
    if (pathname === '/api/wishes' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', () => {
            try {
                const newWish = JSON.parse(body);
                if (!newWish.name || !newWish.message) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Name and message are required' }));
                }

                fs.readFile(DB_PATH, 'utf8', (err, data) => {
                    let wishes = [];
                    if (!err && data) {
                        try {
                            wishes = JSON.parse(data);
                        } catch (e) {
                            wishes = [];
                        }
                    }

                    const wishObject = {
                        id: Date.now().toString(),
                        name: newWish.name.substring(0, 100),
                        message: newWish.message.substring(0, 1000),
                        timestamp: new Date().toISOString()
                    };

                    wishes.push(wishObject);

                    fs.writeFile(DB_PATH, JSON.stringify(wishes, null, 2), 'utf8', (err) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            return res.end(JSON.stringify({ error: 'Database write error' }));
                        }
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, wish: wishObject }));
                    });
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    // API: DELETE /api/wishes
    if (pathname === '/api/wishes' && method === 'DELETE') {
        const id = parsedUrl.query.id;
        if (!id) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'ID parameter is required' }));
        }

        fs.readFile(DB_PATH, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Database read error' }));
            }

            let wishes = [];
            try {
                wishes = JSON.parse(data);
            } catch (e) {
                wishes = [];
            }

            const filteredWishes = wishes.filter(wish => wish.id !== id);

            fs.writeFile(DB_PATH, JSON.stringify(filteredWishes, null, 2), 'utf8', (err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Database write error' }));
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            });
        });
        return;
    }

    // Static File Serving
    let safePathname = pathname === '/' ? '/index.html' : pathname;
    let filePath = path.join(__dirname, safePathname);
    
    // Security check: make sure the filepath is within the directory
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(__dirname))) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(resolvedPath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    let localIp = '127.0.0.1';
    
    for (const interfaceName in networkInterfaces) {
        for (const iface of networkInterfaces[interfaceName]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                localIp = iface.address;
                break;
            }
        }
    }
    
    console.log(`\n=================================================`);
    console.log(`Premium Dəvətnamə Serveri Başladı!`);
    console.log(`Kompüterdə test etmək üçün: http://localhost:${PORT}/`);
    console.log(`Mobil telefonda test etmək üçün (eyni Wi-Fi-da):`);
    console.log(`http://${localIp}:${PORT}/`);
    console.log(`=================================================\n`);
});
