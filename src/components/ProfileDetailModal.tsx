
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
      // User is already subscribed to this profile
      alert(`Chat mit ${profile.name} öffnen...`);
      // Here you would navigate to the chat with this specific person
    } else {
      // Start subscription process for this specific profile
      const confirmed = confirm(`Möchtest du ${profile.name} für 9,99€/Monat abonnieren?`);
      if (confirmed) {
        onSubscribe();
        alert(`Du hast ${profile.name} erfolgreich abonniert! Chat wird geöffnet...`);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header with close button */}
        <div className="relative">
          <img
            src={profile.image}
            alt={profile.name}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 glass-button rounded-full flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Subscription Badge */}
          {profile.isSubscribed && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-purple-500 px-3 py-1 rounded-full">
              <span className="text-sm text-white font-semibold">Abonniert</span>
            </div>
          )}

          {/* Profile name overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white text-glow">
                  {profile.name}, {profile.age}
                </h2>
                <div className="flex items-center space-x-1 text-white/80 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{profile.distance} km entfernt</span>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-yellow-400">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-lg font-semibold">4.8</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Heart className="w-5 h-5 text-pink-400 mr-2" />
              Über mich
            </h3>
            <p className="text-white/80 leading-relaxed">
              {profile.description}
            </p>
          </div>

          {/* Personality */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Persönlichkeit
            </h3>
            <p className="text-white/70 italic">
              {profile.personality}
            </p>
          </div>

          {/* Interests */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Interessen
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 glass-button rounded-full text-sm text-white"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Premium Features Hint - only show if not subscribed */}
          {!profile.isSubscribed && (
            <div className="glass rounded-lg p-4 border border-yellow-400/30">
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold text-yellow-400">Mit {profile.name} chatten</span>
              </div>
              <ul className="text-sm text-white/70 space-y-1">
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
              className={`w-full font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg ${
                profile.isSubscribed
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                  : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'
              } text-white`}
            >
              {profile.isSubscribed 
                ? `Chat mit ${profile.name} öffnen` 
                : `${profile.name} abonnieren – 9,99€/Monat`
              }
            </button>
            
            {!profile.isSubscribed && (
              <p className="text-center text-xs text-white/60">
                Individuelles Abo für {profile.name} • Jederzeit kündbar • Sichere Zahlung via Stripe
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetailModal;
