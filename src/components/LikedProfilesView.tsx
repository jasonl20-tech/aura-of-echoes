
import React, { useState } from 'react';
import { Heart, X, MapPin, Ruler, Crown } from 'lucide-react';
import { useLikes } from '../hooks/useLikes';
import { useAuth } from '../hooks/useAuth';
import { useSubscribeToWoman } from '../hooks/useSubscriptions';
import { useCheckSubscription } from '../hooks/useSubscriptions';
import { toast } from '@/hooks/use-toast';
import ProfileModal from './ProfileModal';

const LikedProfilesView: React.FC = () => {
  const { user } = useAuth();
  const { likes, isLoading, removeLike } = useLikes();
  const subscribeToWoman = useSubscribeToWoman();
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  const handleUnlike = async (womanId: string, womanName: string) => {
    if (!user) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Bitte melden Sie sich an",
        variant: "destructive",
      });
      return;
    }

    try {
      await removeLike({ womanId });
      toast({
        title: "Entfernt",
        description: `${womanName} wurde aus deinen Likes entfernt`,
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Like konnte nicht entfernt werden",
        variant: "destructive",
      });
    }
  };

  const handleSubscribe = async (woman: any) => {
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
        womanId: woman.id,
        womanName: woman.name,
        price: woman.price
      });
      
      toast({
        title: "Abonnement gestartet",
        description: `Du hast ${woman.name} erfolgreich abonniert!`,
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Abonnement konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number, interval: string) => {
    const intervalMap = {
      daily: 'täglich',
      weekly: 'wöchentlich', 
      monthly: 'monatlich',
      yearly: 'jährlich'
    };
    return `€${price.toFixed(2)} ${intervalMap[interval as keyof typeof intervalMap] || 'monatlich'}`;
  };

  const ProfileCard = ({ like }: { like: any }) => {
    const woman = like.woman;
    const { data: subscriptionData } = useCheckSubscription(woman.id);
    
    // Parse images
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

    const mainImage = images[0] || 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=600&fit=crop';

    return (
      <div className="glass rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 group">
        <div className="relative aspect-[3/4]">
          <img
            src={mainImage}
            alt={woman.name}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setSelectedProfile(woman)}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* NSFW badge */}
          {woman.nsfw && (
            <div className="absolute top-3 left-3 bg-red-500/90 px-2 py-1 rounded-full backdrop-blur-sm border border-red-400/50">
              <span className="text-xs text-white font-semibold">NSFW</span>
            </div>
          )}

          {/* Subscription badge */}
          {subscriptionData?.hasAccess && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-purple-700 px-2 py-1 rounded-full backdrop-blur-sm border border-purple-400/50">
              <span className="text-xs text-white font-semibold">Abonniert</span>
            </div>
          )}

          {/* Unlike button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUnlike(woman.id, woman.name);
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-red-500/80 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Profile info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 
              className="text-white font-bold text-lg mb-1 cursor-pointer hover:text-purple-300 transition-colors"
              onClick={() => setSelectedProfile(woman)}
            >
              {woman.name}, {woman.age}
            </h3>
            
            <div className="flex items-center space-x-3 text-white/70 text-sm mb-2">
              {woman.origin && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{woman.origin}</span>
                </div>
              )}
              {woman.height && (
                <div className="flex items-center space-x-1">
                  <Ruler className="w-3 h-3" />
                  <span>{woman.height}cm</span>
                </div>
              )}
            </div>

            <p className="text-white/90 text-sm mb-3 line-clamp-2">
              {woman.description}
            </p>

            {/* Subscribe button */}
            {!subscriptionData?.hasAccess && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubscribe(woman);
                }}
                className="w-full glass-button px-3 py-2 rounded-xl text-white text-sm font-semibold flex items-center justify-center space-x-2 hover:bg-purple-600/30 transition-all duration-300"
              >
                <Crown className="w-4 h-4" />
                <span>Abonnieren für {formatPrice(woman.price, woman.pricing_interval)}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="relative text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
            <span className="absolute inset-0 text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text blur-sm opacity-50">
              Gelikte Profile
            </span>
            <span className="glass-text relative text-white/90 backdrop-blur-sm">
              Gelikte Profile
            </span>
          </h2>
          <p className="text-white/60 text-sm">Melde dich an, um deine gelikten Profile zu sehen</p>
        </div>

        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl text-white/70 mb-2">Anmeldung erforderlich</h3>
          <p className="text-white/50 text-sm max-w-sm mx-auto leading-relaxed">
            Melde dich an, um Profile zu liken und sie hier zu sammeln.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="relative text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
            <span className="absolute inset-0 text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text blur-sm opacity-50">
              Gelikte Profile
            </span>
            <span className="glass-text relative text-white/90 backdrop-blur-sm">
              Gelikte Profile
            </span>
          </h2>
        </div>

        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/70">Lade deine gelikten Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="relative text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
            <span className="absolute inset-0 text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text blur-sm opacity-50">
              Gelikte Profile
            </span>
            <span className="glass-text relative text-white/90 backdrop-blur-sm">
              Gelikte Profile
            </span>
          </h2>
          <p className="text-white/60 text-sm">
            {likes.length > 0 
              ? `Du hast ${likes.length} Profile${likes.length !== 1 ? '' : ''} geliked`
              : 'Hier siehst du alle Profile, die du geliked hast'
            }
          </p>
        </div>

        {likes.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl text-white/70 mb-2">Noch keine Likes</h3>
            <p className="text-white/50 text-sm max-w-sm mx-auto leading-relaxed">
              Gehe zu den Profilen oder verwende den Zufall-Tab, um Profile zu liken und sie hier zu sammeln.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
            {likes.map((like) => (
              <ProfileCard key={like.id} like={like} />
            ))}
          </div>
        )}
      </div>

      {selectedProfile && (
        <ProfileModal
          isOpen={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
          woman={selectedProfile}
        />
      )}
    </>
  );
};

export default LikedProfilesView;
