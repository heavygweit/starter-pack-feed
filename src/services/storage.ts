// src/services/storage.ts
import { StarterPack } from './api';

const SAVED_PACKS_KEY = 'savedStarterPacks';

export const getSavedPacks = (): StarterPack[] => {
  const saved = localStorage.getItem(SAVED_PACKS_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const saveStarterPack = (pack: StarterPack): void => {
  const savedPacks = getSavedPacks();

  // Check if already saved
  if (!savedPacks.find((p: StarterPack) => p.id === pack.id)) {
    const updatedPacks = [...savedPacks, pack];
    localStorage.setItem(SAVED_PACKS_KEY, JSON.stringify(updatedPacks));
  }
};

export const removeStarterPack = (packId: string): void => {
  const savedPacks = getSavedPacks();
  const updatedPacks = savedPacks.filter((p: StarterPack) => p.id !== packId);
  localStorage.setItem(SAVED_PACKS_KEY, JSON.stringify(updatedPacks));
};

export const isPackSaved = (packId: string): boolean => {
  const savedPacks = getSavedPacks();
  return savedPacks.some((p: StarterPack) => p.id === packId);
};