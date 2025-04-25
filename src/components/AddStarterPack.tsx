import React, { useState } from 'react';
import { extractPackIdFromUrl, saveStarterPack } from '../services/api';

interface AddStarterPackProps {
  onPackAdded: () => void;
}

const AddStarterPack: React.FC<AddStarterPackProps> = ({ onPackAdded }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!url.includes('warpcast.com')) {
      setError('Please enter a valid Warpcast starter pack URL');
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      // Extract the pack ID from the URL
      const packId = extractPackIdFromUrl(url);
      
      if (!packId) {
        setError('Could not extract starter pack ID from URL');
        setIsAdding(false);
        return;
      }

      // Extract creator username
      const regex = /warpcast\.com\/([^\/]+)\/pack/;
      const match = url.match(regex);
      const creator = match ? match[1] : undefined;

      // Save the starter pack
      const success = await saveStarterPack({
        id: packId,
        url: url,
        creator: creator
      });

      if (success) {
        setUrl('');
        onPackAdded();
      } else {
        setError('This starter pack has already been saved');
      }
    } catch (error) {
      console.error('Error adding starter pack:', error);
      setError('Failed to add starter pack');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="add-starter-pack">
      <h2>Add a Starter Pack</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="Paste Warpcast starter pack URL"
            disabled={isAdding}
          />
          <button type="submit" disabled={isAdding}>
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </form>
      <div className="sample-url">
        <small>Example: https://warpcast.com/erica/pack/gaycoinz-db07ti</small>
      </div>
    </div>
  );
};

export default AddStarterPack;