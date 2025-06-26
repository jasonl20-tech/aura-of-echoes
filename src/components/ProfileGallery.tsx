import React, { useState } from 'react';
import ProfileCard from './ProfileCard';
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

const ProfileGallery: React.FC<{ isRandom?: boolean }> = ({ isRandom = false }) => {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const profiles: Profile[] = [
    {
      id: 1,
      name: "Emma",
      age: 24,
      interests: ["Fitness", "Reisen", "Kochen", "Musik", "Yoga"],
      distance: 2,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=600&fit=crop",
      description: "Ich liebe es, neue Orte zu entdecken und Menschen kennenzulernen. Fitness ist meine Leidenschaft und ich koche gerne für Freunde.",
      personality: "Lebensfroh, abenteuerlustig und immer für Spaß zu haben!",
      isSubscribed: true
    },
    {
      id: 2,
      name: "Sophie",
      age: 22,
      interests: ["Kunst", "Fotografie", "Kaffee", "Bücher"],
      distance: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop",
      description: "Kreative Seele mit einer Leidenschaft für Fotografie und Kunst. Verbringe gerne Zeit in Cafés mit einem guten Buch.",
      personality: "Nachdenklich, kreativ und ein bisschen verträumt.",
      isSubscribed: false
    },
    {
      id: 3,
      name: "Lisa",
      age: 26,
      interests: ["Tanzen", "Mode", "Wellness", "Filme"],
      distance: 3,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop",
      description: "Tänzerin mit einer Vorliebe für Mode und Wellness. Liebe es, gemütliche Filmabende zu verbringen.",
      personality: "Elegant, selbstbewusst und voller Energie.",
      isSubscribed: false
    },
    {
      id: 4,
      name: "Anna",
      age: 23,
      interests: ["Natur", "Wandern", "Tiere", "Meditation"],
      distance: 7,
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop",
      description: "Naturliebhaberin, die gerne wandert und Zeit mit Tieren verbringt. Meditation hilft mir, zur Ruhe zu kommen.",
      personality: "Ruhig, naturverbunden und sehr einfühlsam.",
      isSubscribed: false
    },
    {
      id: 5,
      name: "Mia",
      age: 25,
      interests: ["Gaming", "Technologie", "Anime", "Coding"],
      distance: 4,
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop",
      description: "Tech-begeisterte Gamerin mit einer Schwäche für Anime. Programmiere in meiner Freizeit und liebe komplexe Herausforderungen.",
      personality: "Intelligent, verspielt und immer neugierig auf neue Technologien.",
      isSubscribed: false
    },
    {
      id: 6,
      name: "Julia",
      age: 27,
      interests: ["Business", "Networking", "Wine", "Travel"],
      distance: 6,
      image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop",
      description: "Erfolgreiche Unternehmerin mit einer Leidenschaft für guten Wein und Reisen. Networking ist mein zweiter Vorname.",
      personality: "Ambitioniert, charismatisch und weltoffen.",
      isSubscribed: true
    }
  ];

  const handleSubscribe = (profileId: number) => {
    console.log(`Subscribing to profile ${profileId}`);
  };

  const displayedProfiles = isRandom ? [...profiles].sort(() => Math.random() - 0.5) : profiles;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white text-sharp mb-2">
          {isRandom ? 'Zufällige Profile' : 'Entdecke neue Personen'}
        </h2>
        <p className="text-white/60 text-sm">
          {isRandom ? 'Überraschende Begegnungen warten' : 'Finde deine perfekte Verbindung'}
        </p>
      </div>

      {/* Profile Grid */}
      <div className="grid grid-cols-2 gap-4">
        {displayedProfiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onClick={() => setSelectedProfile(profile)}
          />
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
