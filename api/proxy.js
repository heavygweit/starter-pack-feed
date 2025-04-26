// api/proxy.js - A proxy for API requests to avoid CORS issues
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Get the URL parameter
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'Missing URL parameter' });
    }
    
    // Validate the URL is for trusted domains only
    const validDomains = ['api.warpcast.com', 'client.warpcast.com', 'auth.uno.fun'];
    const urlObj = new URL(url);
    
    if (!validDomains.includes(urlObj.hostname)) {
      return res.status(400).json({ 
        error: 'Invalid URL domain. Only api.warpcast.com and auth.uno.fun are allowed' 
      });
    }
    
    // Forward the request to the target URL
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Don't forward auth headers from the client for security
      },
      // Forward the body for POST requests
      ...(req.method === 'POST' && req.body ? { body: JSON.stringify(req.body) } : {}),
    });
    
    // Get the response body as JSON or text
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    // Return the response with the same status code
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Failed to proxy request' });
  }
}