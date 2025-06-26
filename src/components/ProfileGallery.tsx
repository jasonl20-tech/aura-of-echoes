
import React, { useState, useMemo } from 'react';
import ProfileCard from './ProfileCard';
import ProfileDetailModal from './ProfileDetailModal';
import WomenSearch from './WomenSearch';
import { useWomen } from '../hooks/useWomen';
import { useWomenFilters } from '../hooks/useWomenFilters';
import { Eye, EyeOff } from 'lucide-react';

interface ProfileGalleryProps {
  isRandom?: boolean;
  onAuthRequired?: () => void;
}

const ProfileGallery: React.FC<ProfileGalleryProps> = ({ isRandom = false, onAuthRequired }) => {
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const { data: women, isLoading, error } = useWomen();
  const { filters, filteredWomen, updateFilter, resetFilters } = useWomenFilters(women);

  const availableOrigins = useMemo(() => {
    if (!women) return [];
    const origins = women
      .map(woman => woman.origin)
      .filter((origin): origin is string => Boolean(origin));
    return [...new Set(origins)].sort();
  }, [women]);

  const formatPrice = (price: number, interval: string) => {
    const intervalMap = {
      daily: 'täglich',
      weekly: 'wöchentlich', 
      monthly: 'monatlich',
      yearly: 'jährlich'
    };
    return `€${price.toFixed(2)} ${intervalMap[interval as keyof typeof intervalMap] || 'monatlich'}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Profile werden geladen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-center">
          <p>Fehler beim Laden der Profile</p>
        </div>
      </div>
    );
  }

  if (!women || women.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/70 text-center">
          <p>Keine Profile verfügbar</p>
        </div>
      </div>
    );
  }

  // Convert women data to profile format
  const profiles = filteredWomen.map(woman => ({
    id: parseInt(woman.id.slice(-8), 16),
    name: woman.name,
    age: woman.age,
    interests: woman.interests || [],
    distance: Math.floor(Math.random() * 50) + 1,
    image: woman.image_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=600&fit=crop',
    description: woman.description || '',
    personality: woman.personality || '',
    price: parseFloat(woman.price.toString()),
    womanId: woman.id,
    height: woman.height,
    origin: woman.origin,
    nsfw: woman.nsfw,
    pricing_interval: woman.pricing_interval,
    formattedPrice: formatPrice(woman.price, woman.pricing_interval)
  }));

  // Shuffle profiles if random mode
  const displayProfiles = isRandom 
    ? [...profiles].sort(() => Math.random() - 0.5)
    : profiles;

  const handleProfileClick = (profile: any) => {
    setSelectedProfile(profile);
  };

  // Count NSFW profiles
  const nsfwCount = displayProfiles.filter(p => p.nsfw).length;
  const safeCount = displayProfiles.length - nsfwCount;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white text-glow mb-2">
          {isRandom ? 'Zufällige Entdeckungen' : 'Entdecke AI-Companions'}
        </h1>
        <p className="text-white/70">
          {isRandom 
            ? 'Lasse dich überraschen von neuen Persönlichkeiten'
            : 'Finde deinen perfekten AI-Companion zum Chatten'
          }
        </p>
      </div>

      <WomenSearch
        filters={filters}
        onFilterChange={updateFilter}
        onResetFilters={resetFilters}
        availableOrigins={availableOrigins}
      />

      {/* NSFW Filter Toggle */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {filters.showNsfw ? <Eye className="w-4 h-4 text-purple-400" /> : <EyeOff className="w-4 h-4 text-purple-400" />}
              <span className="text-white font-medium">NSFW Content anzeigen</span>
            </div>
            <div className="text-xs text-white/50">
              ({safeCount} Safe, {nsfwCount} NSFW)
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showNsfw}
              onChange={(e) => updateFilter('showNsfw', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      {displayProfiles.length === 0 ? (
        <div className="text-center text-white/70 py-8">
          <p>Keine Profile entsprechen den Filterkriterien</p>
          <button
            onClick={resetFilters}
            className="mt-4 glass-button px-4 py-2 rounded-xl text-purple-400 hover:bg-purple-600/20 transition-all duration-300"
          >
            Filter zurücksetzen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {displayProfiles.map((profile) => (
            <div key={profile.id} className="relative">
              <ProfileCard
                profile={profile}
                onClick={() => handleProfileClick(profile)}
              />
              {/* NSFW Badge */}
              {profile.nsfw && (
                <div className="absolute top-2 right-2 bg-red-500/90 text-white text-xs px-2 py-1 rounded-full font-semibold border border-red-400">
                  NSFW
                </div>
              )}
              {/* Custom Price Badge */}
              <div className="absolute bottom-2 left-2 bg-black/80 text-green-400 text-xs px-2 py-1 rounded-full font-semibold">
                {profile.formattedPrice}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProfile && (
        <ProfileDetailModal
          profile={selectedProfile}
          isOpen={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onAuthRequired={onAuthRequired}
        />
      )}
    </div>
  );
};

export default ProfileGallery;
