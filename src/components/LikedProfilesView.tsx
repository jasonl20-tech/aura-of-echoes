
import React from 'react';
import { Heart } from 'lucide-react';

const LikedProfilesView: React.FC = () => {
  // Placeholder für geliked Profile - kann später mit echten Daten erweitert werden
  const likedProfiles: any[] = [];

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
        <p className="text-white/60 text-sm">Hier siehst du alle Profile, die du geliked hast</p>
      </div>

      {likedProfiles.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl text-white/70 mb-2">Noch keine Likes</h3>
          <p className="text-white/50 text-sm max-w-sm mx-auto leading-relaxed">
            Gehe zu den Profilen oder verwende den Zufall-Tab, um Profile zu liken und sie hier zu sammeln.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
          {/* Hier würden die gelikten Profile angezeigt werden */}
        </div>
      )}
    </div>
  );
};

export default LikedProfilesView;
