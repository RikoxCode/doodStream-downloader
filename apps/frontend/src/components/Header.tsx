import { Download, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Stats } from '@/types/download';
import { formatSize } from '@/utils/formatters';

interface HeaderProps {
  stats: Stats;
}

export function Header({ stats }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Doodozer</h1>
              <p className="text-sm text-muted-foreground">Download Manager</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <StatItem label="Active" value={stats.activeDownloads} />
            <StatItem label="Queued" value={stats.queuedDownloads} />
            <StatItem label="Today" value={stats.completedToday} />
            <StatItem
              label="Total Size"
              value={`${formatSize(stats.totalSize * 1024)}`}
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-end">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-bold">{value}</span>
    </div>
  );
}
