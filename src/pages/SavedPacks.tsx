import React from 'react';
import SavedPacksList from '../components/SavedPacksList';

const SavedPacks = () => {
  return (
    <div className="saved-packs-page">
      <h1>Saved Starter Packs</h1>
      <SavedPacksList />
    </div>
  );
};

export default SavedPacks;