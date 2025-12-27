import { create } from 'zustand';
import { Download, QueueItem, Settings } from '@/types/download';

interface DownloadStore {
  downloads: Download[];
  queue: QueueItem[];
  completedDownloads: Download[];
  settings: Settings;

  addDownload: (download: Omit<Download, 'id' | 'startedAt'>) => void;
  updateDownload: (id: string, updates: Partial<Download>) => void;
  removeDownload: (id: string) => void;
  completeDownload: (id: string) => void;

  addToQueue: (item: Omit<QueueItem, 'id' | 'position'>) => void;
  removeFromQueue: (id: string) => void;
  moveQueueItem: (id: string, direction: 'up' | 'down') => void;

  updateSettings: (updates: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  maxConcurrentDownloads: 3,
  defaultDownloadPath: '/downloads',
  autoRetryFailed: true,
  notifications: true,
  theme: 'dark',
};

export const useDownloadStore = create<DownloadStore>((set) => ({
  downloads: [],
  queue: [],
  completedDownloads: [],
  settings: defaultSettings,

  addDownload: (download) => set((state) => ({
    downloads: [
      ...state.downloads,
      {
        ...download,
        id: Math.random().toString(36).substr(2, 9),
        startedAt: new Date(),
      },
    ],
  })),

  updateDownload: (id, updates) => set((state) => ({
    downloads: state.downloads.map((d) =>
      d.id === id ? { ...d, ...updates } : d
    ),
  })),

  removeDownload: (id) => set((state) => ({
    downloads: state.downloads.filter((d) => d.id !== id),
  })),

  completeDownload: (id) => set((state) => {
    const download = state.downloads.find((d) => d.id === id);
    if (!download) return state;

    const completedDownload = {
      ...download,
      status: 'completed' as const,
      progress: 100,
      completedAt: new Date(),
    };

    return {
      downloads: state.downloads.filter((d) => d.id !== id),
      completedDownloads: [completedDownload, ...state.completedDownloads],
    };
  }),

  addToQueue: (item) => set((state) => ({
    queue: [
      ...state.queue,
      {
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        position: state.queue.length + 1,
      },
    ],
  })),

  removeFromQueue: (id) => set((state) => ({
    queue: state.queue
      .filter((q) => q.id !== id)
      .map((q, index) => ({ ...q, position: index + 1 })),
  })),

  moveQueueItem: (id, direction) => set((state) => {
    const index = state.queue.findIndex((q) => q.id === id);
    if (index === -1) return state;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= state.queue.length) return state;

    const newQueue = [...state.queue];
    [newQueue[index], newQueue[newIndex]] = [newQueue[newIndex], newQueue[index]];

    return {
      queue: newQueue.map((q, i) => ({ ...q, position: i + 1 })),
    };
  }),

  updateSettings: (updates) => set((state) => ({
    settings: { ...state.settings, ...updates },
  })),
}));
