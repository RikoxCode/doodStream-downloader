import { Settings } from '@/types/download';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Settings as SettingsIcon, Trash2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SettingsPanelProps {
  settings: Settings;
  onUpdateSettings: (updates: Partial<Settings>) => void;
  onClearHistory: () => void;
}

export function SettingsPanel({ settings, onUpdateSettings, onClearHistory }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <SettingsIcon className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Configure your download manager preferences
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-3">
            <Label htmlFor="max-downloads">
              Max Concurrent Downloads: {settings.maxConcurrentDownloads}
            </Label>
            <Slider
              id="max-downloads"
              min={1}
              max={10}
              step={1}
              value={[settings.maxConcurrentDownloads]}
              onValueChange={(value) =>
                onUpdateSettings({ maxConcurrentDownloads: value[0] })
              }
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Number of downloads that can run simultaneously
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="download-path">Default Download Path</Label>
            <Input
              id="download-path"
              type="text"
              value={settings.defaultDownloadPath}
              onChange={(e) =>
                onUpdateSettings({ defaultDownloadPath: e.target.value })
              }
              placeholder="/downloads"
            />
            <p className="text-xs text-muted-foreground">
              Default directory for downloaded files
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-retry">Auto-retry Failed Downloads</Label>
              <p className="text-xs text-muted-foreground">
                Automatically retry downloads that fail
              </p>
            </div>
            <Switch
              id="auto-retry"
              checked={settings.autoRetryFailed}
              onCheckedChange={(checked) =>
                onUpdateSettings({ autoRetryFailed: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Show desktop notifications for completed downloads
              </p>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) =>
                onUpdateSettings({ notifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="theme">Dark Mode</Label>
              <p className="text-xs text-muted-foreground">
                Toggle between light and dark theme
              </p>
            </div>
            <Switch
              id="theme"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>

          <div className="pt-6 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Download History?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all completed download records. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onClearHistory}>
                    Clear History
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
