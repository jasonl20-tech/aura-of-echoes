
import React, { useState } from 'react';
import { X, Plus, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [inputValue, setInputValue] = useState('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('women-images')
        .upload(fileName, file);

      if (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload-Fehler",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('women-images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload-Fehler",
        description: "Datei konnte nicht hochgeladen werden",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ungültiger Dateityp",
        description: "Bitte wählen Sie eine Bilddatei aus",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Datei zu groß",
        description: "Bitte wählen Sie eine Datei unter 5MB",
        variant: "destructive"
      });
      return;
    }

    if (images.length >= maxImages) {
      toast({
        title: "Maximum erreicht",
        description: `Sie können maximal ${maxImages} Bilder hochladen`,
        variant: "destructive"
      });
      return;
    }

    const url = await uploadFile(file);
    if (url) {
      const newImages = [...images, { url, alt: '' }];
      onChange(newImages);
      toast({
        title: "Erfolgreich hochgeladen",
        description: "Bild wurde erfolgreich hochgeladen"
      });
    }
  };

  const handleImageAdd = (newUrl: string) => {
    if (newUrl.trim() && images.length < maxImages) {
      const newImages = [...images, { url: newUrl.trim(), alt: '' }];
      onChange(newImages);
      setInputValue('');
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    await handleFileUpload(e.dataTransfer.files);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleImageAdd(inputValue);
    }
  };

  const handleAddClick = () => {
    handleImageAdd(inputValue);
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
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=600&fit=crop';
              }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
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

        {/* File Upload Area */}
        {images.length < maxImages && (
          <div className="space-y-2">
            <div
              className={`border-2 border-dashed border-purple-400/50 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 transition-colors relative ${
                dragActive ? 'border-purple-400 bg-purple-400/10' : ''
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              {uploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full mb-2"></div>
                  <span className="text-sm text-purple-400">Wird hochgeladen...</span>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-purple-400 mb-2" />
                  <span className="text-sm text-purple-400 text-center">
                    Datei hier ablegen oder klicken
                  </span>
                  <span className="text-xs text-purple-400/70 mt-1">
                    JPG, PNG, GIF (max. 5MB)
                  </span>
                </>
              )}
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
            </div>
          </div>
        )}
      </div>

      {/* URL Input for adding new images */}
      {images.length < maxImages && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-white/60 text-sm">
            <div className="flex-1 h-px bg-white/20"></div>
            <span>oder URL eingeben</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>
          <div className="flex space-x-2">
            <input
              type="url"
              placeholder="Bild-URL eingeben..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 glass rounded-lg px-3 py-2 text-white placeholder-white/60 border border-purple-400/30 focus:border-purple-400 outline-none"
            />
            <button
              type="button"
              onClick={handleAddClick}
              disabled={!inputValue.trim()}
              className="glass px-4 py-2 rounded-lg text-purple-400 hover:bg-purple-400/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiImageUpload;
