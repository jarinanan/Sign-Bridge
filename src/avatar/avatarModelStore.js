import { create } from 'zustand';

const STORAGE_KEY = 'signbridge-avatar-url';

// Migrate users who stored an old model URL — redirect them to the default.
const STALE_URLS = new Set([
  '/remy.lite.glb', '/remy.opt.glb', '/remy.glb',
  '/model.xbot.glb', '/model.rpm.glb', '/model.glb',
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
