
import React from 'react';
import { X, MapPin, Heart, Star, Crown } from 'lucide-react';

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

interface ProfileDetailModalProps {
  profile: Profile;
  onClose: () => void;
  onSubscribe: () => void;
}

const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({ profile, onClose, onSubscribe }) => {
  const handleStartChat = () => {
    if (profile.isSubscribed) {
      alert(`Chat mit ${profile.name} öffnen...`);
    } else {
      const confirmed = confirm(`Möchtest du ${profile.name} für 9,99€/Monat abonnieren?`);
      if (confirmed) {
        onSubscribe();
        alert(`Du hast ${profile.name} erfolgreich abonniert! Chat wird geöffnet...`);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="profile-glass rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header with close button */}
        <div className="relative">
          <img
            src={profile.image}
            alt={profile.name}
            className="w-full h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 glass-button rounded-full flex items-center justify-center hover:bg-white/20"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Subscription Badge */}
          {profile.isSubscribed && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-purple-700 px-3 py-2 rounded-xl backdrop-blur-sm">
              <span className="text-sm text-white font-bold">Abonniert</span>
            </div>
          )}

          {/* Profile name overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white text-glow">
                  {profile.name}, {profile.age}
                </h2>
                <div className="flex items-center space-x-2 text-white/90 mt-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">{profile.distance} km entfernt</span>
                </div>
              </div>
              <div className="flex items-center space-x-1 glass px-3 py-2 rounded-xl">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-lg font-bold text-white">4.8</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center text-sharp">
              <Heart className="w-5 h-5 text-purple-400 mr-2" />
              Über mich
            </h3>
            <p className="text-white/80 leading-relaxed">
              {profile.description}
            </p>
          </div>

          {/* Personality */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3 text-sharp">
              Persönlichkeit
            </h3>
            <p className="text-white/70 italic bg-white/5 p-3 rounded-xl">
              {profile.personality}
            </p>
          </div>

          {/* Interests */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3 text-sharp">
              Interessen
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-2 glass rounded-xl text-sm text-white font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Premium Features Hint - only show if not subscribed */}
          {!profile.isSubscribed && (
            <div className="glass rounded-2xl p-4 border border-purple-400/30">
              <div className="flex items-center space-x-2 mb-3">
                <Crown className="w-5 h-5 text-purple-400" />
                <span className="font-bold text-purple-300">Mit {profile.name} chatten</span>
              </div>
              <ul className="text-sm text-white/70 space-y-2">
                <li>• Unbegrenzte Nachrichten mit {profile.name}</li>
                <li>• Persönliche Sprachnachrichten</li>
                <li>• Priorität bei Antworten</li>
                <li>• Exklusive Inhalte von {profile.name}</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleStartChat}
              className={`w-full font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-xl ${
                profile.isSubscribed
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                  : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
              } text-white text-sharp`}
            >
              {profile.isSubscribed 
                ? `Chat mit ${profile.name} öffnen` 
                : `${profile.name} abonnieren – 9,99€/Monat`
              }
            </button>
            
            {!profile.isSubscribed && (
              <p className="text-center text-xs text-white/50">
                Individuelles Abo für {profile.name} • Jederzeit kündbar • Sichere Zahlung
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetailModal;
