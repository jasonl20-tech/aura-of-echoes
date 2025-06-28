
import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageModalProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  alt?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  alt = 'Bild'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Image navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={onPrevious}
            className="absolute left-4 z-10 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 z-10 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Main image */}
      <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        <img
          src={images[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Thumbnails for navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-[90vw] overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                const diff = index - currentIndex;
                if (diff > 0) {
                  for (let i = 0; i < diff; i++) onNext();
                } else if (diff < 0) {
                  for (let i = 0; i < Math.abs(diff); i++) onPrevious();
                }
              }}
              className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                index === currentIndex ? 'border-purple-400' : 'border-white/30 hover:border-white/60'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageModal;
