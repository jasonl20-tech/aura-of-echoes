
import React from 'react';
import { Heart } from 'lucide-react';

const LikedProfilesView: React.FC = () => {
  // Placeholder für gelikte Profile - kann später mit echten Daten erweitert werden
  const likedProfiles: any[] = [];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Heart className="w-6 h-6 text-red-400" />
          <h2 className="text-2xl font-bold text-white">Gelikte Profile</h2>
          <Heart className="w-6 h-6 text-red-400" />
        </div>
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
