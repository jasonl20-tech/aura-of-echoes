
import React, { useState } from 'react';
import ProfileCard from './ProfileCard';
import ProfileDetailModal from './ProfileDetailModal';
import { useWomen } from '../hooks/useWomen';

interface ProfileGalleryProps {
  isRandom?: boolean;
  onAuthRequired?: () => void;
}

const ProfileGallery: React.FC<ProfileGalleryProps> = ({ isRandom = false, onAuthRequired }) => {
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const { data: women, isLoading, error } = useWomen();

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
  const profiles = women.map(woman => ({
    id: parseInt(woman.id.slice(-8), 16), // Convert UUID to number for compatibility
    name: woman.name,
    age: woman.age,
    interests: woman.interests || [],
    distance: Math.floor(Math.random() * 50) + 1, // Mock distance
    image: woman.image_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=600&fit=crop',
    description: woman.description || '',
    personality: woman.personality || '',
    price: parseFloat(woman.price.toString()),
    womanId: woman.id
  }));

  // Shuffle profiles if random mode
  const displayProfiles = isRandom 
    ? [...profiles].sort(() => Math.random() - 0.5)
    : profiles;

  const handleProfileClick = (profile: any) => {
    setSelectedProfile(profile);
  };

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

      <div className="grid gap-6">
        {displayProfiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onClick={() => handleProfileClick(profile)}
          />
        ))}
      </div>

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
