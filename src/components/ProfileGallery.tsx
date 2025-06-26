
import React, { useState } from 'react';
import ProfileCard from './ProfileCard';
import ProfileDetailModal from './ProfileDetailModal';
import { useWomen } from '../hooks/useWomen';

interface ProfileGalleryProps {
  isRandom?: boolean;
}

const ProfileGallery: React.FC<ProfileGalleryProps> = ({ isRandom = false }) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const { data: women, isLoading, error } = useWomen();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="profile-glass rounded-2xl h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-white/70">Fehler beim Laden der Profile</p>
      </div>
    );
  }

  if (!women || women.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-white/70">Keine Profile verfügbar</p>
      </div>
    );
  }

  const displayWomen = isRandom 
    ? [...women].sort(() => Math.random() - 0.5)
    : women;

  const handleProfileClick = (profileId: string) => {
    setSelectedProfileId(profileId);
  };

  const selectedWoman = women.find(w => w.id === selectedProfileId);

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white text-glow mb-2">
          {isRandom ? 'Zufällige Entdeckungen' : 'Verfügbare Profile'}
        </h2>
        <p className="text-white/70">
          {isRandom ? 'Lassen Sie sich überraschen' : 'Wählen Sie Ihr perfektes Match'}
        </p>
      </div>

      {displayWomen.map((woman) => (
        <ProfileCard
          key={woman.id}
          profile={{
            id: parseInt(woman.id.slice(-8), 16), // Convert UUID to number for compatibility
            name: woman.name,
            age: woman.age,
            interests: woman.interests || [],
            distance: Math.floor(Math.random() * 50) + 1, // Random distance for now
            image: woman.image_url || '/placeholder.svg',
            description: woman.description || '',
            personality: woman.personality || '',
          }}
          onClick={() => handleProfileClick(woman.id)}
        />
      ))}

      {selectedWoman && (
        <ProfileDetailModal
          profile={{
            id: parseInt(selectedWoman.id.slice(-8), 16),
            name: selectedWoman.name,
            age: selectedWoman.age,
            interests: selectedWoman.interests || [],
            distance: Math.floor(Math.random() * 50) + 1,
            image: selectedWoman.image_url || '/placeholder.svg',
            description: selectedWoman.description || '',
            personality: selectedWoman.personality || '',
            price: selectedWoman.price,
            womanId: selectedWoman.id,
          }}
          isOpen={!!selectedProfileId}
          onClose={() => setSelectedProfileId(null)}
        />
      )}
    </div>
  );
};

export default ProfileGallery;
