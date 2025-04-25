// api/starter-packs.js
// This will be deployed as a Vercel serverless function
import { createClient } from '@vercel/edge-config';

// Create Edge Config client from environment variables
// Initialize as null to handle missing config gracefully
let edgeConfig = null;
try {
  if (process.env.EDGE_CONFIG) {
    edgeConfig = createClient({
      connectionString: process.env.EDGE_CONFIG,
    });
  } else {
    console.warn('EDGE_CONFIG environment variable is missing, API will return empty arrays');
  }
} catch (error) {
  console.error('Failed to create Edge Config client:', error);
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Check if Edge Config is properly configured
  if (!edgeConfig) {
    console.error('Edge Config client is not available');
    // Return empty array instead of error to allow app to fallback to localStorage
    return res.status(200).json([]);
  }
  
  try {
    // Get user FID from query parameter 
    // In production, you should validate this more thoroughly
    const { fid } = req.query; 
    
    if (!fid) {
      return res.status(400).json({ error: 'Missing FID parameter' });
    }

    // Handle different HTTP methods
    if (req.method === 'GET') {
      try {
        // Get starter packs for this user
        const packs = await edgeConfig.get(`user:${fid}:packs`);
        return res.status(200).json(packs || []);
      } catch (error) {
        // If the key doesn't exist yet, return an empty array
        console.log('Edge Config get error (likely key not found):', error);
        return res.status(200).json([]);
      }
    } 
    else if (req.method === 'POST') {
      // Add a new starter pack
      const pack = req.body;
      
      if (!pack || !pack.id || !pack.url) {
        return res.status(400).json({ error: 'Invalid pack data' });
      }
      
      // Get existing packs
      let packs = [];
      try {
        packs = await edgeConfig.get(`user:${fid}:packs`) || [];
      } catch (error) {
        // If the key doesn't exist yet, start with an empty array
        console.log('Edge Config get error (likely key not found):', error);
      }
      
      // Check if pack already exists
      if (!packs.find(p => p.id === pack.id)) {
        packs.push(pack);
        await edgeConfig.set(`user:${fid}:packs`, packs);
      }
      
      return res.status(200).json({ success: true, packs });
    } 
    else if (req.method === 'DELETE') {
      // Remove a starter pack
      const { packId } = req.query;
      
      if (!packId) {
        return res.status(400).json({ error: 'Missing packId parameter' });
      }
      
      // Get existing packs
      let packs = [];
      try {
        packs = await edgeConfig.get(`user:${fid}:packs`) || [];
      } catch (error) {
        // If the key doesn't exist yet, start with an empty array
        console.log('Edge Config get error (likely key not found):', error);
      }
      
      // Filter out the pack to remove
      packs = packs.filter(p => p.id !== packId);
      await edgeConfig.set(`user:${fid}:packs`, packs);
      
      return res.status(200).json({ success: true, packs });
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}