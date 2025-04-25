import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchStarterPackData } from '../services/api';
import Feed from '../components/Feed';

const PackDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [packData, setPackData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'popular'>('latest');
  const [showReplies, setShowReplies] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('No pack ID provided');
      setLoading(false);
      return;
    }

    const loadPackData = async () => {
      try {
        setLoading(true);
        const data = await fetchStarterPackData(id);
        setPackData(data);
      } catch (err) {
        console.error('Error loading pack data:', err);
        setError('Failed to load starter pack data');
      } finally {
        setLoading(false);
      }
    };

    loadPackData();
  }, [id]);

  const handleBackClick = () => {
    navigate('/');
  };

  // Extract FIDs from the pack members
  const getFids = (): number[] => {
    if (!packData || !packData.result || !packData.result.members) {
      return [];
    }
    
    return packData.result.members.map((member: { fid: number }) => member.fid);
  };

  if (loading) {
    return <div className="loading">Loading starter pack data...</div>;
  }

  if (error || !packData) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error || 'Failed to load starter pack'}</p>
        <button onClick={handleBackClick}>Back to Home</button>
      </div>
    );
  }

  const fids = getFids();
  const packName = packData.result?.starterpack?.name || `Starter Pack: ${id}`;
  const packDescription = packData.result?.starterpack?.description || 'A collection of profiles to follow';
  const memberCount = fids.length;

  return (
    <div className="pack-detail-page">
      <div className="pack-header">
        <button className="back-button" onClick={handleBackClick}>
          ← Back
        </button>
        <h1>{packName}</h1>
      </div>

      <div className="pack-info">
        <p>{packDescription}</p>
        <div className="member-count">
          {memberCount} members
        </div>
      </div>

      {/* Feed Controls */}
      <div className="feed-controls">
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value as 'latest' | 'trending' | 'popular')}
        >
          <option value="latest">Latest</option>
          <option value="trending">Trending</option>
          <option value="popular">Popular</option>
        </select>
        
        <div className="toggle">
          <input 
            type="checkbox" 
            id="show-replies" 
            checked={showReplies} 
            onChange={(e) => setShowReplies(e.target.checked)}
          />
          <label htmlFor="show-replies">Show replies</label>
        </div>
      </div>

      {/* Display the feed */}
      {fids.length > 0 ? (
        <Feed 
          fids={fids} 
          sort={sortBy}
          showReplies={showReplies}
          limit={20}
        />
      ) : (
        <div className="empty-feed">This starter pack has no members</div>
      )}
    </div>
  );
};

export default PackDetail;