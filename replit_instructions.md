# SpeedXFast - Project Instructions for Replit Agent

Welcome! This project is a rebranded speed test application (SpeedXFast) designed to run with a local Express backend that acts as a proxy for the Fast.com API.

## Project Structure
- `server.js`: The Express backend. It serves static files and handles proxy requests to bypass CORS.
- `app-0bffe1.js`: Core frontend logic.
- `index.html`: Main entry point.
- `localized1752378709.json`: Localization data.

## Critical Implementation Details
I have implemented several key fixes that you should maintain:

1. **Express 5 Compatibility**: 
   The project uses Express `^5.2.1`. In this version, string-based wildcards like `*` in routes are deprecated and cause `PathError`. I have converted the proxy routes in `server.js` to use **Regular Expressions**:
   ```javascript
   app.all(/^\/api.*/, (req, res) => { ... });
   app.all(/^\/proxy.*/, (req, res) => { ... });
   ```
   **Do NOT** revert these to standard string patterns unless you use the named parameter syntax (e.g., `/:path*`).

2. **CORS Proxy**:
   The frontend cannot call `api.fast.com` directly due to CORS. 
   - Requests to the API are proxied through `/api`.
   - Download targets are proxied through `/proxy?url=...`.

3. **Inaccurate Speed Fix (Header Forwarding)**:
   Speed measurement depends on `Range` headers for chunking data. The proxy is configured to forward these headers:
   - Frontend `app-0bffe1.js` is set up to route all target URLs through the local proxy.
   - `server.js` forwards the `Range` request header and the `Content-Range`, `Content-Length`, and `Accept-Ranges` response headers.

## How to Run
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start the Server**:
   ```bash
   npm start
   ```
   (This runs `node server.js`).

## Next Steps for you (Replit Agent):
1. **WebView Verification**: Once the server is running on port 3000, verify the speed test in the Replit WebView.
2. **Performance Check**: Ensure the speed indicators are moving. If the speed seems stuck at low values (Kbps), check that the `Range` headers are being passed correctly in `server.js`.
3. **Port Exposure**: Ensure Replit is exposing port 3000 to the public URL so the proxy can be reached by the client-side browser.

Happy coding!
