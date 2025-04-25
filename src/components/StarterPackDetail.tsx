import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getStarterPackById } from '../services/api';
import { saveStarterPack, removeStarterPack, isPackSaved } from '../services/storage';
import UserList from './UserList';

const StarterPackDetail = () => {
  const { id } = useParams();
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchPack = async () => {
      try {
        setLoading(true);
        const response = await getStarterPackById(id);
        setPack(response.result.starterpack);
        setSaved(isPackSaved(id));
      } catch (err) {
        setError('Failed to load starter pack');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPack();
    }
  }, [id]);

  const handleSaveToggle = () => {
    if (saved) {
      removeStarterPack(pack.id);
      setSaved(false);
    } else {
      saveStarterPack(pack);
      setSaved(true);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!pack) return <div>Starter pack not found</div>;

  return (
    <div className="starter-pack-detail">
      <h1>{pack.name}</h1>
      <div className="description">{pack.description}</div>

      <button onClick={handleSaveToggle}>
        {saved ? 'Remove from Saved' : 'Save Starter Pack'}
      </button>

      <div className="members-count">
        {pack.members.length} members
      </div>

      <h2>Members</h2>
      <UserList userIds={pack.members.map(member => member.fid)} />
    </div>
  );
};

export default StarterPackDetail;