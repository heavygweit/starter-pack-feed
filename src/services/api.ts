// src/services/api.ts
import { getUserFid, waitForFrameInit, isFrameInitialized } from "./frame";
import { StarterPack, User, FeedRequest, FeedResponse } from "./types";

export type { StarterPack, User };

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
		console.error("Failed to extract pack ID from URL:", error);
		return null;
	}
};

// Fetch starter pack data from the public API through our proxy
export const fetchStarterPackData = async (packId: string) => {
	try {
		const apiBaseUrl = getApiBaseUrl();
		// Use our proxy endpoint to avoid CORS issues
		const encodedUrl = encodeURIComponent(
			`https://api.warpcast.com/fc/starter-pack-members?id=${packId}`,
		);
		const response = await fetch(`${apiBaseUrl}/api/proxy?url=${encodedUrl}`);

		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		return response.json();
	} catch (error) {
		console.error(`Failed to fetch starter pack data for ${packId}:`, error);
		throw error;
	}
};

// Fetch user profile data through our proxy
export const fetchUserProfile = async (username: string) => {
	try {
		const apiBaseUrl = getApiBaseUrl();
		// Use our proxy endpoint to avoid CORS issues
		const encodedUrl = encodeURIComponent(
			`https://api.warpcast.com/fc/user/${username}`,
		);
		const response = await fetch(`${apiBaseUrl}/api/proxy?url=${encodedUrl}`);

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
export const getStarterPackById = async (
	id: string | undefined,
): Promise<any> => {
	if (!id) throw new Error("Pack ID is required");
	const data = await fetchStarterPackData(id);
	return {
		result: {
			starterpack: {
				id,
				name: `${id}`,
				description: data.result.description,
				members: data.result.members || [],
			},
		},
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
					pfp: { url: "https://warpcast.com/~/default-avatar.png" },
					bio: "Farcaster user",
					followerCount: 0,
					followingCount: 0,
				},
			},
		};
	} catch (error) {
		console.error(`Failed to fetch user data for FID ${fid}:`, error);
		throw error;
	}
};

// Both localStorage (fallback) and server API for saved packs
const SAVED_PACKS_KEY = "savedStarterPacks";

// Get current user's FID for storage
const getCurrentUserFid = async (): Promise<number | null> => {
	try {
		// If frame is not initialized yet, wait for it
		if (!isFrameInitialized()) {
			console.log("Waiting for frame initialization...");
			await waitForFrameInit();
		}

		// Get FID from window.userFid (set by initializeFrame)
		return getUserFid() || null;
	} catch (error) {
		console.error("Failed to get user FID:", error);
		return null;
	}
};

// Get API base URL (vercel deployment vs local dev)
const getApiBaseUrl = () => {
	const isLocalhost =
		window.location.hostname === "localhost" ||
		window.location.hostname === "127.0.0.1";
	const isVercel = window.location.hostname.includes("vercel.app");

	if (isVercel || !isLocalhost) {
		// We're in production or preview deployment
		return "";
	}

	// In development, specify the full URL if needed
	// This is only needed if you're running Vercel Functions locally
	// return 'http://localhost:3000';

	return "";
};

// Storage mode information
export interface StorageInfo {
	packs: StarterPack[];
	storageMode: "cross-device" | "device-only";
	message: string;
}

// Fetch saved packs from the API
export const getSavedPacks = async (): Promise<StorageInfo> => {
	try {
		// Get user FID
		const fid = await getCurrentUserFid();

		if (!fid) {
			console.warn("No FID available, using localStorage fallback");
			// Fallback to localStorage if no FID
			const saved = localStorage.getItem(SAVED_PACKS_KEY);
			const packs = saved ? JSON.parse(saved) : [];

			return {
				packs,
				storageMode: "device-only",
				message:
					"Your saved packs will only be accessible on this device/browser",
			};
		}

		// Try to fetch from the API
		try {
			const apiBaseUrl = getApiBaseUrl();
			const response = await fetch(
				`${apiBaseUrl}/api/starter-packs?fid=${fid}`,
			);

			if (!response.ok) {
				throw new Error(`API error: ${response.status}`);
			}

			const data = await response.json();

			// New API format with storageMode information
			if (data && typeof data === "object" && "packs" in data) {
				return data as StorageInfo;
			}

			// Legacy API format (just an array)
			return {
				packs: Array.isArray(data) ? data : [],
				storageMode: "device-only",
				message:
					"Your saved packs will only be accessible on this device/browser",
			};
		} catch (apiError) {
			console.error(
				"Failed to fetch from API, using localStorage fallback:",
				apiError,
			);
			// Fallback to localStorage if API fails
			const saved = localStorage.getItem(SAVED_PACKS_KEY);
			const packs = saved ? JSON.parse(saved) : [];

			return {
				packs,
				storageMode: "device-only",
				message:
					"Your saved packs will only be accessible on this device/browser",
			};
		}
	} catch (error) {
		console.error("Failed to get saved packs:", error);
		return {
			packs: [],
			storageMode: "device-only",
			message:
				"Your saved packs will only be accessible on this device/browser",
		};
	}
};

