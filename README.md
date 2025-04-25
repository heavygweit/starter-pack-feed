# Starter Pack Explorer

A Farcaster mini app for exploring and following starter packs.

## Features

- Paste Warpcast starter pack URLs to save them
- View your saved starter packs
- Remove saved packs
- View specific starter pack details

## Development Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will run on http://localhost:5173.

## Accessing Public Warpcast API

This app directly accesses the public Warpcast API endpoints:

1. Starter Pack Member List: `https://api.warpcast.com/fc/starter-pack-members?id={id}`
2. User Profile (optional): `https://api.warpcast.com/fc/user/{username}`

These endpoints don't require authentication and can be called directly from the client.

## How It Works

1. **Adding Starter Packs**:
   - Users paste a Warpcast starter pack URL (e.g., https://warpcast.com/erica/pack/gaycoinz-db07ti)
   - The app extracts the pack ID and creator from the URL
   - The pack is saved to local storage

2. **Viewing Starter Packs**:
   - The app loads saved packs from local storage
   - Clicking on a pack takes users to its detail page

3. **Pack Details**:
   - The app fetches pack data from the Warpcast API
   - Displays pack information and members list
   - The feed implementation will be added in a future update

## Cloudflare Tunnel for Testing

To test with a public URL, you can use a Cloudflare tunnel:

```bash
# In a new terminal
cloudflared tunnel --url http://localhost:5173
```

## Deployment on Vercel

This app is designed to be deployed on Vercel with Vercel KV for cross-device data persistence.

### Prerequisites

1. Install the Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

### Deploy

1. Deploy to Vercel:
```bash
vercel
```

2. During deployment, Vercel will ask to create a new KV database. Confirm to create one.

3. Once deployed, your app will be available at a Vercel-generated URL.

### Environment Variables

The following environment variables need to be set in your Vercel project:
- `KV_REST_API_URL`: Automatically set by Vercel when creating a KV database
- `KV_REST_API_TOKEN`: Automatically set by Vercel when creating a KV database

### Cross-Device Data Persistence

With Vercel KV, users' saved starter packs will be stored server-side and associated with their Farcaster ID (FID), enabling access to the same saved packs across all their devices. The app uses:

1. Farcaster Frame SDK to get the user's FID
2. Vercel KV to store saved packs by FID
3. Fallback to localStorage if the API is unavailable