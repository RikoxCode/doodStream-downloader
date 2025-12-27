import { useState } from 'react';
import { ActiveDownload } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';
import { StopCircle, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { formatSpeed, formatETA, truncateUrl } from '@/utils/formatters';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
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

interface DownloadCardProps {
  download: ActiveDownload;
  onStop: (id: string) => void;
}

export function DownloadCard({ download, onStop }: DownloadCardProps) {
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Container ID copied to clipboard',
    });
  };

  return (
    <Card className="transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate" title={download.filename}>
                {download.filename}
              </h3>
            </div>
            <p
              className="text-sm text-muted-foreground truncate"
              title={download.url}
            >
              {truncateUrl(download.url, 50)}
            </p>
          </div>
          <StatusBadge status={download.status} />
        </div>

        <ProgressBar progress={Math.round(download.progress)} status={download.status} />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Speed:</span>
            <span className="ml-2 font-medium">{formatSpeed(download.speed)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">ETA:</span>
            <span className="ml-2 font-medium">{formatETA(download.eta)}</span>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <span className="text-muted-foreground">Container:</span>
            <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
              {download.containerId}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => copyToClipboard(download.containerId)}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {download.metadata && Object.keys(download.metadata).length > 0 && (
          <Collapsible open={isMetadataOpen} onOpenChange={setIsMetadataOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                {isMetadataOpen ? (
                  <ChevronUp className="w-4 h-4 mr-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 mr-2" />
                )}
                {isMetadataOpen ? 'Hide' : 'Show'} Metadata
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(download.metadata).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-xs text-muted-foreground capitalize">{key}</span>
                    <Badge variant="secondary" className="mt-1 justify-start">
                      {value}
                    </Badge>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        <div className="flex gap-2 pt-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <StopCircle className="w-4 h-4 mr-2" />
                Stop Download
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Stop Download?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will stop the download and remove it from the active list. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onStop(download.id)}>
                  Stop Download
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
