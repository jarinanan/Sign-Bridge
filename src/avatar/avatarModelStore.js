import { create } from 'zustand';

const STORAGE_KEY = 'signbridge-avatar-url';

// Clear any previously stored model — Harry Potter is now the fixed model.
const STALE_URLS = new Set([
  '/remy.lite.glb', '/remy.opt.glb', '/remy.glb',
  '/model.glb', '/model.xbot.glb', '/model.rpm.glb',
]);

const getStoredUrl = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (STALE_URLS.has(v)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return v || null;
  } catch { return null; }
};

export const useAvatarModelStore = create((set) => ({
  modelUrl: getStoredUrl(),
  setModelUrl: (url) => {
    try { localStorage.setItem(STORAGE_KEY, url); } catch {}
    set({ modelUrl: url });
  },
  clearModelUrl: () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    set({ modelUrl: null });
  },
}));
