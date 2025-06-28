
import React, { memo, useState } from 'react';
import { Heart } from 'lucide-react';
import ImageModal from './ImageModal';

interface Profile {
  id: number;
  name: string;
  age: number;
  interests: string[];
  distance: number;
  image: string;
  images: string[];
  description: string;
  personality: string;
  price: number;
  formattedPrice: string;
  height?: number;
  origin?: string;
  nsfw?: boolean;
  isSubscribed?: boolean;
}

interface ProfileCardProps {
  profile: Profile;
  onClick: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = memo(({ profile, onClick }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(0);
    setShowImageModal(true);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % profile.images.length);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + profile.images.length) % profile.images.length);
  };

  return (
    <>
      <div
        className="profile-glass rounded-2xl overflow-hidden cursor-pointer hover-lift group w-full transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 animate-micro-bounce"
        onClick={onClick}
      >
        {/* Image with overlay */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={profile.image}
            alt={profile.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
            loading="lazy"
            onClick={handleImageClick}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/70"></div>
          
          {/* NSFW badge - only show if nsfw is true */}
          {profile.nsfw && (
            <div className="absolute top-3 left-3 bg-red-500/90 px-2 py-1 rounded backdrop-blur-sm border border-red-400/50 animate-fade-in">
              <span className="text-xs text-white font-semibold">NSFW</span>
            </div>
          )}

          {/* Subscription badge */}
          {profile.isSubscribed && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-purple-700 px-2 py-1 rounded-lg backdrop-blur-sm border border-purple-400/50 animate-fade-in animate-pulse-soft">
              <span className="text-xs text-white font-semibold">Abonniert</span>
            </div>
          )}

          {/* Image count indicator */}
          {profile.images.length > 1 && (
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
              <span className="text-xs text-white font-medium">{profile.images.length} Bilder</span>
            </div>
          )}

          {/* Profile info overlay */}
          <div className="absolute bottom-3 left-3 right-3 transform transition-transform duration-300 group-hover:translate-y-[-2px]">
            <h3 className="text-white font-bold text-lg text-sharp">
              {profile.name}, {profile.age}
            </h3>
            {profile.origin && (
              <div className="text-white/80 mt-1 transition-colors duration-300 group-hover:text-white/90">
                <span className="text-sm">{profile.origin}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Interests */}
          <div className="flex flex-wrap gap-1">
            {profile.interests.slice(0, 3).map((interest, index) => (
              <span
                key={interest}
                className="px-2 py-1 glass rounded-full text-xs text-white/80 font-medium transition-all duration-300 hover:bg-white/10 hover:text-white/90 hover:scale-105 animate-micro-bounce"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {interest}
              </span>
            ))}
            {profile.interests.length > 3 && (
              <span className="px-2 py-1 glass rounded-full text-xs text-white/60 transition-all duration-300 hover:text-white/80 animate-micro-bounce">
                +{profile.interests.length - 3}
              </span>
            )}
          </div>

          {/* Additional Info */}
          <div className="flex justify-between items-center text-xs text-white/60 transition-colors duration-300 group-hover:text-white/80">
            {profile.height && <span>{profile.height}cm</span>}
            <div className="flex items-center space-x-1">
              <Heart className="w-3 h-3 transition-colors duration-300 group-hover:text-red-400 animate-pulse-soft" />
              <span>Premium</span>
            </div>
          </div>

          {/* Description preview */}
          <p className="text-white/70 text-sm leading-relaxed line-clamp-2 transition-colors duration-300 group-hover:text-white/85">
            {profile.description}
          </p>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        images={profile.images}
        currentIndex={currentImageIndex}
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onNext={handleNextImage}
        onPrevious={handlePreviousImage}
        alt={profile.name}
      />
    </>
  );
});

ProfileCard.displayName = 'ProfileCard';

export default ProfileCard;
