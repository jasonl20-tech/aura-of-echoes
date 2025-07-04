
import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileCard from './ProfileCard';
import WomenSearch from './WomenSearch';
import { useWomen } from '../hooks/useWomen';
import { useWomenFilters } from '../hooks/useWomenFilters';

interface ProfileGalleryProps {
  isRandom?: boolean;
  onAuthRequired?: () => void;
}

const ProfileGallery: React.FC<ProfileGalleryProps> = ({ isRandom = false, onAuthRequired }) => {
  const navigate = useNavigate();
  const { data: women, isLoading, error } = useWomen();
  const { filters, filteredWomen, updateFilter, resetFilters } = useWomenFilters(women);

  const availableOrigins = useMemo(() => {
    if (!women) return [];
    const origins = women
      .map(woman => woman.origin)
      .filter((origin): origin is string => Boolean(origin));
    return [...new Set(origins)].sort();
  }, [women]);

  const formatPrice = useCallback((price: number, interval: string) => {
    const intervalMap = {
      daily: 'daily',
      weekly: 'weekly', 
      monthly: 'monthly',
      yearly: 'yearly'
    };
    return `€${price.toFixed(2)} ${intervalMap[interval as keyof typeof intervalMap] || 'monthly'}`;
  }, []);

  const profiles = useMemo(() => {
    return filteredWomen.map(woman => {
      let images = [];
      if (woman.images) {
        try {
          const parsedImages = typeof woman.images === 'string' 
            ? JSON.parse(woman.images) 
            : woman.images;
          if (Array.isArray(parsedImages)) {
            images = parsedImages.map((img: any) => img.url || img);
          }
        } catch (e) {
          console.warn('Error parsing images for woman:', woman.id, e);
        }
      }
      
      if (images.length === 0 && woman.image_url) {
        images = [woman.image_url];
      }

      return {
        id: parseInt(woman.id.slice(-8), 16),
        name: woman.name,
        age: woman.age,
        interests: woman.interests || [],
        image: images[0] || 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=600&fit=crop',
        images: images,
        description: woman.description || '',
        personality: woman.personality || '',
        price: parseFloat(woman.price.toString()),
        womanId: woman.id,
        height: woman.height,
        origin: woman.origin,
        nsfw: woman.nsfw,
        exclusive: woman.exclusive,
        exclusive_label: woman.exclusive_label,
        pricing_interval: woman.pricing_interval,
        formattedPrice: formatPrice(woman.price, woman.pricing_interval),
        distance: 0
      };
    });
  }, [filteredWomen, formatPrice]);

  const displayProfiles = useMemo(() => {
    if (isRandom) {
      const shuffled = [...profiles];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }
    
    // Sort profiles: exclusive first, then by name
    return [...profiles].sort((a, b) => {
      if (a.exclusive && !b.exclusive) return -1;
      if (!a.exclusive && b.exclusive) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [profiles, isRandom]);

  const handleProfileClick = useCallback((profile: any) => {
    navigate(`/profile/${profile.womanId}`);
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading profiles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-center">
          <p>Error loading profiles</p>
        </div>
      </div>
    );
  }

  if (!women || women.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/70 text-center">
          <p>No profiles available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="relative text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
          <span className="absolute inset-0 text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text blur-sm opacity-50">
            MostChats
          </span>
          <span className="glass-text relative text-white/90 backdrop-blur-sm">
            MostChats
          </span>
        </h1>
      </div>

      <WomenSearch
        filters={filters}
        onFilterChange={updateFilter}
        onResetFilters={resetFilters}
        availableOrigins={availableOrigins}
      />

      {displayProfiles.length === 0 ? (
        <div className="text-center text-white/70 py-8">
          <p>No profiles match the filter criteria</p>
          <button
            onClick={resetFilters}
            className="mt-4 glass-button px-4 py-2 rounded-xl text-purple-400 hover:bg-purple-600/20 transition-all duration-300"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
          {displayProfiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onClick={() => handleProfileClick(profile)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileGallery;
