
import React from 'react';
import { X, MapPin, Star, Heart } from 'lucide-react';
import { useCheckSubscription, useSubscribeToWoman } from '../hooks/useSubscriptions';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: number;
  name: string;
  age: number;
  interests: string[];
  distance: number;
  image: string;
  description: string;
  personality: string;
  price?: number;
  womanId?: string;
}

interface ProfileDetailModalProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
}

const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({ profile, isOpen, onClose }) => {
  const { data: hasSubscription, isLoading: checkingSubscription } = useCheckSubscription(profile.womanId || '');
  const subscribeToWoman = useSubscribeToWoman();

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    if (!profile.womanId) return;
    
    try {
      await subscribeToWoman.mutateAsync(profile.womanId);
      toast({
        title: "Abonnement erfolgreich!",
        description: `Sie können jetzt mit ${profile.name} chatten.`,
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Abonnement fehlgeschlagen",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="profile-glass rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative">
          <img
            src={profile.image}
            alt={profile.name}
            className="w-full h-64 object-cover rounded-t-2xl"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 glass w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-bold text-white text-sharp mb-1">
              {profile.name}, {profile.age}
            </h2>
            <div className="flex items-center space-x-4 text-white/80">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{profile.distance} km</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm">4.8</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Personality */}
          <div>
            <h3 className="text-white font-semibold mb-2">Persönlichkeit</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              {profile.personality}
            </p>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-white font-semibold mb-2">Über mich</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              {profile.description}
            </p>
          </div>

          {/* Interests */}
          <div>
            <h3 className="text-white font-semibold mb-3">Interessen</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 glass rounded-full text-sm text-white/80"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Subscription Status & Action */}
          <div className="pt-4 border-t border-white/10">
            {checkingSubscription ? (
              <div className="glass-button w-full py-3 rounded-xl text-center text-white/70">
                Wird geprüft...
              </div>
            ) : hasSubscription ? (
              <div className="glass w-full py-3 rounded-xl text-center text-green-400">
                ✓ Abonniert - Sie können jetzt chatten!
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-white/70 text-sm mb-2">
                    Abonnieren Sie {profile.name} für
                  </p>
                  <p className="text-2xl font-bold text-white">
                    €{profile.price?.toFixed(2)} <span className="text-sm text-white/60">/Monat</span>
                  </p>
                </div>
                <button
                  onClick={handleSubscribe}
                  disabled={subscribeToWoman.isPending}
                  className="w-full glass-button py-3 rounded-xl text-white font-semibold hover:bg-purple-600/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Heart className="w-5 h-5" />
                  <span>
                    {subscribeToWoman.isPending ? 'Wird abonniert...' : 'Jetzt abonnieren'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetailModal;
