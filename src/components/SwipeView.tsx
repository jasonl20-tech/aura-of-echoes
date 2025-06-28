
import React, { useState, useCallback } from 'react';
import { Heart, X, RotateCcw } from 'lucide-react';
import SwipeCard from './SwipeCard';
import { useWomen } from '../hooks/useWomen';
import { useWomenFilters } from '../hooks/useWomenFilters';
import { useSubscribeToWoman } from '../hooks/useSubscriptions';
import { useAuth } from '../hooks/useAuth';
import { toast } from '@/hooks/use-toast';

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
  womanId: string;
  height?: number;
  origin?: string;
  nsfw?: boolean;
  pricing_interval: string;
  formattedPrice: string;
}

const SwipeView: React.FC = () => {
  const { data: women, isLoading, error } = useWomen();
  const { filteredWomen } = useWomenFilters(women);
  const { user } = useAuth();
  const subscribeToWoman = useSubscribeToWoman();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedProfiles, setSwipedProfiles] = useState<Profile[]>([]);

  // Transform women data to profile format
  const profiles: Profile[] = filteredWomen.map(woman => {
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

    const formatPrice = (price: number, interval: string) => {
      const intervalMap = {
        daily: 'täglich',
        weekly: 'wöchentlich', 
        monthly: 'monatlich',
        yearly: 'jährlich'
      };
      return `€${price.toFixed(2)} ${intervalMap[interval as keyof typeof intervalMap] || 'monatlich'}`;
    };

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
      pricing_interval: woman.pricing_interval,
      formattedPrice: formatPrice(woman.price, woman.pricing_interval),
      distance: 0
    };
  });

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  const handleSwipeLeft = useCallback((profile: Profile) => {
    setSwipedProfiles(prev => [...prev, profile]);
    setCurrentIndex(prev => prev + 1);
    toast({
      title: "Übersprungen",
      description: `${profile.name} wurde übersprungen`,
    });
  }, []);

  const handleSwipeRight = useCallback((profile: Profile) => {
    setSwipedProfiles(prev => [...prev, profile]);
    setCurrentIndex(prev => prev + 1);
    toast({
      title: "Gefällt mir!",
      description: `${profile.name} wurde geliked`,
    });
  }, []);

  const handleSubscribe = useCallback(async (profile: Profile) => {
    if (!user) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Bitte melden Sie sich an, um zu abonnieren",
        variant: "destructive",
      });
      return;
    }

    try {
      await subscribeToWoman.mutateAsync({
        womanId: profile.womanId,
        womanName: profile.name,
        price: profile.price
      });
      
      toast({
        title: "Abonnement gestartet",
        description: `Du hast ${profile.name} erfolgreich abonniert!`,
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Abonnement konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
  }, [user, subscribeToWoman]);

  const handleUndo = useCallback(() => {
    if (swipedProfiles.length > 0) {
      setCurrentIndex(prev => Math.max(0, prev - 1));
      setSwipedProfiles(prev => prev.slice(0, -1));
    }
  }, [swipedProfiles.length]);

  const handleButtonSwipeLeft = () => {
    if (currentProfile) {
      handleSwipeLeft(currentProfile);
    }
  };

  const handleButtonSwipeRight = () => {
    if (currentProfile) {
      handleSwipeRight(currentProfile);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Profile werden geladen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-400 text-center">
          <p>Fehler beim Laden der Profile</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Keine weiteren Profile!</h2>
          <p className="text-white/70 mb-6">Du hast alle verfügbaren Profile durchgeschaut.</p>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setSwipedProfiles([]);
            }}
            className="glass-button px-6 py-3 rounded-xl text-purple-400 hover:bg-purple-600/20 transition-all duration-300"
          >
            Neu starten
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="text-center py-6 z-30 relative">
        <h1 className="relative text-4xl font-black tracking-tight">
          <span className="absolute inset-0 text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text blur-sm opacity-60">
            MostChats
          </span>
          <span className="glass-text relative text-white/90 backdrop-blur-sm">
            MostChats
          </span>
        </h1>
      </div>

      {/* Cards Stack */}
      <div className="flex-1 relative max-w-lg mx-auto w-full">
        {nextProfile && (
          <SwipeCard
            key={`${nextProfile.id}-next`}
            profile={nextProfile}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onSubscribe={handleSubscribe}
            isTop={false}
          />
        )}
        
        {currentProfile && (
          <SwipeCard
            key={`${currentProfile.id}-current`}
            profile={currentProfile}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onSubscribe={handleSubscribe}
            isTop={true}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center items-center space-x-6 py-8 z-30 relative">
        <button
          onClick={handleButtonSwipeLeft}
          className="glass-button w-16 h-16 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:scale-110 transition-all duration-300"
          disabled={!currentProfile}
        >
          <X className="w-8 h-8" />
        </button>

        <button
          onClick={handleUndo}
          className="glass-button w-12 h-12 rounded-full flex items-center justify-center text-yellow-400 hover:bg-yellow-500/20 hover:scale-110 transition-all duration-300"
          disabled={swipedProfiles.length === 0}
        >
          <RotateCcw className="w-6 h-6" />
        </button>

        <button
          onClick={handleButtonSwipeRight}
          className="glass-button w-16 h-16 rounded-full flex items-center justify-center text-green-400 hover:bg-green-500/20 hover:scale-110 transition-all duration-300"
          disabled={!currentProfile}
        >
          <Heart className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default SwipeView;
