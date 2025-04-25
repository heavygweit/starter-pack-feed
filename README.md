# Starter Pack Feed

A Farcaster mini app for collecting and managing Warpcast starter packs.

## Features

- Paste Warpcast starter pack URLs to save them
- View your saved starter packs across devices
- Remove saved packs from your collection
- View detailed information about each starter pack
- Cross-device persistence with Vercel KV

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
   - The pack is saved to Vercel KV using the user's Farcaster ID as the key
   - If Vercel KV is unavailable, falls back to localStorage

2. **Viewing Starter Packs**:
   - The app loads saved packs from Vercel KV based on the user's FID
   - Clicking on a pack takes users to its detail page
   - Packs are synchronized across all user devices via Vercel KV

3. **Pack Details**:
   - The app fetches pack data from the Warpcast API
   - Displays pack information and members list
   - Users can easily add or remove packs from their collection

## Cloudflare Tunnel for Testing

To test with a public URL, you can use a Cloudflare tunnel:

```bash
# In a new terminal
cloudflared tunnel --url http://localhost:5173
```

## Deployment on Vercel

This app is designed to be deployed on Vercel with Vercel KV for cross-device data persistence.

For detailed instructions on deployment, see the [DEPLOYMENT.md](./DEPLOYMENT.md) file.

### Quick Deployment Steps

1. Push your repository to GitHub
2. Import the repository in the Vercel dashboard
3. Configure with the following settings:
   - Framework: Vite
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`
4. After initial deployment, set up Vercel KV from the Storage tab
5. Redeploy to apply the KV database configuration

### Environment Variables

The following environment variables are automatically set by Vercel when creating a KV database:
- `KV_REST_API_URL`: URL endpoint for the Vercel KV REST API
- `KV_REST_API_TOKEN`: Authentication token for the Vercel KV REST API

### Cross-Device Data Persistence

With Vercel KV, users' saved starter packs will be stored server-side and associated with their Farcaster ID (FID), enabling access to the same saved packs across all their devices. The app uses:

1. Farcaster Frame SDK to get the user's FID
2. Vercel KV to store saved packs by FID
3. Fallback to localStorage if the API is unavailable