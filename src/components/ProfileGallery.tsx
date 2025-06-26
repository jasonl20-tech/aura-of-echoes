
import React, { useState } from 'react';
import { MapPin, Star, MessageCircle } from 'lucide-react';
import ProfileDetailModal from './ProfileDetailModal';

interface Profile {
  id: number;
  name: string;
  age: number;
  interests: string[];
  distance: number;
  image: string;
  description: string;
  personality: string;
}

const mockProfiles: Profile[] = [
  {
    id: 1,
    name: "Emma",
    age: 25,
    interests: ["Reisen", "Fotografie", "Kochen"],
    distance: 5,
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=600&fit=crop",
    description: "Hallo! Ich bin Emma und liebe es, neue Orte zu entdecken und köstliche Gerichte zu kochen. Ich suche jemanden für tiefe Gespräche und gemeinsame Abenteuer.",
    personality: "Aufgeschlossen, kreativ und abenteuerlustig"
  },
  {
    id: 2,
    name: "Sophia",
    age: 28,
    interests: ["Yoga", "Musik", "Bücher"],
    distance: 8,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop",
    description: "Hi, ich bin Sophia! Entspannung durch Yoga und gute Musik sind meine Leidenschaft. Ich lese gerne und teile meine Gedanken über das Leben.",
    personality: "Ruhig, nachdenklich und empathisch"
  },
  {
    id: 3,
    name: "Luna",
    age: 23,
    interests: ["Gaming", "Anime", "Technologie"],
    distance: 12,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop",
    description: "Hey! Ich bin Luna und eine echte Gamerin. Ich liebe Anime und alles was mit Technologie zu tun hat. Lass uns über unsere Lieblingsspiele sprechen!",
    personality: "Spielerisch, intelligent und witzig"
  },
  {
    id: 4,
    name: "Maya",
    age: 26,
    interests: ["Fitness", "Gesundheit", "Natur"],
    distance: 3,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop",
    description: "Hallo, ich bin Maya! Ein gesunder Lebensstil und die Natur sind mir sehr wichtig. Ich trainiere gerne und genieße Spaziergänge im Freien.",
    personality: "Energisch, motiviert und naturverbunden"
  }
];

interface ProfileGalleryProps {
  isRandom?: boolean;
}

const ProfileGallery: React.FC<ProfileGalleryProps> = ({ isRandom = false }) => {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [currentProfiles, setCurrentProfiles] = useState(mockProfiles);

  const handleRandomize = () => {
    const shuffled = [...mockProfiles].sort(() => Math.random() - 0.5);
    setCurrentProfiles(shuffled);
  };

  React.useEffect(() => {
    if (isRandom) {
      handleRandomize();
    }
  }, [isRandom]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          {isRandom ? 'Entdecke neue Profile' : 'Verfügbare Profile'}
        </h2>
        <p className="text-white/70">
          {isRandom ? 'Zufällige Auswahl für dich' : 'Finde deine perfekte Verbindung'}
        </p>
        {isRandom && (
          <button
            onClick={handleRandomize}
            className="mt-3 glass-button px-4 py-2 rounded-full text-sm"
          >
            Neu mischen
          </button>
        )}
      </div>

      {/* Profile Grid */}
      <div className="space-y-4">
        {currentProfiles.map((profile, index) => (
          <div
            key={profile.id}
            className="glass-card rounded-2xl p-4 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedProfile(profile)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex space-x-4">
              {/* Profile Image */}
              <div className="relative">
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="w-20 h-20 rounded-xl object-cover border-2 border-white/20"
                />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white/50"></div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    {profile.name}, {profile.age}
                  </h3>
                  <div className="flex items-center space-x-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm">4.8</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-white/60 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.distance} km entfernt</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {profile.interests.slice(0, 2).map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80"
                    >
                      {interest}
                    </span>
                  ))}
                  {profile.interests.length > 2 && (
                    <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/60">
                      +{profile.interests.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Button */}
            <div className="mt-4 flex justify-end">
              <button className="glass-button px-4 py-2 rounded-full flex items-center space-x-2 text-sm">
                <MessageCircle className="w-4 h-4" />
                <span>Profil ansehen</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Detail Modal */}
      {selectedProfile && (
        <ProfileDetailModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
};

export default ProfileGallery;
