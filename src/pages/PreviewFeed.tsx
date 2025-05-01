import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Feed from '../components/Feed';
import { isPreviewModeEnabled, setPreviewMode } from '../services/api';

// Immediately set preview mode to true before component renders
console.log("PreviewFeed - Directly setting preview mode to true on module load");
setPreviewMode(true);

const PreviewFeed: React.FC = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'popular'>('latest');
  const [showReplies, setShowReplies] = useState(false);


  const handleBackClick = () => {
    navigate('/');
  };

  // Use dummy FIDs for preview - these don't matter since the feed-data.json will be used
  const previewFids = [20270, 15850, 3112, 7872]; // Sample FIDs

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          className="bg-transparent border-none text-indigo-600 text-sm cursor-pointer px-2 py-1 mr-4 hover:text-indigo-800"
          onClick={handleBackClick}
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold">Preview Feed</h1>
      </div>

      {/* Display the feed */}
      <Feed
        fids={previewFids}
        sort={sortBy}
        showReplies={showReplies}
        limit={20}
      />
    </div>
  );
};

export default PreviewFeed;