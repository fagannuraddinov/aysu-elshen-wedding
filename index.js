/**
 * Universal Entrypoint for Vercel Node.js deployment
 * Serves static HTML/CSS/JS/media files and routes /api/wishes to Supabase handler.
 */
const fs = require('fs');
const path = require('path');
const wishesHandler = require('./api/wishes.js');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.m4a':  'audio/mp4',
    '.mp3':  'audio/mpeg',
    '.json': 'application/json'
};

module.exports = async (req, res) => {
    const urlPath = req.url.split('?')[0];

    // 1. Route API requests to Supabase serverless handler
    if (urlPath.startsWith('/api/wishes')) {
        return wishesHandler(req, res);
    }

    // 2. Determine static file path
    let relativePath = urlPath === '/' ? 'index.html' : urlPath.substring(1);
    let filePath = path.join(__dirname, relativePath);

    // If file doesn't exist, fallback to index.html
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(__dirname, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
        const fileBuffer = fs.readFileSync(filePath);
        res.statusCode = 200;
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        return res.end(fileBuffer);
    } catch (err) {
        console.error('File serving error:', err);
        res.statusCode = 404;
        return res.end('Not Found');
    }
};
