// src/services/frame.ts
import * as frame from '@farcaster/frame-sdk';

declare global {
  interface Window {
    userFid?: number;
    frameInitialized?: boolean;
  }
}

// The sdk.context could contain a nested user object in some frame environments
type NestedUserObj = {
  fid?: number;
  user?: { fid: number };
};

// Create a promise that will resolve when frame initialization is complete
let frameInitPromise: Promise<void>;
let resolveFrameInit: () => void;

// Initialize the promise
frameInitPromise = new Promise((resolve) => {
  resolveFrameInit = resolve;
});

export async function initializeFrame() {
  try {
    // Default to not initialized
    window.frameInitialized = false;
    
    const context = await frame.sdk.context;

    if (!context || !context.user) {
      console.log('Not in a Farcaster Frame or user not authenticated');
      resolveFrameInit(); // Resolve the promise even if not in a frame
      return;
    }

    // Cast to access possible nested user
    const user = context.user as unknown as NestedUserObj;
    
    // Get FID from either direct user object or nested user object
    const fid = user.user?.fid || user.fid;

    if (!fid) {
      // most likely not in a frame
      console.log('Not in a Farcaster Frame or user not authenticated');
      resolveFrameInit(); // Resolve the promise even if not in a frame
      return;
    }

    console.log('Frame initialized with FID:', fid);
    window.userFid = fid;
    window.frameInitialized = true;
    
    // Call the ready function to remove splash screen when in a frame
    await frame.sdk.actions.ready();
    
    // Resolve the promise to indicate frame initialization is complete
    resolveFrameInit();
  } catch (error) {
    console.error('Error initializing Frame:', error);
    resolveFrameInit(); // Resolve the promise even on error
  }
}

export function getUserFid(): number | undefined {
  return window.userFid;
}

// Function to wait for frame initialization
export async function waitForFrameInit(): Promise<void> {
  return frameInitPromise;
}

// Check if frame is initialized
export function isFrameInitialized(): boolean {
  return window.frameInitialized === true;
}