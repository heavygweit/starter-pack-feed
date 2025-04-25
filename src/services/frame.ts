// src/services/frame.ts
import * as frame from '@farcaster/frame-sdk';

declare global {
  interface Window {
    userFid?: number;
  }
}

// The sdk.context could contain a nested user object in some frame environments
type NestedUserObj = {
  fid?: number;
  user?: { fid: number };
};

export async function initializeFrame() {
  try {
    const context = await frame.sdk.context;

    if (!context || !context.user) {
      console.log('Not in a Farcaster Frame or user not authenticated');
      return;
    }

    // Cast to access possible nested user
    const user = context.user as unknown as NestedUserObj;
    
    // Get FID from either direct user object or nested user object
    const fid = user.user?.fid || user.fid;

    if (!fid) {
      // most likely not in a frame
      console.log('Not in a Farcaster Frame or user not authenticated');
      return;
    }

    console.log('Frame initialized with FID:', fid);
    window.userFid = fid;
    
    // Call the ready function to remove splash screen when in a frame
    await frame.sdk.actions.ready();
  } catch (error) {
    console.error('Error initializing Frame:', error);
  }
}

export function getUserFid(): number | undefined {
  return window.userFid;
}