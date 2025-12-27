import { QueueItem } from '@/types/download';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import { truncateUrl } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface QueueSectionProps {
  queue: QueueItem[];
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onRemove: (id: string) => void;
}

const priorityConfig = {
  high: { label: 'High', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
  normal: { label: 'Normal', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  low: { label: 'Low', className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20' },
};

export function QueueSection({ queue, onMoveUp, onMoveDown, onRemove }: QueueSectionProps) {
  if (queue.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">No downloads in queue</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {queue.map((item, index) => (
        <Card key={item.id} className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted font-bold text-lg">
                #{item.position}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{item.filename}</h4>
                <p className="text-sm text-muted-foreground truncate" title={item.url}>
                  {truncateUrl(item.url, 50)}
                </p>
              </div>

              <Badge
                variant="outline"
                className={cn('border', priorityConfig[item.priority].className)}
              >
                {priorityConfig[item.priority].label}
              </Badge>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onMoveUp(item.id)}
                  disabled={index === 0}
                  className="h-8 w-8"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onMoveDown(item.id)}
                  disabled={index === queue.length - 1}
                  className="h-8 w-8"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(item.id)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
