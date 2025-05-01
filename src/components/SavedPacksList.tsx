import { useEffect, useState } from 'react';
import { getSavedPacks, type StarterPack } from '../services/api';
import StarterPackCard from './StarterPackCard';

const SavedPacksList = () => {
  const [savedPacks, setSavedPacks] = useState<StarterPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        setLoading(true);
        const data = await getSavedPacks();
        setSavedPacks(data.packs);
      } catch (err) {
        console.error('Error loading saved packs:', err);
        setError('Failed to load saved packs');
      } finally {
        setLoading(false);
      }
    };

    fetchPacks();
  }, []);

  if (loading) {
    return <div className="saved-packs-loading">Loading your saved packs...</div>;
  }

  if (error) {
    return <div className="saved-packs-error">{error}</div>;
  }

  if (savedPacks.length === 0) {
    return (
      <div className="saved-packs-empty">
        <h2>No Saved Starter Packs</h2>
        <p>Start adding packs to see them here!</p>
      </div>
    );
  }

  const handleRemovePack = async () => {
    // Refresh the list after removing a pack
    try {
      const data = await getSavedPacks();
      setSavedPacks(data.packs);
    } catch (err) {
      console.error('Error refreshing packs:', err);
    }
  };

  return (
    <div className="saved-packs">
      <h2>Your Starter Packs</h2>

      {/* Storage mode indicator
      <div className={"border-stone-200 dark:border-stone-800 text-black dark:text-white"}>
        <span>
          {storageMode === 'cross-device' ? '🔄' : '📱'}
        </span>
        <span className="storage-message">{storageMessage}</span>
      </div> */}

      {savedPacks.map(pack => (
        <StarterPackCard
          key={pack.id}
          pack={pack}
          onRemove={handleRemovePack}
        />
      ))}
    </div>
  );
};

export default SavedPacksList;