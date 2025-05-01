import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StarterPackList from '../components/StarterPackList';
import AddStarterPack from '../components/AddStarterPack';

const Home: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  const handlePackAdded = () => {
    // Trigger a refresh of the starter pack list
    setRefreshKey(prev => prev + 1);
  };

  const handleNavigateToPreview = () => {
    navigate('/preview-feed');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <AddStarterPack onPackAdded={handlePackAdded} />
        <button 
          onClick={handleNavigateToPreview}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-purple-600 text-white hover:bg-purple-700"
        >
          Preview Feed
        </button>
      </div>
      <StarterPackList key={refreshKey} />
    </div>
  );
};

export default Home;