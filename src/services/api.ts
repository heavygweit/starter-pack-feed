// src/services/api.ts
import { sdk } from '@farcaster/frame-sdk';

// Extract starter pack ID from a Warpcast URL
export const extractPackIdFromUrl = (url: string): string | null => {
  try {
    // Handle URLs like https://warpcast.com/erica/pack/gaycoinz-db07ti
    const regex = /warpcast\.com\/([^\/]+)\/pack\/([^\/]+)/;
    const match = url.match(regex);
    
    if (match && match.length >= 3) {
      return match[2]; // The pack ID
    }
    
    return null;
  } catch (error) {
    console.error('Failed to extract pack ID from URL:', error);
    return null;
  }
};

// Fetch starter pack data from the public API
export const fetchStarterPackData = async (packId: string) => {
  try {
    const response = await fetch(`https://api.warpcast.com/fc/starter-pack-members?id=${packId}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch starter pack data for ${packId}:`, error);
    throw error;
  }
};

// Fetch user profile data
export const fetchUserProfile = async (username: string) => {
  try {
    const response = await fetch(`https://api.warpcast.com/fc/user/${username}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch user profile for ${username}:`, error);
    throw error;
  }
};

// Both localStorage (fallback) and server API for saved packs
const SAVED_PACKS_KEY = 'savedStarterPacks';

// Get current user's FID for storage
const getCurrentUserFid = async (): Promise<number | null> => {
  try {
    const userFid = await getUserFid();
    return userFid;
  } catch (error) {
    console.error('Failed to get user FID:', error);
    return null;
  }
};

// Fetch saved packs from the API
export const getSavedPacks = async () => {
  try {
    // Get user FID
    const fid = await getCurrentUserFid();
    
    if (!fid) {
      console.warn('No FID available, using localStorage fallback');
      // Fallback to localStorage if no FID
      const saved = localStorage.getItem(SAVED_PACKS_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    
    // Try to fetch from the API
    try {
      const response = await fetch(`/api/starter-packs?fid=${fid}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const packs = await response.json();
      return packs || [];
    } catch (apiError) {
      console.error('Failed to fetch from API, using localStorage fallback:', apiError);
      // Fallback to localStorage if API fails
      const saved = localStorage.getItem(SAVED_PACKS_KEY);
      return saved ? JSON.parse(saved) : [];
    }
  } catch (error) {
    console.error('Failed to get saved packs:', error);
    return [];
  }
};

export const saveStarterPack = async (packInfo: { id: string, url: string, name?: string, creator?: string }) => {
  try {
    // Get user FID
    const fid = await getCurrentUserFid();
    
    if (!fid) {
      console.warn('No FID available, using localStorage fallback');
      // Fallback to localStorage if no FID
      const savedPacks = await getSavedPacks();
      
      // Check if already saved
      if (!savedPacks.find(p => p.id === packInfo.id)) {
        const updatedPacks = [...savedPacks, packInfo];
        localStorage.setItem(SAVED_PACKS_KEY, JSON.stringify(updatedPacks));
        return true;
      }
      return false; // Already saved
    }
    
    // Try to save to the API
    try {
      const response = await fetch(`/api/starter-packs?fid=${fid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packInfo),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return true;
    } catch (apiError) {
      console.error('Failed to save to API, using localStorage fallback:', apiError);
      // Fallback to localStorage if API fails
      const savedPacks = await getSavedPacks();
      
      // Check if already saved
      if (!savedPacks.find(p => p.id === packInfo.id)) {
        const updatedPacks = [...savedPacks, packInfo];
        localStorage.setItem(SAVED_PACKS_KEY, JSON.stringify(updatedPacks));
        return true;
      }
      return false; // Already saved
    }
  } catch (error) {
    console.error('Failed to save starter pack:', error);
    return false;
  }
};

export const removeStarterPack = async (packId: string) => {
  try {
    // Get user FID
    const fid = await getCurrentUserFid();
    
    if (!fid) {
      console.warn('No FID available, using localStorage fallback');
      // Fallback to localStorage if no FID
      const savedPacks = await getSavedPacks();
      const updatedPacks = savedPacks.filter(p => p.id !== packId);
      localStorage.setItem(SAVED_PACKS_KEY, JSON.stringify(updatedPacks));
      return true;
    }
    
    // Try to remove from the API
    try {
      const response = await fetch(`/api/starter-packs?fid=${fid}&packId=${packId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return true;
    } catch (apiError) {
      console.error('Failed to remove from API, using localStorage fallback:', apiError);
      // Fallback to localStorage if API fails
      const savedPacks = await getSavedPacks();
      const updatedPacks = savedPacks.filter(p => p.id !== packId);
      localStorage.setItem(SAVED_PACKS_KEY, JSON.stringify(updatedPacks));
      return true;
    }
  } catch (error) {
    console.error(`Failed to remove starter pack ${packId}:`, error);
    return false;
  }
};

export const isPackSaved = async (packId: string) => {
  try {
    const savedPacks = await getSavedPacks();
    return savedPacks.some(p => p.id === packId);
  } catch (error) {
    console.error(`Failed to check if pack ${packId} is saved:`, error);
    return false;
  }
};