# Deployment Guide for Starter Pack Explorer

This guide outlines how to deploy this mini-app to production with proper API handling.

## Development Setup

The app is configured to handle API requests in different environments:

1. **Local development** (http://localhost:5173): Uses Vite's proxy to handle CORS
2. **Cloudflare tunnel** (https://xxx.trycloudflare.com): Uses mock data during development
3. **Production** (your domain): Will use your API proxy implementation

```bash
# Start development server
pnpm dev

# In a separate terminal, start Cloudflare tunnel
cloudflared tunnel --url http://localhost:5173
```

## Frame SDK Authentication

The app uses the Farcaster Frame SDK to access user authentication:

1. When a user opens your mini-app in Warpcast, they are already authenticated
2. The Frame SDK provides access to the user's FID and authentication details
3. You can use this to make authenticated API requests to the Warpcast API

## Production Deployment Architecture

Based on examining other Farcaster mini-apps, the recommended architecture for production is:

1. Client-side:
   - Use Frame SDK for authentication and user context
   - Make requests to your own API proxy, not directly to Warpcast/Neynar

2. Server-side:
   - Create an authenticated proxy to Warpcast/Neynar API
   - Handle JWT token validation for secure communication

### Implementation with Cloudflare Workers (like the example app)

```javascript
// Worker example (similar to actions-siwf-mini-app)
import { Hono } from 'hono';
import { jwt } from 'hono/jwt';

const app = new Hono();

// API proxy routes
app.get('/api/starterpacks', async (c) => {
  try {
    const response = await fetch('https://api.warpcast.com/v2/starterpacks', {
      headers: {
        'x-api-key': c.env.NEYNAR_API_KEY,
      },
    });
    
    if (!response.ok) {
      return c.json({ error: 'API error' }, response.status);
    }
    
    const data = await response.json();
    return c.json(data);
  } catch (error) {
    return c.json({ error: 'Failed to fetch data' }, 500);
  }
});

// Protected routes
const protected = app.use('/api/protected/*', jwt({ secret: 'your-secret' }));

protected.get('/api/protected/user', async (c) => {
  const payload = c.get('jwtPayload');
  const fid = payload.fid;
  
  // Make authenticated request using the FID
  // ...
});

export default app;
```

#### Netlify Deployment

1. Create a Netlify function in `netlify/functions/proxy.js`
2. Deploy to Netlify

### Option 2: Deploy with Reverse Proxy

If using a custom server (Nginx, Apache, etc.), configure a reverse proxy:

```nginx
# Nginx example
location /api/ {
  proxy_pass https://api.warpcast.com/;
  proxy_set_header Host api.warpcast.com;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  
  # CORS headers
  add_header 'Access-Control-Allow-Origin' '*';
  add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
  add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
}
```

### Option 3: Standalone API Proxy

Create a separate API server that handles CORS and proxies requests:

1. Create a simple Express server:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS middleware
app.use(cors());

// Proxy middleware
app.use('/api', createProxyMiddleware({
  target: 'https://api.warpcast.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': ''
  }
}));

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
```

2. Deploy this server separately

## Farcaster Manifest Update

Update your `farcaster.json` with your production domain:

```json
{
  "frame": {
    "version": "1",
    "name": "Starter Pack Explorer",
    "iconUrl": "https://yourdomain.com/icon.png",
    "homeUrl": "https://yourdomain.com/",
    "imageUrl": "https://yourdomain.com/cover.png",
    "buttonTitle": "Explore Packs",
    "splashImageUrl": "https://yourdomain.com/splash.png",
    "splashBackgroundColor": "#5c6bc0"
  }
}
```

## Updating API Service for Production

When deploying to production, the API service will continue to work as configured. The proxy URL pattern will remain the same, but it will be handled by your production proxy instead of the development server.