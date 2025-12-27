import { Download, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type DownloadStatus = 'downloading' | 'processing' | 'completed' | 'failed';

interface StatusBadgeProps {
  status: DownloadStatus;
}

const statusConfig: Record<DownloadStatus, {
  label: string;
  icon: typeof Download;
  className: string;
  iconClassName: string;
}> = {
  downloading: {
    label: 'Downloading',
    icon: Download,
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    iconClassName: 'text-blue-600 dark:text-blue-400 animate-pulse',
  },
  processing: {
    label: 'Processing',
    icon: Loader2,
    className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    iconClassName: 'text-purple-600 dark:text-purple-400 animate-spin',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    iconClassName: 'text-green-600 dark:text-green-400',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    iconClassName: 'text-red-600 dark:text-red-400',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        config.className
      )}
    >
      <Icon className={cn('w-3 h-3', config.iconClassName)} />
      <span>{config.label}</span>
    </div>
  );
}
