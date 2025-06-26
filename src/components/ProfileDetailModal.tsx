import React from 'react';
import { X, Heart, MessageCircle, Gift, Crown, Zap } from 'lucide-react';
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
  image: string;
  images?: string[];
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

  // Use multiple images if available, otherwise fallback to single image
  const images = profile.images && profile.images.length > 0 
    ? profile.images 
    : [profile.image].filter(Boolean);

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
    if (!user) {
      onAuthRequired?.();
      return;
    }

    // Nur für Stripe-Abonnements das Customer Portal öffnen
    if (!accessStatus?.hasStripeSubscription) {
      toast({
        title: "Nicht verfügbar",
        description: "Die Abonnement-Verwaltung ist nur für Stripe-Abonnements verfügbar.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Opening customer portal for user:', user.email);
      await customerPortal.mutateAsync();
      toast({
        title: "Kundenverwaltung geöffnet!",
        description: "Verwalte deine Abonnements im neuen Tab.",
      });
    } catch (error: any) {
      console.error('Customer portal error:', error);
      toast({
        title: "Fehler",
        description: error.message || "Kundenverwaltung konnte nicht geöffnet werden",
        variant: "destructive",
      });
    }
  };

  const handleUpgrade = async () => {
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
        title: "Upgrade zu Premium!",
        description: `Upgrade auf Premium für ${profile.name} im neuen Tab.`,
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Upgrade konnte nicht geöffnet werden",
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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in">
      <div className="profile-glass rounded-xl sm:rounded-2xl max-w-md w-full mx-4 max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
        {/* Header with Image Carousel - Fixed height */}
        <div className="relative flex-shrink-0">
          <ImageCarousel 
            images={images}
            alt={profile.name}
            className="w-full h-56 sm:h-72 rounded-t-xl sm:rounded-t-2xl overflow-hidden"
          />
          
          <button
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 glass w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 z-10 backdrop-blur-sm hover:scale-110 active:scale-95 animate-micro-bounce"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* NSFW badge - only show if nsfw is true */}
          {profile.nsfw && (
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-red-500/95 px-2 py-1 rounded backdrop-blur-sm border border-red-400/30 animate-fade-in">
              <span className="text-xs text-white font-bold">NSFW</span>
            </div>
          )}
          
          {/* Profile info overlay with better styling */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
            <div className="flex justify-between items-end">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white text-sharp mb-1 drop-shadow-lg">
                  {profile.name}, {profile.age}
                </h2>
                {profile.origin && (
                  <div className="text-white/90 drop-shadow-md">
                    <span className="text-sm sm:text-base font-medium">{profile.origin}</span>
                  </div>
                )}
              </div>
              
              {/* Price Badge with better styling */}
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-emerald-400/30 shadow-lg animate-pulse-soft">
                <span className="text-sm sm:text-base text-white font-bold drop-shadow-sm">
                  {profile.formattedPrice || `€${profile.price?.toFixed(2) || '3.99'}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content with better padding */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-8">
            {/* Profile Info Grid with improved styling */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
              {profile.height && (
                <div className="glass rounded-xl p-3 border border-white/10 hover:border-white/20 transition-colors duration-300">
                  <span className="text-white/60 text-xs font-medium block mb-1">Größe</span>
                  <div className="text-white font-semibold">{profile.height} cm</div>
                </div>
              )}
              {profile.origin && (
                <div className="glass rounded-xl p-3 border border-white/10 hover:border-white/20 transition-colors duration-300">
                  <span className="text-white/60 text-xs font-medium block mb-1">Herkunft</span>
                  <div className="text-white font-semibold">{profile.origin}</div>
                </div>
              )}
              {profile.nsfw !== undefined && (
                <div className="glass rounded-xl p-3 border border-white/10 hover:border-white/20 transition-colors duration-300">
                  <span className="text-white/60 text-xs font-medium block mb-1">Content</span>
                  <div className={`font-semibold ${profile.nsfw ? 'text-red-400' : 'text-emerald-400'}`}>
                    {profile.nsfw ? '18+ NSFW' : 'Safe Content'}
                  </div>
                </div>
              )}
              <div className="glass rounded-xl p-3 border border-white/10 hover:border-white/20 transition-colors duration-300">
                <span className="text-white/60 text-xs font-medium block mb-1">Status</span>
                <div className="text-white font-semibold flex items-center space-x-1">
                  <Heart className="w-3 h-3 text-purple-400" />
                  <span>Premium</span>
                </div>
              </div>
            </div>

            {/* Tags/Interests with improved styling */}
            {profile.interests.length > 0 && (
              <div>
                <h3 className="text-white font-bold mb-3 text-base sm:text-lg">Interessen & Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 glass rounded-full text-xs sm:text-sm text-purple-300 font-medium border border-purple-400/40 hover:border-purple-400/60 hover:bg-purple-400/10 transition-all duration-300 backdrop-blur-sm cursor-default hover:scale-105 animate-micro-bounce"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      #{interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Personality with improved styling */}
            {profile.personality && (
              <div>
                <h3 className="text-white font-bold mb-3 text-base sm:text-lg">Persönlichkeit</h3>
                <div className="glass rounded-xl p-4 border border-white/10 hover:border-white/15 transition-colors duration-300">
                  <p className="text-white/85 text-sm sm:text-base leading-relaxed">
                    {profile.personality}
                  </p>
                </div>
              </div>
            )}

            {/* Description with improved styling */}
            {profile.description && (
              <div>
                <h3 className="text-white font-bold mb-3 text-base sm:text-lg">Über mich</h3>
                <div className="glass rounded-xl p-4 border border-white/10 hover:border-white/15 transition-colors duration-300">
                  <p className="text-white/85 text-sm sm:text-base leading-relaxed">
                    {profile.description}
                  </p>
                </div>
              </div>
            )}

            {/* Subscription Status & Action with improved styling */}
            <div className="pt-4 border-t border-white/20">
              {!user ? (
                <div className="space-y-4">
                  <div className="text-center glass rounded-xl p-5 border border-white/10">
                    <p className="text-white/80 text-sm sm:text-base mb-3 font-medium">
                      Melde dich an, um mit {profile.name} zu chatten
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">
                      {profile.formattedPrice || `€${profile.price?.toFixed(2) || '3.99'} /Monat`}
                    </p>
                  </div>
                  <button
                    onClick={() => onAuthRequired?.()}
                    className="w-full glass-button py-4 rounded-xl text-white font-bold hover:bg-purple-600/30 transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base border border-purple-400/30 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-purple-500/20 animate-micro-bounce"
                  >
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Anmelden & Abonnieren</span>
                  </button>
                </div>
              ) : checkingSubscription ? (
                <div className="glass-button w-full py-4 rounded-xl text-center text-white/70 text-sm sm:text-base animate-pulse-soft">
                  Zugang wird geprüft...
                </div>
              ) : accessStatus?.hasAccess ? (
                <div className="space-y-4">
                  <div className="glass w-full py-4 rounded-xl text-center border border-white/10">
                    {accessStatus.subscriptionType === 'free' ? (
                      <div className="flex items-center justify-center space-x-2 text-emerald-400 animate-fade-in">
                        <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="text-sm sm:text-base font-semibold">✓ Kostenlos freigeschaltet - Sie können chatten!</span>
                      </div>
                    ) : accessStatus.subscriptionType === 'stripe' ? (
                      <div className="flex items-center justify-center space-x-2 text-emerald-400 animate-fade-in">
                        <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="text-sm sm:text-base font-semibold">✓ Premium Stripe-Abonnement aktiv!</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2 text-emerald-400 animate-fade-in">
                        <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="text-sm sm:text-base font-semibold">✓ Direktes Abonnement aktiv!</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={handleStartChat}
                      disabled={createChat.isPending}
                      className="w-full glass-button py-4 rounded-xl text-white font-bold hover:bg-blue-600/30 transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base border border-blue-400/30 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-blue-500/20 animate-micro-bounce"
                    >
                      <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span>
                        {createChat.isPending ? 'Chat wird erstellt...' : 'Chat starten'}
                      </span>
                    </button>
                    
                    {/* Verschiedene Buttons je nach Subscription-Typ */}
                    {accessStatus.hasStripeSubscription ? (
                      <button
                        onClick={handleManageSubscription}
                        disabled={customerPortal.isPending}
                        className="w-full glass-button py-3 rounded-xl text-white hover:bg-purple-600/30 transition-all duration-300 flex items-center justify-center space-x-2 border border-purple-400/30 hover:scale-105 active:scale-95 text-sm font-medium animate-micro-bounce"
                      >
                        <Crown className="w-4 h-4" />
                        <span>
                          {customerPortal.isPending ? 'Portal wird geöffnet...' : 'Stripe-Abonnement verwalten'}
                        </span>
                      </button>
                    ) : accessStatus.subscriptionType === 'free' ? (
                      <button
                        onClick={handleUpgrade}
                        disabled={subscribeToWoman.isPending}
                        className="w-full glass-button py-3 rounded-xl text-white hover:bg-yellow-600/30 transition-all duration-300 flex items-center justify-center space-x-2 border border-yellow-400/30 hover:scale-105 active:scale-95 text-sm font-medium animate-micro-bounce"
                      >
                        <Crown className="w-4 h-4" />
                        <span>
                          {subscribeToWoman.isPending ? 'Upgrade wird geöffnet...' : 'Upgrade zu Premium'}
                        </span>
                      </button>
                    ) : (
                      <div className="text-center text-white/60 text-sm">
                        Direktes Abonnement - Kontakt Administrator für Änderungen
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center glass rounded-xl p-5 border border-white/10">
                    <p className="text-white/80 text-sm sm:text-base mb-3 font-medium">
                      Abonnieren Sie {profile.name} für
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm mb-2">
                      {profile.formattedPrice || `€${profile.price?.toFixed(2) || '3.99'} /Monat`}
                    </p>
                    <p className="text-white/50 text-xs sm:text-sm">
                      Echte Stripe-Zahlung • Jederzeit kündbar
                    </p>
                  </div>
                  <button
                    onClick={handleSubscribe}
                    disabled={subscribeToWoman.isPending}
                    className="w-full glass-button py-4 rounded-xl text-white font-bold hover:bg-purple-600/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 text-sm sm:text-base border border-purple-400/30 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-purple-500/20 animate-micro-bounce"
                  >
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
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
    </div>
  );
};

export default ProfileDetailModal;
