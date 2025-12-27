import { useEffect, useState } from 'react';
import { Download, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from './components/ui/button';
import { StartDownloadForm } from './components/StartDownloadForm';
import { DownloadCard } from './components/DownloadCard';
import { api, ActiveDownload, StatsResponse } from './services/api';
import { mockApi } from './services/mockApi';
import { useToast } from './hooks/use-toast';
import { Toaster } from './components/ui/toaster';

const USE_MOCK_API = false;

function App() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [downloads, setDownloads] = useState<ActiveDownload[]>([]);
  const [stats, setStats] = useState<StatsResponse>({
    activeDownloads: 0,
    queuedDownloads: 0,
    completedToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDownloads = async () => {
    try {
      const data = USE_MOCK_API
        ? await mockApi.getActiveDownloads()
        : await api.getActiveDownloads();
      setDownloads(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch downloads');
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const data = USE_MOCK_API
        ? await mockApi.getStats()
        : await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await fetchDownloads();
      await fetchStats();
      setIsLoading(false);
    };

    initialize();

    const downloadInterval = setInterval(fetchDownloads, 2000);
    const statsInterval = setInterval(fetchStats, 5000);

    if (USE_MOCK_API) {
      const progressInterval = setInterval(() => {
        mockApi.updateProgress();
      }, 2000);

      return () => {
        clearInterval(downloadInterval);
        clearInterval(statsInterval);
        clearInterval(progressInterval);
      };
    }

    return () => {
      clearInterval(downloadInterval);
      clearInterval(statsInterval);
    };
  }, []);

  const handleStartDownload = async (url: string, filename: string, metadata: Record<string, string>) => {
    try {
      const download = USE_MOCK_API
        ? await mockApi.startDownload({ url, filename, metadata })
        : await api.startDownload({ url, filename, metadata });

      setDownloads((prev) => [...prev, download]);

      toast({
        title: 'Download Started',
        description: `${download.filename} has been added to downloads`,
      });

      await fetchStats();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to start download',
        variant: 'destructive',
      });
      console.error(err);
    }
  };

  const handleStopDownload = async (id: string) => {
    try {
      USE_MOCK_API
        ? await mockApi.stopDownload(id)
        : await api.stopDownload(id);

      setDownloads((prev) => prev.filter((d) => d.id !== id));

      toast({
        title: 'Download Stopped',
        description: 'The download has been stopped and removed',
      });

      await fetchStats();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to stop download',
        variant: 'destructive',
      });
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Download className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-6">
                <StatItem label="Active" value={stats.activeDownloads} />
                <StatItem label="Queued" value={stats.queuedDownloads} />
                <StatItem label="Today" value={stats.completedToday} />
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Manage your DoodStream downloads</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <StartDownloadForm onSubmit={handleStartDownload} />

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5" />
            <h3 className="text-2xl font-bold">Active Downloads</h3>
            <span className="text-sm text-muted-foreground">({downloads.length})</span>
          </div>

          {downloads.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
              <Download className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground font-medium">No active downloads</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start a new download above to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {downloads.map((download) => (
                <DownloadCard
                  key={download.id}
                  download={download}
                  onStop={handleStopDownload}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Toaster />
    </div>
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

export default App;
