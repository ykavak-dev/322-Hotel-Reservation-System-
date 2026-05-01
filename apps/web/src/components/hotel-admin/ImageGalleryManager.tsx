// apps/web/src/components/hotel-admin/ImageGalleryManager.tsx
import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

interface ImageGalleryManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
}

export const ImageGalleryManager: React.FC<ImageGalleryManagerProps> = ({
  images,
  onChange,
  disabled = false,
}) => {
  const [urlInput, setUrlInput] = useState('');

  const addImage = () => {
    const url = urlInput.trim();
    if (url && !images.includes(url)) {
      onChange([...images, url]);
      setUrlInput('');
    }
  };

  const removeImage = (url: string) => {
    onChange(images.filter((img) => img !== url));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="Paste image URL..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addImage()}
          disabled={disabled}
          className="flex-1"
        />
        <Button type="button" variant="secondary" onClick={addImage} disabled={disabled || !urlInput.trim()}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, idx) => (
            <div key={idx} className="relative group">
              <img
                src={url}
                alt={`Room image ${idx + 1}`}
                className="w-full h-20 object-cover rounded-md border"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Error'; }}
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground w-5 h-5 flex items-center justify-center text-xs hover:bg-destructive/90"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};