
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
  isSubscribed?: boolean;
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
    personality: "Aufgeschlossen, kreativ und abenteuerlustig",
    isSubscribed: false
  },
  {
    id: 2,
    name: "Sophia",
    age: 28,
    interests: ["Yoga", "Musik", "Bücher"],
    distance: 8,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop",
    description: "Hi, ich bin Sophia! Entspannung durch Yoga und gute Musik sind meine Leidenschaft. Ich lese gerne und teile meine Gedanken über das Leben.",
    personality: "Ruhig, nachdenklich und empathisch",
    isSubscribed: false
  },
  {
    id: 3,
    name: "Luna",
    age: 23,
    interests: ["Gaming", "Anime", "Technologie"],
    distance: 12,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop",
    description: "Hey! Ich bin Luna und eine echte Gamerin. Ich liebe Anime und alles was mit Technologie zu tun hat. Lass uns über unsere Lieblingsspiele sprechen!",
    personality: "Spielerisch, intelligent und witzig",
    isSubscribed: false
  },
  {
    id: 4,
    name: "Maya",
    age: 26,
    interests: ["Fitness", "Gesundheit", "Natur"],
    distance: 3,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop",
    description: "Hallo, ich bin Maya! Ein gesunder Lebensstil und die Natur sind mir sehr wichtig. Ich trainiere gerne und genieße Spaziergänge im Freien.",
    personality: "Energisch, motiviert und naturverbunden",
    isSubscribed: false
  },
  {
    id: 5,
    name: "Aria",
    age: 24,
    interests: ["Kunst", "Theater", "Poesie"],
    distance: 7,
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop",
    description: "Ich bin Aria und lebe für die Kunst. Theater und Poesie sind meine Leidenschaft. Ich glaube an die Macht der Worte und kreativen Ausdrucks.",
    personality: "Künstlerisch, sensibel und tiefgreifend",
    isSubscribed: false
  },
  {
    id: 6,
    name: "Zara",
    age: 27,
    interests: ["Mode", "Design", "Shopping"],
    distance: 15,
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop",
    description: "Hi, ich bin Zara! Mode ist meine Welt und Design meine Sprache. Ich liebe es, Trends zu setzen und meinen eigenen Stil zu kreieren.",
    personality: "Stylish, selbstbewusst und trendbewusst",
    isSubscribed: false
  }
];

interface ProfileGalleryProps {
  isRandom?: boolean;
}

const ProfileGallery: React.FC<ProfileGalleryProps> = ({ isRandom = false }) => {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [currentProfiles, setCurrentProfiles] = useState(mockProfiles);
  const [subscribedProfiles, setSubscribedProfiles] = useState<number[]>([]);

  const handleRandomize = () => {
    const shuffled = [...mockProfiles].sort(() => Math.random() - 0.5);
    setCurrentProfiles(shuffled);
  };

  const handleSubscribe = (profileId: number) => {
    // Mock subscription logic
    setSubscribedProfiles(prev => [...prev, profileId]);
    setCurrentProfiles(prev => prev.map(profile => 
      profile.id === profileId ? { ...profile, isSubscribed: true } : profile
    ));
  };

  React.useEffect(() => {
    if (isRandom) {
      handleRandomize();
    }
  }, [isRandom]);

  return (
    <div className="space-y-6">
      {/* Header - removed as requested */}
      {isRandom && (
        <div className="text-center">
          <button
            onClick={handleRandomize}
            className="glass-button px-4 py-2 rounded-full text-sm text-white/80"
          >
            Neu mischen
          </button>
        </div>
      )}

      {/* Profile Grid - 2 per row */}
      <div className="grid grid-cols-2 gap-4">
        {currentProfiles.map((profile, index) => (
          <div
            key={profile.id}
            className="glass-card rounded-2xl p-3 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedProfile(profile)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Profile Image */}
            <div className="relative mb-3">
              <img
                src={profile.image}
                alt={profile.name}
                className="w-full h-32 rounded-xl object-cover border-2 border-white/20"
              />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white/50"></div>
              {subscribedProfiles.includes(profile.id) && (
                <div className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-purple-500 px-2 py-1 rounded-full">
                  <span className="text-xs text-white font-semibold">Premium</span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white truncate">
                  {profile.name}, {profile.age}
                </h3>
                <div className="flex items-center space-x-1 text-yellow-400">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs">4.8</span>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-white/60 text-xs">
                <MapPin className="w-3 h-3" />
                <span>{profile.distance} km</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {profile.interests.slice(0, 2).map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/80"
                  >
                    {interest}
                  </span>
                ))}
              </div>

              {/* Action Button */}
              <button 
                className="w-full glass-button px-3 py-2 rounded-xl flex items-center justify-center space-x-2 text-xs mt-3"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProfile(profile);
                }}
              >
                <MessageCircle className="w-3 h-3" />
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
          onSubscribe={() => handleSubscribe(selectedProfile.id)}
        />
      )}
    </div>
  );
};

export default ProfileGallery;
