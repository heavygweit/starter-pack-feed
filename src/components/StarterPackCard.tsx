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
    <Link to={`/pack/${pack.id}`} className="flex flex-1 items-center justify-center">
      <div className="border border-stone-200 dark:border-stone-800 rounded-lg p-4 mb-4 hover:-translate-y-0.5 transition cursor-pointer flex justify-between items-center max-w-[300px] flex-grow">
        <div className="flex-1">
          <h3 className="text-black dark:text-white font-semibold">{pack.name || pack.id}</h3>
          {pack.creator && <p className="text-sm text-stone-500 dark:text-stone-400">Created by @{pack.creator}</p>}
        </div>
        <button
          className="bg-transparent border-none text-md w-8 h-8 flex justify-center items-center rounded-full hover:bg-stone-200 dark:hover:bg-stone-800"
          onClick={handleRemove}
          aria-label="Remove pack"
        >
          🗑️
        </button>
      </div>
    </Link>
  );
};

export default StarterPackCard;