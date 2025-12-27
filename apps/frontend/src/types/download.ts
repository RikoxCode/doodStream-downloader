export type DownloadStatus = 'queued' | 'downloading' | 'processing' | 'completed' | 'failed';
export type Priority = 'high' | 'normal' | 'low';

export interface Download {
  id: string;
  url: string;
  filename: string;
  progress: number;
  speed: number;
  eta: number;
  status: DownloadStatus;
  containerId: string;
  metadata: Record<string, string>;
  startedAt: Date;
  completedAt?: Date;
  size?: number;
  errorMessage?: string;
}

export interface QueueItem {
  id: string;
  url: string;
  filename: string;
  priority: Priority;
  position: number;
  metadata: Record<string, string>;
}

export interface Stats {
  activeDownloads: number;
  queuedDownloads: number;
  completedToday: number;
  totalSize: number;
  averageSpeed: number;
  successRate: number;
}

export interface Settings {
  maxConcurrentDownloads: number;
  defaultDownloadPath: string;
  autoRetryFailed: boolean;
  notifications: boolean;
  theme: 'light' | 'dark';
}

export interface MetadataField {
  key: string;
  value: string;
}
