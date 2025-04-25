import React, { useState } from 'react';
import StarterPackList from '../components/StarterPackList';
import AddStarterPack from '../components/AddStarterPack';

const Home: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePackAdded = () => {
    // Trigger a refresh of the starter pack list
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="home-page">
      <AddStarterPack onPackAdded={handlePackAdded} />
      <div className="divider"></div>
      <StarterPackList key={refreshKey} />
    </div>
  );
};

export default Home;