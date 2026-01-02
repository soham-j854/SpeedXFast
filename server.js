const express = require('express');
const app = express();
const path = require('path');

const https = require('https');

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Proxy for Fast.com API
app.all(/^\/api.*/, (req, res) => {
    const token = req.query.token || 'YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm';
    const urlCount = req.query.urlCount || 5;
    const apiUrl = `https://api.fast.com/netflix/speedtest/v2?https=true&token=${token}&urlCount=${urlCount}`;

    console.log(`Proxying API request to: ${apiUrl}`);

    const options = {
        method: 'GET',
        headers: {
            'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
            'Accept': 'application/json'
        }
    };

    const proxyReq = https.request(apiUrl, options, (apiRes) => {
        res.status(apiRes.statusCode);
        Object.keys(apiRes.headers).forEach(key => {
            if (['content-type', 'access-control-allow-origin'].includes(key)) {
                res.setHeader(key, apiRes.headers[key]);
            }
        });
        res.setHeader('Access-Control-Allow-Origin', '*');
        apiRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        console.error(`API proxy error: ${err.message}`);
        res.status(500).send(err.message);
    });
    proxyReq.end();
});

// Generic proxy for speed test targets
app.all(/^\/proxy.*/, (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('URL is required');

    console.log(`Proxying target request to: ${targetUrl}`);

    const options = {
        method: 'GET',
        headers: {
            'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        }
    };

    // Forward the Range header if it exists
    if (req.headers.range) {
        options.headers.range = req.headers.range;
    }

    const proxyReq = https.request(targetUrl, options, (apiRes) => {
        // Forward status code and relevant headers
        res.status(apiRes.statusCode);

        const importantHeaders = [
            'content-type',
            'content-length',
            'content-range',
            'accept-ranges',
            'cache-control'
        ];

        importantHeaders.forEach(key => {
            if (apiRes.headers[key]) {
                res.setHeader(key, apiRes.headers[key]);
            }
        });

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Range');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');

        apiRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        console.error(`Target proxy error: ${err.message}`);
        res.status(500).send(err.message);
    });
    proxyReq.end();
});

// Serve static files (moved after proxy routes)
app.use(express.static(__dirname));

// Fallback to index.html for any other requests (SPA behavior) - Temporarily disabled due to PathError
// app.get('/:path*', (req, res) => {
//    res.sendFile(path.join(__dirname, 'index.html'));
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
