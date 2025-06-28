
import React, { useState } from 'react';
import { Heart, X, MapPin, Ruler, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  const handleUnlike = async (womanId: string, womanName: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in",
        variant: "destructive",
      });
      return;
    }

    try {
      await removeLike({ womanId });
      toast({
        title: "Removed",
        description: `${womanName} was removed from your likes`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not remove like",
        variant: "destructive",
      });
    }
  };

  const handleProfileClick = (woman: any) => {
    navigate(`/profile/${woman.id}`);
  };

  const handleSubscribe = async (woman: any) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to subscribe",
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
        title: "Subscription started",
        description: `You have successfully subscribed to ${woman.name}!`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Subscription could not be created",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number, interval: string) => {
    const intervalMap = {
      daily: 'daily',
      weekly: 'weekly', 
      monthly: 'monthly',
      yearly: 'yearly'
    };
    return `€${price.toFixed(2)} ${intervalMap[interval as keyof typeof intervalMap] || 'monthly'}`;
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
            onClick={() => handleProfileClick(woman)}
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
              <span className="text-xs text-white font-semibold">Subscribed</span>
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
              onClick={() => handleProfileClick(woman)}
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
                <span>Subscribe for {formatPrice(woman.price, woman.pricing_interval)}</span>
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
              Liked Profiles
            </span>
            <span className="glass-text relative text-white/90 backdrop-blur-sm">
              Liked Profiles
            </span>
          </h2>
          <p className="text-white/60 text-sm">Sign in to see your liked profiles</p>
        </div>

        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl text-white/70 mb-2">Login required</h3>
          <p className="text-white/50 text-sm max-w-sm mx-auto leading-relaxed">
            Sign in to like profiles and collect them here.
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
              Liked Profiles
            </span>
            <span className="glass-text relative text-white/90 backdrop-blur-sm">
              Liked Profiles
            </span>
          </h2>
        </div>

        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/70">Loading your liked profiles...</p>
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
              Liked Profiles
            </span>
            <span className="glass-text relative text-white/90 backdrop-blur-sm">
              Liked Profiles
            </span>
          </h2>
          <p className="text-white/60 text-sm">
            {likes.length > 0 
              ? `You have liked ${likes.length} profile${likes.length !== 1 ? 's' : ''}`
              : 'Here you can see all profiles you have liked'
            }
          </p>
        </div>

        {likes.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl text-white/70 mb-2">No likes yet</h3>
            <p className="text-white/50 text-sm max-w-sm mx-auto leading-relaxed">
              Go to profiles or use the random tab to like profiles and collect them here.
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
