import { useState } from 'react';
import { extractPackIdFromUrl, saveStarterPack } from '../services/api';

interface AddStarterPackProps {
  onPackAdded: () => void;
}

const AddStarterPack: React.FC<AddStarterPackProps> = ({ onPackAdded }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setError(null);
    setSuccess(null);
    
    // Auto-save when a URL is pasted
    if (newUrl.includes('warpcast.com') && newUrl.includes('/pack/')) {
      // Detect paste event by checking if the URL suddenly changed to a complete URL
      if (newUrl.length > url.length + 10) {
        // This looks like a paste event with a complete URL
        handleSavePack(newUrl);
      }
    }
  };

  // Extracted the save pack logic to a separate function
  const handleSavePack = async (packUrl: string) => {
    if (!packUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!packUrl.includes('warpcast.com')) {
      setError('Please enter a valid Warpcast starter pack URL');
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      // Extract the pack ID from the URL
      const packId = extractPackIdFromUrl(packUrl);
      
      if (!packId) {
        setError('Could not extract starter pack ID from URL');
        setIsAdding(false);
        return;
      }

      // Extract creator username
      const regex = /warpcast\.com\/([^\/]+)\/pack/;
      const match = packUrl.match(regex);
      const creator = match ? match[1] : undefined;

      // Save the starter pack
      const success = await saveStarterPack({
        id: packId,
        url: packUrl,
        creator: creator
      });

      if (success) {
        setUrl('');
        onPackAdded();
        // Show success message with pack details
        const packName = creator ? `${creator}'s pack` : 'Starter pack';
        setSuccess(`${packName} saved successfully!`);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSavePack(url);
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
            onPaste={(e) => {
              // Get pasted text from clipboard
              const pastedText = e.clipboardData.getData('text');
              if (pastedText.includes('warpcast.com') && pastedText.includes('/pack/')) {
                // This is a paste event with a valid-looking URL
                // We'll let handleUrlChange handle it when the input value updates
                setTimeout(() => {
                  // Small delay to ensure the input value is updated
                  if (!isAdding) {
                    handleSavePack(pastedText);
                  }
                }, 100);
              }
            }}
            placeholder="Paste Warpcast starter pack URL"
            disabled={isAdding}
          />
          <button type="submit" disabled={isAdding}>
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </form>
      <div className="sample-url">
        <small>Example: https://warpcast.com/erica/pack/gaycoinz-db07ti</small>
      </div>
    </div>
  );
};

export default AddStarterPack;