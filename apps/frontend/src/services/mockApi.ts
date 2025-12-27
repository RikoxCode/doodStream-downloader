import { ActiveDownload, StatsResponse, StartDownloadRequest } from './api';

let mockDownloads: ActiveDownload[] = [
  {
    id: '1',
    url: 'https://doodstream.com/e/abc123',
    filename: 'video1.mp4',
    progress: 45,
    speed: 2.5,
    eta: 120,
    status: 'downloading',
    containerId: 'doodozer-1',
    metadata: { category: 'Movies' },
  },
  {
    id: '2',
    url: 'https://doodstream.com/e/xyz789',
    filename: 'video2.mp4',
    progress: 78,
    speed: 5.2,
    eta: 60,
    status: 'downloading',
    containerId: 'doodozer-2',
    metadata: { category: 'Series', tags: 'action, thriller' },
  },
  {
    id: '3',
    url: 'https://doodstream.com/e/def456',
    filename: 'video3.mp4',
    progress: 100,
    speed: 0,
    eta: 0,
    status: 'completed',
    containerId: 'doodozer-3',
    metadata: { category: 'Documentaries' },
  },
];

export const mockApi = {
  async startDownload(data: StartDownloadRequest): Promise<ActiveDownload> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newDownload: ActiveDownload = {
      id: Math.random().toString(36).substr(2, 9),
      url: data.url,
      filename: data.filename || `video_${Date.now()}.mp4`,
      progress: 0,
      speed: 0,
      eta: 300,
      status: 'downloading',
      containerId: `doodozer-${Math.random().toString(36).substr(2, 6)}`,
      metadata: data.metadata,
    };

    mockDownloads.push(newDownload);
    return newDownload;
  },

  async getActiveDownloads(): Promise<ActiveDownload[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockDownloads.filter((d) => d.status !== 'completed');
  },

  async stopDownload(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    mockDownloads = mockDownloads.filter((d) => d.id !== id);
  },

  async getStats(): Promise<StatsResponse> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return {
      activeDownloads: mockDownloads.filter((d) => d.status === 'downloading').length,
      queuedDownloads: 2,
      completedToday: 5,
    };
  },

  updateProgress() {
    mockDownloads = mockDownloads.map((download) => {
      if (download.status === 'downloading' && download.progress < 100) {
        const increment = Math.random() * 5;
        const newProgress = Math.min(100, download.progress + increment);
        const newEta = Math.max(0, download.eta - 10);
        const newSpeed = Math.max(0, download.speed + (Math.random() - 0.5) * 2);

        return {
          ...download,
          progress: newProgress,
          eta: newEta,
          speed: newSpeed,
          status: newProgress >= 100 ? 'completed' : 'downloading',
        };
      }
      return download;
    });
  },
};
