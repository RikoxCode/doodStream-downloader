import { useState } from 'react';
import { Plus, Download, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { validateDoodStreamUrl } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { MetadataField } from '@/types/download';

interface StartDownloadFormProps {
  onSubmit: (url: string, filename: string, metadata: Record<string, string>) => void;
}

export function StartDownloadForm({ onSubmit }: StartDownloadFormProps) {
  const [url, setUrl] = useState('');
  const [filename, setFilename] = useState('');
  const [showMetadata, setShowMetadata] = useState(false);
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addMetadataField = () => {
    setMetadataFields([...metadataFields, { key: '', value: '' }]);
  };

  const removeMetadataField = (index: number) => {
    setMetadataFields(metadataFields.filter((_, i) => i !== index));
  };

  const updateMetadataField = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...metadataFields];
    updated[index][field] = value;
    setMetadataFields(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateDoodStreamUrl(url)) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid DoodStream URL',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const metadata: Record<string, string> = {};
    metadataFields.forEach((field) => {
      if (field.key && field.value) {
        metadata[field.key] = field.value;
      }
    });

    onSubmit(url, filename, metadata);

    setTimeout(() => {
      setUrl('');
      setFilename('');
      setMetadataFields([]);
      setShowMetadata(false);
      setIsLoading(false);
      toast({
        title: 'Download Started',
        description: 'Your download has been added to the queue',
      });
    }, 500);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Start New Download</CardTitle>
        <CardDescription>Enter a DoodStream URL to begin downloading</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">DoodStream URL *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://doodstream.com/d/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="text-lg h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filename">Custom Filename (optional)</Label>
            <Input
              id="filename"
              type="text"
              placeholder="my-video.mp4"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
            />
          </div>

          {!showMetadata && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMetadata(true)}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Metadata
            </Button>
          )}

          {showMetadata && (
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-base">Custom Metadata</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMetadata(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {metadataFields.map((field, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Key"
                    value={field.key}
                    onChange={(e) => updateMetadataField(index, 'key', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={field.value}
                    onChange={(e) => updateMetadataField(index, 'value', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMetadataField(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMetadataField}
                className="w-full"
              >
                <Plus className="w-3 h-3 mr-2" />
                Add Field
              </Button>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            <Download className="w-5 h-5 mr-2" />
            {isLoading ? 'Starting...' : 'Start Download'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
