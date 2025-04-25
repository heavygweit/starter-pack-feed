# Deployment Guide for Starter Pack Feed App

This guide outlines how to deploy this mini-app to Vercel with KV database integration for cross-device storage.

## Development Setup

The app is configured to handle API requests in different environments:

1. **Local development** (http://localhost:5173): Uses localStorage for starter pack storage
2. **Production** (your Vercel domain): Uses Vercel KV for persistent cross-device storage

```bash
# Start development server
pnpm dev
```

## Vercel Deployment Process

Follow these steps to deploy the app to Vercel with KV database integration:

1. **Create a Vercel Project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" > "Project"
   - Import your GitHub repository
   - Configure the project with these settings:
     - Framework Preset: Vite
     - Build Command: `pnpm build`
     - Output Directory: `dist`
     - Install Command: `pnpm install`

2. **Set Up Vercel KV Database**
   - After the initial deployment, go to the project's "Storage" tab
   - Click "Connect" next to "Vercel KV"
   - Follow the steps to create a new KV database (Redis)
   - Once created, Vercel will automatically add environment variables to your project:
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN`

3. **Redeploy the Project**
   - After setting up the KV database, trigger a new deployment
   - Vercel will include the environment variables for KV access

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

Update your `farcaster.json` with your Vercel production domain:

```json
{
  "frame": {
    "version": "1",
    "name": "Starter Pack Feed",
    "iconUrl": "https://your-vercel-domain.vercel.app/icon.png",
    "homeUrl": "https://your-vercel-domain.vercel.app/",
    "imageUrl": "https://your-vercel-domain.vercel.app/cover.png",
    "buttonTitle": "View Packs",
    "splashImageUrl": "https://your-vercel-domain.vercel.app/splash.png",
    "splashBackgroundColor": "#5c6bc0"
  }
}
```

## Troubleshooting

### CORS Issues
The API routes in this project are serverless functions that run on Vercel. If you encounter CORS issues:

1. Make sure your client-side API calls use relative paths that will be correctly routed to your serverless functions:
   ```javascript
   // Good - relative path
   fetch('/api/starter-packs?fid=123')
   
   // Bad - absolute path to your domain
   fetch('https://your-domain.com/api/starter-packs?fid=123')
   ```

2. If needed, you can add CORS headers to your serverless functions:
   ```javascript
   // In api/starter-packs.js
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
   
   // Handle OPTIONS requests
   if (req.method === 'OPTIONS') {
     return res.status(200).end();
   }
   ```

### Vercel KV Connection Issues
If the app falls back to localStorage despite being deployed to Vercel:

1. Verify that the KV database is properly connected in the Vercel dashboard
2. Check that environment variables are correctly set
3. Verify that the serverless function has proper permissions to access the KV database
4. Check the function logs in the Vercel dashboard for error messages