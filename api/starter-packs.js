// api/starter-packs.js
// This will be deployed as a Vercel serverless function
import { createClient } from '@vercel/edge-config';

// Create a simple in-memory storage for fallback
const inMemoryStorage = new Map();

// Helper functions for storage operations
const getStoredPacks = async (fid, useEdgeConfig = true) => {
  // Try Edge Config first if available and requested
  if (edgeConfig && useEdgeConfig) {
    try {
      const packs = await edgeConfig.get(`user:${fid}:packs`);
      console.log(`Retrieved packs for user ${fid} from Edge Config:`, packs ? packs.length : 0);
      return packs || [];
    } catch (error) {
      console.error(`Failed to get packs from Edge Config for user ${fid}:`, error);
      // Fall back to in-memory storage
    }
  }
  
  // Use in-memory storage as fallback
  return inMemoryStorage.get(`user:${fid}:packs`) || [];
};

const storeUserPacks = async (fid, packs) => {
  // Try Edge Config first if available
  if (edgeConfig) {
    try {
      await edgeConfig.set(`user:${fid}:packs`, packs);
      console.log(`Stored ${packs.length} packs for user ${fid} in Edge Config`);
      return true;
    } catch (error) {
      console.error(`Failed to store packs in Edge Config for user ${fid}:`, error);
      // Fall back to in-memory storage
    }
  }
  
  // Use in-memory storage as fallback
  inMemoryStorage.set(`user:${fid}:packs`, packs);
  console.log(`Stored ${packs.length} packs for user ${fid} in memory`);
  return true;
};

// Create Edge Config client from environment variables
// Initialize as null to handle missing config gracefully
let edgeConfig = null;
try {
  if (process.env.EDGE_CONFIG) {
    console.log('Creating Edge Config client with connection string:', 
                process.env.EDGE_CONFIG.substring(0, 10) + '...[redacted]');
    
    edgeConfig = createClient({
      connectionString: process.env.EDGE_CONFIG,
    });
    
    console.log('Edge Config client created successfully');
  } else {
    console.warn('EDGE_CONFIG environment variable is missing, will use in-memory storage');
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
  
  // Log if Edge Config is not available
  if (!edgeConfig) {
    console.error('Edge Config client is not available, will use in-memory storage');
    // We'll continue with an in-memory store for this session
    // This allows the API to work without Edge Config, but data won't persist between API invocations
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
        // Get starter packs for this user using our helper function
        const packs = await getStoredPacks(fid);
        
        // Indicate whether cross-device storage is available
        return res.status(200).json({
          packs,
          storageMode: edgeConfig ? 'cross-device' : 'device-only',
          message: edgeConfig 
            ? 'Your saved packs will be accessible across all devices' 
            : 'Your saved packs will only be accessible on this device/browser'
        });
      } catch (error) {
        console.error('Error getting packs:', error);
        return res.status(200).json({
          packs: [],
          storageMode: 'device-only',
          message: 'Your saved packs will only be accessible on this device/browser'
        });
      }
    } 
    else if (req.method === 'POST') {
      // Add a new starter pack
      let pack;
      
      try {
        // Ensure we have a valid JSON body
        pack = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        console.log('Received pack data:', pack);
      } catch (e) {
        console.error('Failed to parse request body:', e, req.body);
        return res.status(400).json({ error: 'Invalid JSON data' });
      }
      
      if (!pack || !pack.id || !pack.url) {
        console.error('Missing required pack fields:', pack);
        return res.status(400).json({ error: 'Invalid pack data - missing id or url' });
      }
      
      // Get existing packs
      let packs = await getStoredPacks(fid);
      
      // Check if pack already exists
      if (!packs.find(p => p.id === pack.id)) {
        // Add the new pack
        packs.push(pack);
        
        // Store the updated packs list
        const success = await storeUserPacks(fid, packs);
        if (!success) {
          return res.status(500).json({ error: 'Failed to save pack' });
        }
        
        console.log(`Successfully saved pack ${pack.id} for user ${fid}`);
      } else {
        console.log(`Pack ${pack.id} already exists for user ${fid}`);
      }
      
      return res.status(200).json({ 
        success: true, 
        packs,
        storageMode: edgeConfig ? 'cross-device' : 'device-only',
        message: edgeConfig 
          ? 'Your saved packs will be available across all devices' 
          : 'Your saved packs will only be accessible on this device/browser'
      });
    } 
    else if (req.method === 'DELETE') {
      // Remove a starter pack
      const { packId } = req.query;
      
      if (!packId) {
        return res.status(400).json({ error: 'Missing packId parameter' });
      }
      
      // Get existing packs
      let packs = await getStoredPacks(fid);
      
      // Check if pack exists
      if (!packs.some(p => p.id === packId)) {
        return res.status(404).json({ error: 'Pack not found' });
      }
      
      // Filter out the pack to remove
      packs = packs.filter(p => p.id !== packId);
      
      // Store the updated packs list
      const success = await storeUserPacks(fid, packs);
      if (!success) {
        return res.status(500).json({ error: 'Failed to remove pack' });
      }
      
      console.log(`Successfully removed pack ${packId} for user ${fid}`);
      
      return res.status(200).json({ 
        success: true, 
        packs,
        storageMode: edgeConfig ? 'cross-device' : 'device-only',
        message: edgeConfig 
          ? 'Your saved packs will be available across all devices' 
          : 'Your saved packs will only be accessible on this device/browser'
      });
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}