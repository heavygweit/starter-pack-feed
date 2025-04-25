import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSavedPacks, StarterPack } from '../services/api';
import StarterPackCard from './StarterPackCard';

const SavedPacksList = () => {
  const [savedPacks, setSavedPacks] = useState<StarterPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        setLoading(true);
        const packs = await getSavedPacks();
        setSavedPacks(packs);
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
        <p>Start saving packs to see them here!</p>
        <Link to="/">Browse Starter Packs</Link>
      </div>
    );
  }

  const handleRemovePack = async () => {
    // Refresh the list after removing a pack
    try {
      const packs = await getSavedPacks();
      setSavedPacks(packs);
    } catch (err) {
      console.error('Error refreshing packs:', err);
    }
  };

  return (
    <div className="saved-packs">
      <h2>Your Saved Starter Packs</h2>
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