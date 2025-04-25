// api/starter-packs.js
// This will be deployed as a Vercel serverless function
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    // Get user FID from query parameter 
    // In production, you should validate this more thoroughly
    const { fid } = req.query; 
    
    if (!fid) {
      return res.status(400).json({ error: 'Missing FID parameter' });
    }

    // Handle different HTTP methods
    if (req.method === 'GET') {
      // Get starter packs for this user
      const packs = await kv.get(`user:${fid}:packs`);
      return res.status(200).json(packs || []);
    } 
    else if (req.method === 'POST') {
      // Add a new starter pack
      const pack = req.body;
      
      if (!pack || !pack.id || !pack.url) {
        return res.status(400).json({ error: 'Invalid pack data' });
      }
      
      // Get existing packs
      let packs = await kv.get(`user:${fid}:packs`) || [];
      
      // Check if pack already exists
      if (!packs.find(p => p.id === pack.id)) {
        packs.push(pack);
        await kv.set(`user:${fid}:packs`, packs);
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
      let packs = await kv.get(`user:${fid}:packs`) || [];
      
      // Filter out the pack to remove
      packs = packs.filter(p => p.id !== packId);
      await kv.set(`user:${fid}:packs`, packs);
      
      return res.status(200).json({ success: true, packs });
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}