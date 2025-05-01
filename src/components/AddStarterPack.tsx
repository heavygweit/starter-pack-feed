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
    // Removed auto-save functionality
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
    <div className="flex flex-col items-center">
      <h2 className="text-black text-xl font-semibold align-middle mb-4 dark:text-white">Add a Starter Pack</h2>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2 items-center justify-center">
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="Paste starter pack URL"
            disabled={isAdding}
            className="flex-1 px-3 h-9 border border-stone-200 rounded text-sm dark:border-stone-800"
          />
          <button
            type="submit"
            disabled={isAdding}
            className="bg-stone-950 dark:bg-stone-50 text-white dark:text-stone-950 px-5 h-9 rounded font-medium disabled:bg-stone-500 disabled:cursor-not-allowed"
          >
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </div>
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
      </form>
    </div>
  );
};

export default AddStarterPack;