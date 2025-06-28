
import React, { useState, useRef, useCallback } from 'react';
import { Heart, X, Crown, MapPin, Ruler } from 'lucide-react';
import { useCheckSubscription } from '../hooks/useSubscriptions';
import { useAuth } from '../hooks/useAuth';

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
  womanId: string;
}

interface SwipeCardProps {
  profile: Profile;
  onSwipeLeft: (profile: Profile) => void;
  onSwipeRight: (profile: Profile) => void;
  onSubscribe: (profile: Profile) => void;
  isTop: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ 
  profile, 
  onSwipeLeft, 
  onSwipeRight, 
  onSubscribe,
  isTop 
}) => {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { data: subscriptionData } = useCheckSubscription(profile.womanId);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isTop) return;
    setIsDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      setDragOffset({ x: deltaX, y: deltaY * 0.3 });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      const threshold = 100;
      
      if (dragOffset.x > threshold) {
        onSwipeRight(profile);
      } else if (dragOffset.x < -threshold) {
        onSwipeLeft(profile);
      }
      
      setDragOffset({ x: 0, y: 0 });
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [dragOffset.x, isTop, onSwipeLeft, onSwipeRight, profile]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isTop) return;
    setIsDragging(true);
    const startX = e.touches[0].clientX;
    const startY = e.touches[0].clientY;

    const handleTouchMove = (e: TouchEvent) => {
      const deltaX = e.touches[0].clientX - startX;
      const deltaY = e.touches[0].clientY - startY;
      setDragOffset({ x: deltaX, y: deltaY * 0.3 });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      const threshold = 100;
      
      if (dragOffset.x > threshold) {
        onSwipeRight(profile);
      } else if (dragOffset.x < -threshold) {
        onSwipeLeft(profile);
      }
      
      setDragOffset({ x: 0, y: 0 });
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListene'touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  }, [dragOffset.x, isTop, onSwipeLeft, onSwipeRight, profile]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % profile.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + profile.images.length) % profile.images.length);
  };

  const rotation = dragOffset.x * 0.1;
  const opacity = Math.max(0.7, 1 - Math.abs(dragOffset.x) / 200);
  
  const swipeDirection = dragOffset.x > 50 ? 'right' : dragOffset.x < -50 ? 'left' : null;

  return (
    <div
      ref={cardRef}
      className={`absolute inset-4 profile-glass rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-300 ${
        isTop ? 'z-20' : 'z-10 scale-95'
      }`}
      style={{
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg) ${
          !isTop ? 'scale(0.95)' : ''
        }`,
        opacity: isTop ? opacity : 0.8,
        transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Swipe indicators */}
      {swipeDirection && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div
            className={`px-8 py-4 rounded-full backdrop-blur-xl border-4 transform scale-110 ${
              swipeDirection === 'right'
                ? 'bg-green-500/20 border-green-400 text-green-300'
                : 'bg-red-500/20 border-red-400 text-red-300'
            }`}
          >
            {swipeDirection === 'right' ? (
              <Heart className="w-12 h-12" />
            ) : (
              <X className="w-12 h-12" />
            )}
          </div>
        </div>
      )}

      {/* Main image */}
      <div className="relative h-full">
        <img
          src={profile.images[currentImageIndex] || profile.image}
          alt={profile.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        {/* Image navigation areas */}
        {profile.images.length > 1 && (
          <>
            <div
              className="absolute left-0 top-0 w-1/3 h-full z-10 cursor-pointer"
              onClick={prevImage}
            />
            <div
              className="absolute right-0 top-0 w-1/3 h-full z-10 cursor-pointer"
              onClick={nextImage}
            />
            
            {/* Image indicators */}
            <div className="absolute top-4 left-4 right-4 flex space-x-1 z-20">
              {profile.images.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-1 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* NSFW badge */}
        {profile.nsfw && (
          <div className="absolute top-4 left-4 bg-red-500/90 px-3 py-1 rounded-full backdrop-blur-sm border border-red-400/50 z-20">
            <span className="text-sm text-white font-semibold">NSFW</span>
          </div>
        )}

        {/* Subscription badge */}
        {subscriptionData?.hasAccess && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-purple-700 px-3 py-1 rounded-full backdrop-blur-sm border border-purple-400/50 z-20">
            <span className="text-sm text-white font-semibold">Abonniert</span>
          </div>
        )}

        {/* Profile info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-white mb-2">
              {profile.name}, {profile.age}
            </h2>
            
            <div className="flex items-center space-x-4 text-white/80 mb-3">
              {profile.origin && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{profile.origin}</span>
                </div>
              )}
              {profile.height && (
                <div className="flex items-center space-x-1">
                  <Ruler className="w-4 h-4" />
                  <span className="text-sm">{profile.height}cm</span>
                </div>
              )}
            </div>

            <p className="text-white/90 text-lg leading-relaxed mb-4 line-clamp-3">
              {profile.description}
            </p>

            {/* Interests */}
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.interests.slice(0, 4).map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 glass rounded-full text-sm text-white/90 font-medium"
                >
                  {interest}
                </span>
              ))}
              {profile.interests.length > 4 && (
                <span className="px-3 py-1 glass rounded-full text-sm text-white/70">
                  +{profile.interests.length - 4}
                </span>
              )}
            </div>

            {/* Subscribe button */}
            {!subscriptionData?.hasAccess && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSubscribe(profile);
                }}
                className="w-full glass-button px-6 py-3 rounded-2xl text-white font-semibold flex items-center justify-center space-x-2 hover:bg-purple-600/30 transition-all duration-300"
              >
                <Crown className="w-5 h-5" />
                <span>Abonnieren für {profile.formattedPrice}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwipeCard;
