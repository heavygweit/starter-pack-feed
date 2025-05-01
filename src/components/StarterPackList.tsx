import { useState, useEffect } from 'react';
import StarterPackCard from './StarterPackCard';
import { getSavedPacks, type StarterPack } from '../services/api';

const StarterPackList: React.FC = () => {
  const [savedPacks, setSavedPacks] = useState<StarterPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageMessage, setStorageMessage] = useState<string>('');

  const loadSavedPacks = async () => {
    try {
      const data = await getSavedPacks();
      setSavedPacks(data.packs);
      setStorageMessage(data.message);
    } catch (error) {
      console.error('Error loading saved packs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedPacks();
  }, []);

  const handlePackRemoved = () => {
    // Reload the list when a pack is removed
    loadSavedPacks();
  };

  if (loading) {
    return <div className="text-center py-6">Loading saved packs...</div>;
  }

  if (savedPacks.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center shadow">
        <h2 className="text-xl text-indigo-600 mb-2">No Saved Starter Packs</h2>
        <p className="text-gray-600">Add a starter pack by pasting a URL above</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-stretch justify-center">

      {/* Storage mode indicator */}
      <div className={"text-stone-500 dark:text-stone-400 text-sm italic mb-4 text-center"}>
        {storageMessage}
      </div>

      {savedPacks.map(pack => (
        <StarterPackCard
          key={pack.id}
          pack={pack}
          onRemove={handlePackRemoved}
        />
      ))}
    </div>
  );
};

export default StarterPackList;