export const saveStarterPack = async (packInfo: {
	id: string;
	url: string;
	name?: string;
	creator?: string;
}) => {
	try {
		// Get user FID
		const fid = await getCurrentUserFid();

		if (!fid) {
			console.warn("No FID available, using localStorage fallback");
			// Fallback to localStorage if no FID
			const storageInfo = await getSavedPacks();
			const savedPacks = storageInfo.packs;

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
			const response = await fetch(
				`${apiBaseUrl}/api/starter-packs?fid=${fid}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(packInfo),
				},
			);

			if (!response.ok) {
				throw new Error(`API error: ${response.status}`);
			}

			return true;
		} catch (apiError) {
			console.error(
				"Failed to save to API, using localStorage fallback:",
				apiError,
			);
			// Fallback to localStorage if API fails
			const storageInfo = await getSavedPacks();
			const savedPacks = storageInfo.packs;

			// Check if already saved
			if (!savedPacks.find((p: StarterPack) => p.id === packInfo.id)) {
				const updatedPacks = [...savedPacks, packInfo];
				localStorage.setItem(SAVED_PACKS_KEY, JSON.stringify(updatedPacks));
				return true;
			}
			return false; // Already saved
		}
	} catch (error) {
		console.error("Failed to save starter pack:", error);
		return false;
	}
};

export const removeStarterPack = async (packId: string) => {
	try {
		// Get user FID
		const fid = await getCurrentUserFid();

		if (!fid) {
			console.warn("No FID available, using localStorage fallback");
			// Fallback to localStorage if no FID
			const storageInfo = await getSavedPacks();
			const savedPacks = storageInfo.packs;
			const updatedPacks = savedPacks.filter(
				(p: StarterPack) => p.id !== packId,
			);
			localStorage.setItem(SAVED_PACKS_KEY, JSON.stringify(updatedPacks));
			return true;
		}

		// Try to remove from the API
		try {
			const apiBaseUrl = getApiBaseUrl();
			const response = await fetch(
				`${apiBaseUrl}/api/starter-packs?fid=${fid}&packId=${packId}`,
				{
					method: "DELETE",
				},
			);

			if (!response.ok) {
				throw new Error(`API error: ${response.status}`);
			}

			return true;
		} catch (apiError) {
			console.error(
				"Failed to remove from API, using localStorage fallback:",
				apiError,
			);
			// Fallback to localStorage if API fails
			const storageInfo = await getSavedPacks();
			const savedPacks = storageInfo.packs;
			const updatedPacks = savedPacks.filter(
				(p: StarterPack) => p.id !== packId,
			);
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
		const storageInfo = await getSavedPacks();
		return storageInfo.packs.some((p: StarterPack) => p.id === packId);
	} catch (error) {
		console.error(`Failed to check if pack ${packId} is saved:`, error);
		return false;
	}
};

// Preview mode state
let previewModeEnabled = false;

// Explicitly set preview mode
export const setPreviewMode = (enabled: boolean) => {
	previewModeEnabled = enabled;
	console.log("Preview mode set to:", previewModeEnabled);
	return previewModeEnabled;
};

// Toggle preview mode
export const togglePreviewMode = () => {
	previewModeEnabled = !previewModeEnabled;
	console.log("Preview mode toggled:", previewModeEnabled);
	return previewModeEnabled;
};

// Get preview mode state
export const isPreviewModeEnabled = () => {
	console.log("Preview mode status:", previewModeEnabled);
	return previewModeEnabled;
};

// Fetch feed data from a list of FIDs through our proxy
export const fetchFeed = async (
	fids: number[],
	limit: number = 20,
	sort: "latest" | "trending" | "popular" = "latest",
	showReplies: boolean = false,
): Promise<FeedResponse> => {
	console.log("fetchFeed called with previewMode:", previewModeEnabled);
	try {
		if (!fids || fids.length === 0) {
			throw new Error("No FIDs provided for feed");
		}

		// Use dummy data if preview mode is enabled
		if (previewModeEnabled) {
			console.log("Attempting to load local feed data from /feed-data.json");
			// Fetch the JSON file with dummy data
			try {
				const response = await fetch("/feed-data.json");
				console.log("Feed-data.json response status:", response.status);
				if (!response.ok) {
					throw new Error(`Failed to load preview data: ${response.status}`);
				}
				const data = await response.json();
				console.log("Successfully loaded preview data");
				return data;
			} catch (previewError) {
				console.error("Error loading preview data:", previewError);
				throw new Error("Failed to load feed data. Make sure feed-data.json is placed in the public folder.");
			}
		}

		console.log("Using API for feed data");
		const payload: FeedRequest = {
			fids,
			limit,
			sort,
			showReplies,
		};

		const apiBaseUrl = getApiBaseUrl();
		// Use our proxy endpoint to avoid CORS issues
		const encodedUrl = encodeURIComponent("https://auth.uno.fun/api/v2/feed");
		const url = `${apiBaseUrl}/api/proxy?url=${encodedUrl}`;
		
		console.log("Fetching feed from:", url);
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		console.log("API response status:", response.status);
		if (!response.ok) {
			throw new Error(`Feed API error: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Failed to fetch feed:", error);
		throw error;
	}
};
