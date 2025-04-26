// src/services/types.ts - Type definitions for the app

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

// Cast API Response Types - Converted from Swift models

export interface Cast {
  hash: string;
  timestamp: number;
  fid?: number;
  text?: string;
  embeds?: Embeds;
  mentions?: Mention[];
  
  // Metadata fields
  topics?: string[];
  isNsfw?: boolean;
  visibility?: string;
  type?: number;
  
  // Relationship fields
  parentFid?: number;
  parentHash?: string;
  rootParentHash?: string;
  parentUrl?: string;
  rootParentUrl?: string;
  rootParentFid?: number;
  
  // Thread metadata
  threadMetadata?: ThreadMetadata;
  
  // Channel information
  channel?: Channel;
  
  // API compatibility fields
  likes?: number;
  recasts?: number;
  quotes?: number;
  
  // Enriched context fields
  author?: Author;
  context?: CastContext;
  counts?: Counts;
}

export interface Author {
  fid: number;
  username?: string;
  displayName?: string;
  bio?: string;
  pfpUrl?: string;
  url?: string;
  location?: string;
  context?: AuthorContext;
}

export interface AuthorContext {
  following: boolean;
  follow: boolean;
}

export interface Channel {
  id: string;
  url: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export interface CastContext {
  liked: boolean;
  recasted: boolean;
  quotes: boolean;
}

export interface Counts {
  likes?: number;
  recasts?: number;
  quotes?: number;
  replies?: number;
}

export interface Mention {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

export interface ThreadMetadata {
  depth: number;
  threadTime: string;
  pathTimestamps: number[];
}

export interface Embeds {
  images?: ImageEmbed[];
  urls?: UrlEmbed[];
  videos?: VideoEmbed[];
  frames?: FrameEmbed[];
  casts?: Cast[];
  castHashes?: string[];
}

export interface ImageDimensions {
  width: number;
  height: number;
  size?: number;
  format?: string;
  contentType?: string;
  blurhash?: string;
}

export interface ImageEmbed {
  type: string;
  url: string;
  title?: string;
  dimensions?: ImageDimensions;
}

export interface UrlEmbed {
  type: string;
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
}

export interface VideoEmbed {
  type: string;
  url: string;
  dimensions?: VideoDimensions;
}

export interface VideoDimensions {
  size: number;
  isHLS: boolean;
  width: number;
  format: string;
  height: number;
  duration: number;
  contentType: string;
  fps: number;
  codec: string;
  bitrate: number;
  blurhash?: string;
  thumbnail?: string;
}

export interface FrameEmbed {
  type: string;
  url: string;
  frame?: FrameContent;
}

export interface FrameContent {
  image?: string;
  version: string;
  buttons?: FrameButton[];
  post_url?: string;
  aspect_ratio?: string;
}

export interface FrameButton {
  label: string;
  action: string;
  target?: string;
}

export interface FeedRequest {
  fids: number[];
  limit?: number;
  sort?: 'latest' | 'trending' | 'popular';
  showReplies?: boolean;
}

export interface FeedResponse {
  success: boolean;
  data: {
    items: Cast[];
    nextCursor?: string;
  };
}