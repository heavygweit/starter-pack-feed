import React, { useEffect, useState } from 'react';
import { Cast } from '../services/types';
import { fetchFeed } from '../services/api';
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
    const loadFeed = async () => {
      if (!fids || fids.length === 0) {
        setError('No FIDs provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch feed data
        const feedData = await fetchFeed(fids, limit, sort, showReplies);
        
        if (feedData && feedData.success && feedData.data && feedData.data.items) {
          setCasts(feedData.data.items);
        } else {
          throw new Error('Invalid feed data received');
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
    return <div className="loading-feed">Loading feed...</div>;
  }

  if (error) {
    return <div className="feed-error">{error}</div>;
  }

  if (casts.length === 0) {
    return <div className="empty-feed">No casts found</div>;
  }

  return (
    <div className="feed-container">
      {casts.map(cast => (
        <CastItem key={cast.hash} cast={cast} />
      ))}
    </div>
  );
};

export default Feed;