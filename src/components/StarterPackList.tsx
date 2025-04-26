import { useState, useEffect } from 'react';
import StarterPackCard from './StarterPackCard';
import { getSavedPacks, StarterPack } from '../services/api';

const StarterPackList: React.FC = () => {
  const [savedPacks, setSavedPacks] = useState<StarterPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageMode, setStorageMode] = useState<'cross-device' | 'device-only'>('device-only');
  const [storageMessage, setStorageMessage] = useState<string>('');

  const loadSavedPacks = async () => {
    try {
      const data = await getSavedPacks();
      setSavedPacks(data.packs);
      setStorageMode(data.storageMode);
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
    return <div>Loading saved packs...</div>;
  }

  if (savedPacks.length === 0) {
    return (
      <div className="starter-pack-empty">
        <h2>No Saved Starter Packs</h2>
        <p>Add a starter pack by pasting a URL above</p>
      </div>
    );
  }

  return (
    <div className="starter-pack-list">
      <h2>Your Saved Starter Packs</h2>
      
      {/* Storage mode indicator */}
      <div className={`storage-mode-indicator ${storageMode}`}>
        <span className="storage-icon">
          {storageMode === 'cross-device' ? '🔄' : '📱'}
        </span>
        <span className="storage-message">{storageMessage}</span>
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