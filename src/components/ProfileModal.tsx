
import React from 'react';
import { X, Heart, MapPin, Calendar } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  woman: {
    id: string;
    name: string;
    image_url: string | null;
    age?: number;
    description?: string;
    interests?: string[];
  };
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, woman }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative glass-card rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 glass-button p-2 rounded-full hover:bg-white/20"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="text-center mb-6">
          <img
            src={woman.image_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=300&h=300&fit=crop'}
            alt={woman.name}
            className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-purple-400/50"
          />
          <h2 className="text-2xl font-bold text-white mb-2">{woman.name}</h2>
          {woman.age && (
            <div className="flex items-center justify-center space-x-2 text-white/70 mb-2">
              <Calendar className="w-4 h-4" />
              <span>{woman.age} Jahre alt</span>
            </div>
          )}
        </div>

        {woman.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Über mich</h3>
            <p className="text-white/80 text-sm leading-relaxed">{woman.description}</p>
          </div>
        )}

        {woman.interests && woman.interests.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Interessen</h3>
            <div className="flex flex-wrap gap-2">
              {woman.interests.map((interest, index) => (
                <span
                  key={index}
                  className="glass-button px-3 py-1 rounded-full text-sm text-white/80"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 py-3 rounded-xl text-white font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-300"
        >
          Schließen
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
