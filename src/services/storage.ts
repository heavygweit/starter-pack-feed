// src/services/storage.ts
import { StarterPack, StorageInfo } from './api';

const SAVED_PACKS_KEY = 'savedStarterPacks';

export const getSavedPacks = (): StorageInfo => {
  const saved = localStorage.getItem(SAVED_PACKS_KEY);
  const packs = saved ? JSON.parse(saved) : [];
  
  return {
    packs,
    storageMode: 'device-only',
    message: 'Your packs are only saved on this device'
  };
};

export const saveStarterPack = (pack: StarterPack): void => {
  const savedPacksInfo = getSavedPacks();
  const savedPacks = savedPacksInfo.packs;

  // Check if already saved
  if (!savedPacks.find((p: StarterPack) => p.id === pack.id)) {
    const updatedPacks = [...savedPacks, pack];
    localStorage.setItem(SAVED_PACKS_KEY, JSON.stringify(updatedPacks));
  }
};

export const removeStarterPack = (packId: string): void => {
  const savedPacksInfo = getSavedPacks();
  const savedPacks = savedPacksInfo.packs;
  const updatedPacks = savedPacks.filter((p: StarterPack) => p.id !== packId);
  localStorage.setItem(SAVED_PACKS_KEY, JSON.stringify(updatedPacks));
};

export const isPackSaved = (packId: string): boolean => {
  const savedPacksInfo = getSavedPacks();
  return savedPacksInfo.packs.some((p: StarterPack) => p.id === packId);
};