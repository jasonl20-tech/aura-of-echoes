
import React from 'react';
import { X, Heart, MessageCircle, Settings, Gift } from 'lucide-react';
import { useCheckSubscription, useSubscribeToWoman, useCustomerPortal } from '../hooks/useSubscriptions';
import { useCreateChat } from '../hooks/useChats';
import { useAuth } from '../hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import ImageCarousel from './ImageCarousel';

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
  height?: number;
  origin?: string;
  nsfw?: boolean;
  formattedPrice?: string;
}

interface ProfileDetailModalProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  onAuthRequired?: () => void;
}

const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({ 
  profile, 
  isOpen, 
  onClose, 
  onAuthRequired 
}) => {
  const { user } = useAuth();
  const { data: accessStatus, isLoading: checkingSubscription } = useCheckSubscription(profile.womanId || '');
  const subscribeToWoman = useSubscribeToWoman();
  const createChat = useCreateChat();
  const customerPortal = useCustomerPortal();

  if (!isOpen) return null;

  // Create multiple images array (for now just duplicate the single image)
  const images = [profile.image, profile.image, profile.image].filter(Boolean);

  const handleSubscribe = async () => {
    if (!user) {
      onAuthRequired?.();
      return;
    }

    if (!profile.womanId) return;
    
    try {
      await subscribeToWoman.mutateAsync({
        womanId: profile.womanId,
        womanName: profile.name,
        price: profile.price || 3.99
      });
      toast({
        title: "Stripe Checkout geöffnet!",
        description: `Komplettiere die Zahlung für ${profile.name} im neuen Tab.`,
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Checkout konnte nicht geöffnet werden",
        variant: "destructive",
      });
    }
  };

  const handleManageSubscription = async () => {
    try {
      await customerPortal.mutateAsync();
      toast({
        title: "Kundenverwaltung geöffnet!",
        description: "Verwalte deine Abonnements im neuen Tab.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Kundenverwaltung konnte nicht geöffnet werden",
        variant: "destructive",
      });
    }
  };

  const handleStartChat = async () => {
    if (!user || !profile.womanId) return;

    try {
      await createChat.mutateAsync({ womanId: profile.womanId });
      toast({
        title: "Chat gestartet!",
        description: `Chat mit ${profile.name} wurde erstellt.`,
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Chat konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="profile-glass rounded-xl sm:rounded-2xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header with Image Carousel */}
        <div className="relative">
          <ImageCarousel 
            images={images}
            alt={profile.name}
            className="w-full h-48 sm:h-64 rounded-t-xl sm:rounded-t-2xl overflow-hidden"
          />
          
          <button
            onClick={onClose}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 glass w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* NSFW badge - only show if nsfw is true */}
          {profile.nsfw && (
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-red-500/90 px-2 py-1 rounded backdrop-blur-sm">
              <span className="text-xs text-white font-semibold">NSFW</span>
            </div>
          )}
          
          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white text-sharp mb-1">
                  {profile.name}, {profile.age}
                </h2>
                <div className="text-white/80">
                  {profile.origin && (
                    <span className="text-xs sm:text-sm">{profile.origin}</span>
                  )}
                </div>
              </div>
              
              {/* Price Badge */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-2 sm:px-3 py-1 rounded-lg backdrop-blur-sm">
                <span className="text-xs sm:text-sm text-white font-semibold">
                  {profile.formattedPrice || `€${profile.price?.toFixed(2) || '3.99'}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Profile Info Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
            {profile.height && (
              <div className="glass rounded-lg p-2">
                <span className="text-white/60 text-xs">Größe:</span>
                <div className="text-white font-medium">{profile.height} cm</div>
              </div>
            )}
            {profile.origin && (
              <div className="glass rounded-lg p-2">
                <span className="text-white/60 text-xs">Herkunft:</span>
                <div className="text-white font-medium">{profile.origin}</div>
              </div>
            )}
            {profile.nsfw !== undefined && (
              <div className="glass rounded-lg p-2">
                <span className="text-white/60 text-xs">Content:</span>
                <div className={`font-medium ${profile.nsfw ? 'text-red-400' : 'text-green-400'}`}>
                  {profile.nsfw ? '18+ NSFW' : 'Safe'}
                </div>
              </div>
            )}
            <div className="glass rounded-lg p-2">
              <span className="text-white/60 text-xs">Status:</span>
              <div className="text-white font-medium flex items-center space-x-1">
                <Heart className="w-3 h-3 text-purple-400" />
                <span>Premium</span>
              </div>
            </div>
          </div>

          {/* Tags/Interests */}
          {profile.interests.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm sm:text-base">Tags & Interessen</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-2 sm:px-3 py-1 glass rounded-full text-xs sm:text-sm text-purple-300 font-medium border border-purple-400/30"
                  >
                    #{interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Personality */}
          {profile.personality && (
            <div>
              <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Persönlichkeit</h3>
              <div className="glass rounded-lg p-3">
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                  {profile.personality}
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          {profile.description && (
            <div>
              <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Über mich</h3>
              <div className="glass rounded-lg p-3">
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                  {profile.description}
                </p>
              </div>
            </div>
          )}

          {/* Subscription Status & Action */}
          <div className="pt-4 border-t border-white/10">
            {!user ? (
              <div className="space-y-3">
                <div className="text-center glass rounded-lg p-4">
                  <p className="text-white/70 text-xs sm:text-sm mb-2">
                    Melde dich an, um mit {profile.name} zu chatten
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {profile.formattedPrice || `€${profile.price?.toFixed(2) || '3.99'} /Monat`}
                  </p>
                </div>
                <button
                  onClick={() => onAuthRequired?.()}
                  className="w-full glass-button py-3 rounded-xl text-white font-semibold hover:bg-purple-600/30 transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Anmelden & Abonnieren</span>
                </button>
              </div>
            ) : checkingSubscription ? (
              <div className="glass-button w-full py-3 rounded-xl text-center text-white/70 text-sm sm:text-base">
                Zugang wird geprüft...
              </div>
            ) : accessStatus?.hasAccess ? (
              <div className="space-y-3">
                <div className="glass w-full py-3 rounded-xl text-center">
                  {accessStatus.hasFreeAccess && !accessStatus.hasSubscription ? (
                    <div className="flex items-center justify-center space-x-2 text-green-400">
                      <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">✓ Kostenlos freigeschaltet - Sie können chatten!</span>
                    </div>
                  ) : (
                    <span className="text-green-400 text-sm sm:text-base">✓ Aktives Abonnement - Sie können chatten!</span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={handleStartChat}
                    disabled={createChat.isPending}
                    className="flex-1 glass-button py-3 rounded-xl text-white font-semibold hover:bg-blue-600/30 transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>
                      {createChat.isPending ? 'Chat wird erstellt...' : 'Chat starten'}
                    </span>
                  </button>
                  {accessStatus.hasSubscription && (
                    <button
                      onClick={handleManageSubscription}
                      disabled={customerPortal.isPending}
                      className="glass-button px-4 py-3 rounded-xl text-white hover:bg-purple-600/30 transition-all duration-300 flex items-center justify-center"
                      title="Abonnement verwalten"
                    >
                      <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center glass rounded-lg p-4">
                  <p className="text-white/70 text-xs sm:text-sm mb-2">
                    Abonnieren Sie {profile.name} für
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {profile.formattedPrice || `€${profile.price?.toFixed(2) || '3.99'} /Monat`}
                  </p>
                  <p className="text-white/50 text-[10px] sm:text-xs mt-2">
                    Echte Stripe-Zahlung • Jederzeit kündbar
                  </p>
                </div>
                <button
                  onClick={handleSubscribe}
                  disabled={subscribeToWoman.isPending}
                  className="w-full glass-button py-3 rounded-xl text-white font-semibold hover:bg-purple-600/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>
                    {subscribeToWoman.isPending ? 'Checkout wird geöffnet...' : 'Jetzt abonnieren (Stripe)'}
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
