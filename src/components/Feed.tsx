import React, { useEffect, useState } from 'react';
import { Cast } from '../services/types';
import { fetchFeed, isPreviewModeEnabled } from '../services/api';
import CastItem from './CastItem';

interface FeedProps {
  fids: number[];
  limit?: number;
  sort?: 'latest' | 'trending' | 'popular';
  showReplies?: boolean;
}

const Feed: React.FC<FeedProps> = ({
  fids,
  limit = 20,
  sort = 'latest',
  showReplies = false
}) => {
  const [casts, setCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Feed component - isPreviewModeEnabled:", isPreviewModeEnabled());
    console.log("Feed component - fids:", fids);

    const loadFeed = async () => {
      if (!fids || fids.length === 0) {
        setError('No FIDs provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const isPreviewMode = isPreviewModeEnabled();
        console.log("Feed component - preview mode:", isPreviewMode);

        // If we're on the preview page, directly load the local data
        if (window.location.pathname === '/preview') {
          console.log("Feed component - on preview route, directly loading local data");
          try {
            const response = await fetch("/feed-data.json");
            console.log("Local feed-data.json response status:", response.status);
            if (!response.ok) {
              throw new Error(`Failed to load preview data: ${response.status}`);
            }
            const data = await response.json();
            console.log("Successfully loaded local feed data");

            if (data && data.success && data.data && data.data.items) {
              console.log("Feed component - setting casts from local data, count:", data.data.items.length);
              setCasts(data.data.items);
            } else {
              throw new Error('Invalid feed data in feed-data.json');
            }
          } catch (localError) {
            console.error("Error loading local feed data:", localError);
            setError('Failed to load local feed data. Make sure feed-data.json is in the public folder.');
          }
        } else {
          // Normal API flow for non-preview pages
          console.log("Feed component - calling fetchFeed with preview mode:", isPreviewMode);
          const feedData = await fetchFeed(fids, limit, sort, showReplies);
          console.log("Feed component - received feedData:", feedData ? "Data received" : "No data");

          if (feedData && feedData.success && feedData.data && feedData.data.items) {
            console.log("Feed component - setting casts, count:", feedData.data.items.length);
            setCasts(feedData.data.items);
          } else {
            console.error("Feed component - invalid feed data:", feedData);
            throw new Error('Invalid feed data received');
          }
        }
      } catch (err) {
        console.error('Error loading feed:', err);
        setError('Failed to load feed');
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [fids, limit, sort, showReplies]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading feed...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (casts.length === 0) {
    return <div className="text-center py-8 text-gray-500">No casts found</div>;
  }

  return (
    <div className="flex flex-col gap-4 my-5">
      {casts.map(cast => (
        <CastItem key={cast.hash} cast={cast} />
      ))}
    </div>
  );
};

export default Feed;