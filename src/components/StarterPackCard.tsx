import React from 'react';
import { Link } from 'react-router-dom';
import { removeStarterPack } from '../services/api';

interface StarterPackCardProps {
  pack: {
    id: string;
    name?: string;
    url: string;
    creator?: string;
  };
  onRemove?: () => void;
}

const StarterPackCard: React.FC<StarterPackCardProps> = ({ pack, onRemove }) => {
  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) {
      await removeStarterPack(pack.id);
      onRemove();
    }
  };

  return (
    <Link to={`/pack/${pack.id}`} className="starter-pack-card-link">
      <div className="starter-pack-card">
        <div className="starter-pack-info">
          <h3>{pack.name || pack.id}</h3>
          {pack.creator && <p>Created by @{pack.creator}</p>}
        </div>
        <button 
          className="remove-button" 
          onClick={handleRemove}
          aria-label="Remove pack"
        >
          ×
        </button>
      </div>
    </Link>
  );
};

export default StarterPackCard;