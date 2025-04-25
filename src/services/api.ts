// src/services/api.ts
import { getUserFid, waitForFrameInit, isFrameInitialized } from './frame';

// Types
export interface StarterPack {
  id: string;
  url: string;
  name?: string;
  creator?: string;
  description?: string;
  members?: Array<{ fid: number }>;
}

export interface User {
  fid: number;
  username: string;
  displayName: string;
  pfp: { url: string };
  bio?: string;
  followerCount?: number;
  followingCount?: number;
}

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

// Get a starter pack by ID - combines data fetching and parsing
export const getStarterPackById = async (id: string | undefined): Promise<any> => {
  if (!id) throw new Error('Pack ID is required');
  const data = await fetchStarterPackData(id);
  return {
    result: {
      starterpack: {
        id,
        name: `Starter Pack ${id}`,
        description: 'A collection of profiles to follow',
        members: data.result.members || []
      }
    }
  };
};

// Get user by FID
export const getUserByFid = async (fid: number): Promise<any> => {
  try {
    // This is a mock implementation since the public API doesn't have a direct getFid endpoint
    // In a real implementation, you would call the actual API
    return {
      result: {
        user: {
          fid,
          username: `user_${fid}`,
          displayName: `User ${fid}`,
          pfp: { url: 'https://warpcast.com/~/default-avatar.png' },
          bio: 'Farcaster user',
          followerCount: 0,
          followingCount: 0
        }
      }
    };
  } catch (error) {
    console.error(`Failed to fetch user data for FID ${fid}:`, error);
    throw error;
  }
};

// Both localStorage (fallback) and server API for saved packs
const SAVED_PACKS_KEY = 'savedStarterPacks';

// Get current user's FID for storage
const getCurrentUserFid = async (): Promise<number | null> => {
  try {
    // If frame is not initialized yet, wait for it
    if (!isFrameInitialized()) {
      console.log('Waiting for frame initialization...');
      await waitForFrameInit();
    }
    
    // Get FID from window.userFid (set by initializeFrame)
    return getUserFid() || null;
  } catch (error) {
    console.error('Failed to get user FID:', error);
    return null;
  }
};

// Get API base URL (vercel deployment vs local dev)
const getApiBaseUrl = () => {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isVercel = window.location.hostname.includes('vercel.app');
  
  if (isVercel || !isLocalhost) {
    // We're in production or preview deployment
    return '';
  }
  
  // In development, specify the full URL if needed
  // This is only needed if you're running Vercel Functions locally
  // return 'http://localhost:3000';
  
  return '';
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
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/starter-packs?fid=${fid}`);
      
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
      if (!savedPacks.find((p: StarterPack) => p.id === packInfo.id)) {
        const updatedPacks = [...savedPacks, packInfo];
        localStorage.setItem(SAVED_PACKS_KEY, JSON.stringify(updatedPacks));
        return true;
      }
      return false; // Already saved
    }
    
    // Try to save to the API
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/starter-packs?fid=${fid}`, {
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
      if (!savedPacks.find((p: StarterPack) => p.id === packInfo.id)) {
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
      const updatedPacks = savedPacks.filter((p: StarterPack) => p.id !== packId);
      localStorage.setItem(SAVED_PACKS_KEY, JSON.stringify(updatedPacks));
      return true;
    }
    
    // Try to remove from the API
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/starter-packs?fid=${fid}&packId=${packId}`, {
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
      const updatedPacks = savedPacks.filter((p: StarterPack) => p.id !== packId);
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
    return savedPacks.some((p: StarterPack) => p.id === packId);
  } catch (error) {
    console.error(`Failed to check if pack ${packId} is saved:`, error);
    return false;
  }
};