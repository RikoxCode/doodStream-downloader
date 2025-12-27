const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface StartDownloadRequest {
  url: string;
  filename?: string;
  metadata?: Record<string, string>;
}

export interface ActiveDownload {
  id: string;
  url: string;
  filename: string;
  progress: number;
  speed: number;
  eta: number;
  status: 'downloading' | 'processing' | 'completed' | 'failed';
  containerId: string;
  metadata?: Record<string, string>;
}

export interface StatsResponse {
  activeDownloads: number;
  queuedDownloads: number;
  completedToday: number;
}

export const api = {
  async startDownload(data: StartDownloadRequest): Promise<ActiveDownload> {
    const response = await fetch(`${API_BASE_URL}/downloads/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to start download');
    }

    return response.json();
  },

  async getActiveDownloads(): Promise<ActiveDownload[]> {
    const response = await fetch(`${API_BASE_URL}/downloads/active`);

    if (!response.ok) {
      throw new Error('Failed to fetch active downloads');
    }

    return response.json();
  },

  async stopDownload(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/downloads/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to stop download');
    }
  },

  async getStats(): Promise<StatsResponse> {
    const response = await fetch(`${API_BASE_URL}/stats`);

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    return response.json();
  },
};
