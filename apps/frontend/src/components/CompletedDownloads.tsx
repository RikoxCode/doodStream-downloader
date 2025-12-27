import { useState } from 'react';
import { Download } from '@/types/download';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Download as DownloadIcon } from 'lucide-react';
import { formatSize, formatTimestamp } from '@/utils/formatters';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CompletedDownloadsProps {
  downloads: Download[];
  onDownloadAgain: (url: string, metadata: Record<string, string>) => void;
}

export function CompletedDownloads({ downloads, onDownloadAgain }: CompletedDownloadsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Completed Downloads
              <Badge variant="secondary">{downloads.length}</Badge>
            </CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Show
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            {downloads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No completed downloads yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Filename</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Metadata</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {downloads.map((download) => (
                      <TableRow key={download.id}>
                        <TableCell className="font-medium">{download.filename}</TableCell>
                        <TableCell>{download.size ? formatSize(download.size) : 'N/A'}</TableCell>
                        <TableCell>
                          {download.completedAt
                            ? formatTimestamp(download.completedAt)
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(download.metadata).slice(0, 2).map(([key, value]) => (
                              <Badge key={key} variant="secondary" className="text-xs">
                                {value}
                              </Badge>
                            ))}
                            {Object.keys(download.metadata).length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{Object.keys(download.metadata).length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDownloadAgain(download.url, download.metadata)}
                          >
                            <DownloadIcon className="w-4 h-4 mr-2" />
                            Again
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
