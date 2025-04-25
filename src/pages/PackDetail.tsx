import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchStarterPackData } from '../services/api';

const PackDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [packData, setPackData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('No pack ID provided');
      setLoading(false);
      return;
    }

    const loadPackData = async () => {
      try {
        setLoading(true);
        const data = await fetchStarterPackData(id);
        setPackData(data);
      } catch (err) {
        console.error('Error loading pack data:', err);
        setError('Failed to load starter pack data');
      } finally {
        setLoading(false);
      }
    };

    loadPackData();
  }, [id]);

  const handleBackClick = () => {
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading starter pack data...</div>;
  }

  if (error || !packData) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error || 'Failed to load starter pack'}</p>
        <button onClick={handleBackClick}>Back to Home</button>
      </div>
    );
  }

  // To be implemented: Display the actual feed
  // For now, just show placeholder content
  return (
    <div className="pack-detail-page">
      <div className="pack-header">
        <button className="back-button" onClick={handleBackClick}>
          ← Back
        </button>
        <h1>Starter Pack: {id}</h1>
      </div>

      <div className="pack-info">
        <p>Feed implementation to come in future update</p>
        
        <div className="member-count">
          {packData.members?.length || 0} members
        </div>
      </div>
    </div>
  );
};

export default PackDetail;