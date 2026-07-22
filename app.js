/**
 * Express Server Entrypoint for Vercel Node.js Deployment
 * Handles static asset serving (CSS/JS/images) with proper MIME types,
 * and routes /api/wishes requests to Supabase serverless handler.
 */
const express = require('express');
const path = require('path');
const wishesHandler = require('./api/wishes.js');

const app = express();

// Parse JSON body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. API Endpoint for Supabase wishes
app.all('/api/wishes', (req, res) => {
    return wishesHandler(req, res);
});

// 2. Serve static files (HTML, CSS, JS, images, audio) directly with correct MIME types
app.use(express.static(path.join(__dirname), {
    maxAge: '0',
    etag: false
}));

// 3. Fallback route for single page app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

module.exports = app;
