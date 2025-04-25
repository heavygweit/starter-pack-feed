// src/services/storage.ts
const SAVED_PACKS_KEY = 'savedStarterPacks';

export const getSavedPacks = () => {
  const saved = localStorage.getItem(SAVED_PACKS_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const saveStarterPack = (pack) => {
  const savedPacks = getSavedPacks();

  // Check if already saved
  if (!savedPacks.find(p => p.id === pack.id)) {
    const updatedPacks = [...savedPacks, pack];
    localStorage.setItem(SAVED_PACKS_KEY, JSON.stringify(updatedPacks));
  }
};

export const removeStarterPack = (packId) => {
  const savedPacks = getSavedPacks();
  const updatedPacks = savedPacks.filter(p => p.id !== packId);
  localStorage.setItem(SAVED_PACKS_KEY, JSON.stringify(updatedPacks));
};

export const isPackSaved = (packId) => {
  const savedPacks = getSavedPacks();
  return savedPacks.some(p => p.id === packId);
};