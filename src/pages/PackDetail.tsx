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
    return <div className="text-center py-8 text-black dark:text-white">Loading starter pack data...</div>;
  }

  if (error || !packData) {
    return (
      <div className="text-center mt-4">
        <p className="text-stone-500 dark:text-stone-400 mb-6">{error || 'Failed to load starter pack'}</p>
        <button
          className="bg-stone-950 text-white dark:bg-stone-50 dark:text-stone-950 px-4 py-2 rounded text-sm"
          onClick={handleBackClick}
        >
          Back to Home
        </button>
      </div>
    );
  }

  const fids = getFids();
  const packName = packData.result?.starterpack?.name || `Starter Pack: ${id}`;
  const packDescription = packData.result?.starterpack?.description || 'A collection of profiles to follow';
  const memberCount = fids.length;

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <div className="flex items-center mb-6">
        <button
          className="bg-transparent border-none text-indigo-600 text-sm cursor-pointer px-2 py-1 mr-4 hover:text-indigo-800"
          onClick={handleBackClick}
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold">{packName}</h1>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-gray-700 mb-4">{packDescription}</p>
        <div className="text-sm text-gray-500">
          {memberCount} members
        </div>
      </div>

      {/* Feed Controls */}
      <div className="my-5 flex gap-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'latest' | 'trending' | 'popular')}
          className="px-3 py-2 rounded border border-gray-300"
        >
          <option value="latest">Latest</option>
          <option value="trending">Trending</option>
          <option value="popular">Popular</option>
        </select>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="show-replies"
            checked={showReplies}
            onChange={(e) => setShowReplies(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="show-replies" className="text-sm">Show replies</label>
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
        <div className="text-center py-8 text-stone-500 dark:text-stone-400">This starter pack has no members</div>
      )}
    </div>
  );
};

export default PackDetail;