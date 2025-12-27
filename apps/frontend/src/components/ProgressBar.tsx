import { cn } from '@/lib/utils';

type DownloadStatus = 'downloading' | 'processing' | 'completed' | 'failed';

interface ProgressBarProps {
  progress: number;
  status: DownloadStatus;
}

const statusColors: Record<DownloadStatus, string> = {
  downloading: 'bg-gradient-to-r from-blue-500 to-blue-600',
  processing: 'bg-gradient-to-r from-purple-500 to-purple-600',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
};

export function ProgressBar({ progress, status }: ProgressBarProps) {
  const isAnimated = status === 'downloading' || status === 'processing';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground font-medium">Progress</span>
        <span className="font-semibold text-foreground">{progress}%</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out',
            statusColors[status],
            isAnimated && 'animate-pulse'
          )}
          style={{ width: `${progress}%` }}
        >
          {isAnimated && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
              style={{
                backgroundSize: '200% 100%',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
