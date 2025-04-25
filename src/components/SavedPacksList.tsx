import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSavedPacks } from '../services/storage';
import StarterPackCard from './StarterPackCard';
import { StarterPack } from '../services/api';

const SavedPacksList = () => {
  const [savedPacks, setSavedPacks] = useState<StarterPack[]>([]);

  useEffect(() => {
    const packs = getSavedPacks();
    setSavedPacks(packs);
  }, []);

  if (savedPacks.length === 0) {
    return (
      <div className="saved-packs-empty">
        <h2>No Saved Starter Packs</h2>
        <p>Start saving packs to see them here!</p>
        <Link to="/">Browse Starter Packs</Link>
      </div>
    );
  }

  return (
    <div className="saved-packs">
      <h2>Your Saved Starter Packs</h2>
      {savedPacks.map(pack => (
        <StarterPackCard key={pack.id} pack={pack} />
      ))}
    </div>
  );
};

export default SavedPacksList;