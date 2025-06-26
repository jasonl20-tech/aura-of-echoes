import React, { useState } from 'react';
import { X, Plus, Upload } from 'lucide-react';

interface ImageData {
  url: string;
  alt?: string;
}

interface MultiImageUploadProps {
  images: ImageData[];
  onChange: (images: ImageData[]) => void;
  maxImages?: number;
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  images = [],
  onChange,
  maxImages = 5
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleImageAdd = (newUrl: string) => {
    if (images.length < maxImages) {
      const newImages = [...images, { url: newUrl, alt: '' }];
      onChange(newImages);
    }
  };

  const handleImageRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleImageUpdate = (index: number, url: string, alt?: string) => {
    const newImages = [...images];
    newImages[index] = { url, alt: alt || '' };
    onChange(newImages);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    // Handle file drop logic here - for now just URL input
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-white">
          Bilder ({images.length}/{maxImages})
        </label>
      </div>

      {/* Existing Images */}
      <div className="grid grid-cols-2 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group glass rounded-lg overflow-hidden">
            <img
              src={image.url}
              alt={image.alt || `Bild ${index + 1}`}
              className="w-full h-32 object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => handleImageRemove(index)}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Alt-Text (optional)"
              value={image.alt || ''}
              onChange={(e) => handleImageUpdate(index, image.url, e.target.value)}
              className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 border-none outline-none"
            />
          </div>
        ))}

        {/* Add New Image */}
        {images.length < maxImages && (
          <div
            className={`border-2 border-dashed border-purple-400/50 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 transition-colors ${
              dragActive ? 'border-purple-400 bg-purple-400/10' : ''
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
          >
            <Upload className="w-6 h-6 text-purple-400 mb-2" />
            <span className="text-sm text-purple-400">Bild hinzufügen</span>
          </div>
        )}
      </div>

      {/* URL Input for adding new images */}
      {images.length < maxImages && (
        <div className="flex space-x-2">
          <input
            type="url"
            placeholder="Bild-URL eingeben..."
            className="flex-1 glass rounded-lg px-3 py-2 text-white placeholder-white/60 border border-purple-400/30 focus:border-purple-400 outline-none"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                if (target.value.trim()) {
                  handleImageAdd(target.value.trim());
                  target.value = '';
                }
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[type="url"]') as HTMLInputElement;
              if (input?.value.trim()) {
                handleImageAdd(input.value.trim());
                input.value = '';
              }
            }}
            className="glass px-4 py-2 rounded-lg text-purple-400 hover:bg-purple-400/20 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MultiImageUpload;
