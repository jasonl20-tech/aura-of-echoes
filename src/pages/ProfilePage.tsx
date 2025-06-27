
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Gift, Crown, Zap } from 'lucide-react';
import { useWoman } from '../hooks/useWomen';
import { useCheckSubscription, useSubscribeToWoman, useCustomerPortal } from '../hooks/useSubscriptions';
import { useCreateChat } from '../hooks/useChats';
import { useAuth } from '../hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import ImageCarousel from '../components/ImageCarousel';

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: woman, isLoading, error } = useWoman(id || '');
  const { data: accessStatus, isLoading: checkingSubscription } = useCheckSubscription(id || '');
  const subscribeToWoman = useSubscribeToWoman();
  const createChat = useCreateChat();
  const customerPortal = useCustomerPortal();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-6 sm:p-8 rounded-2xl animate-pulse">
          <div className="text-white text-center text-sm sm:text-base">Profil wird geladen...</div>
        </div>
      </div>
    );
  }

  if (error || !woman) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-6 sm:p-8 rounded-2xl">
          <div className="text-red-400 text-center text-sm sm:text-base">
            Profil konnte nicht geladen werden
          </div>
          <button
            onClick={() => navigate('/')}
            className="mt-4 glass-button px-4 py-2 rounded-xl text-white hover:bg-purple-600/30 transition-all duration-300"
          >
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    );
  }

  // Format price
  const formatPrice = (price: number, interval: string) => {
    const intervalMap = {
      daily: 'täglich',
      weekly: 'wöchentlich', 
      monthly: 'monatlich',
      yearly: 'jährlich'
    };
    return `€${price.toFixed(2)} ${intervalMap[interval as keyof typeof intervalMap] || 'monatlich'}`;
  };

  // Parse images
  let images = [];
  if (woman.images) {
    try {
      const parsedImages = typeof woman.images === 'string' 
        ? JSON.parse(woman.images) 
        : woman.images;
      if (Array.isArray(parsedImages)) {
        images = parsedImages.map((img: any) => img.url || img);
      }
    } catch (e) {
      console.warn('Error parsing images for woman:', woman.id, e);
    }
  }
  
  if (images.length === 0 && woman.image_url) {
    images = [woman.image_url];
  }

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!woman.id) return;
    
    try {
      await subscribeToWoman.mutateAsync({
        womanId: woman.id,
        womanName: woman.name,
        price: woman.price || 3.99
      });
      toast({
        title: "Stripe Checkout geöffnet!",
        description: `Komplettiere die Zahlung für ${woman.name} im neuen Tab.`,
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
      navigate('/auth');
      return;
    }

    if (!accessStatus?.hasStripeSubscription) {
      toast({
        title: "Nicht verfügbar",
        description: "Die Abonnement-Verwaltung ist nur für Stripe-Abonnements verfügbar.",
        variant: "destructive",
      });
      return;
    }

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

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!woman.id) return;
    
    try {
      await subscribeToWoman.mutateAsync({
        womanId: woman.id,
        womanName: woman.name,
        price: woman.price || 3.99
      });
      toast({
        title: "Upgrade zu Premium!",
        description: `Upgrade auf Premium für ${woman.name} im neuen Tab.`,
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
    if (!user || !woman.id) return;

    try {
      await createChat.mutateAsync({ womanId: woman.id });
      toast({
        title: "Chat gestartet!",
        description: `Chat mit ${woman.name} wurde erstellt.`,
      });
      navigate('/', { state: { activeTab: 'chats' } });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Chat konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
  };

  const formattedPrice = formatPrice(woman.price, woman.pricing_interval);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20">
      {/* Header with back button */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="glass w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white">{woman.name}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="glass rounded-2xl overflow-hidden">
          {/* Image Section */}
          <div className="relative">
            <ImageCarousel 
              images={images}
              alt={woman.name}
              className="w-full h-80 sm:h-96 overflow-hidden"
            />
            
            {/* NSFW badge */}
            {woman.nsfw && (
              <div className="absolute top-4 left-4 bg-red-500/95 px-3 py-1.5 rounded backdrop-blur-sm border border-red-400/30">
                <span className="text-sm text-white font-bold">NSFW</span>
              </div>
            )}
            
            {/* Price Badge */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 rounded-lg backdrop-blur-sm border border-emerald-400/30 shadow-lg">
              <span className="text-lg text-white font-bold">{formattedPrice}</span>
            </div>

            {/* Profile info overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
              <h2 className="text-3xl font-bold text-white mb-2">
                {woman.name}, {woman.age}
              </h2>
              {woman.origin && (
                <p className="text-white/90 text-lg">{woman.origin}</p>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Profile Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {woman.height && (
                <div className="glass rounded-xl p-4 text-center">
                  <span className="text-white/60 text-sm block mb-1">Größe</span>
                  <div className="text-white font-semibold text-lg">{woman.height} cm</div>
                </div>
              )}
              {woman.origin && (
                <div className="glass rounded-xl p-4 text-center">
                  <span className="text-white/60 text-sm block mb-1">Herkunft</span>
                  <div className="text-white font-semibold">{woman.origin}</div>
                </div>
              )}
              <div className="glass rounded-xl p-4 text-center">
                <span className="text-white/60 text-sm block mb-1">Content</span>
                <div className={`font-semibold ${woman.nsfw ? 'text-red-400' : 'text-emerald-400'}`}>
                  {woman.nsfw ? '18+ NSFW' : 'Safe'}
                </div>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <span className="text-white/60 text-sm block mb-1">Status</span>
                <div className="text-purple-400 font-semibold flex items-center justify-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>Premium</span>
                </div>
              </div>
            </div>

            {/* Interests */}
            {woman.interests && woman.interests.length > 0 && (
              <div>
                <h3 className="text-white font-bold mb-4 text-xl">Interessen & Tags</h3>
                <div className="flex flex-wrap gap-3">
                  {woman.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 glass rounded-full text-sm text-purple-300 font-medium border border-purple-400/40 hover:border-purple-400/60 hover:bg-purple-400/10 transition-all duration-300"
                    >
                      #{interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Personality */}
            {woman.personality && (
              <div>
                <h3 className="text-white font-bold mb-4 text-xl">Persönlichkeit</h3>
                <div className="glass rounded-xl p-6">
                  <p className="text-white/85 text-base leading-relaxed">
                    {woman.personality}
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            {woman.description && (
              <div>
                <h3 className="text-white font-bold mb-4 text-xl">Über mich</h3>
                <div className="glass rounded-xl p-6">
                  <p className="text-white/85 text-base leading-relaxed">
                    {woman.description}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-6 border-t border-white/20">
              {!user ? (
                <div className="space-y-4">
                  <div className="text-center glass rounded-xl p-6">
                    <p className="text-white/80 text-lg mb-4">
                      Melde dich an, um mit {woman.name} zu chatten
                    </p>
                    <p className="text-3xl font-bold text-white mb-2">{formattedPrice}</p>
                    <p className="text-white/50 text-sm">
                      Echte Stripe-Zahlung • Jederzeit kündbar
                    </p>
                  </div>
                  <Link
                    to="/auth"
                    className="w-full glass-button py-4 rounded-xl text-white font-bold hover:bg-purple-600/30 transition-all duration-300 flex items-center justify-center space-x-2 text-lg border border-purple-400/30"
                  >
                    <Heart className="w-6 h-6" />
                    <span>Anmelden & Abonnieren</span>
                  </Link>
                </div>
              ) : checkingSubscription ? (
                <div className="glass-button w-full py-4 rounded-xl text-center text-white/70 text-lg animate-pulse">
                  Zugang wird geprüft...
                </div>
              ) : accessStatus?.hasAccess ? (
                <div className="space-y-4">
                  <div className="glass w-full py-4 rounded-xl text-center border border-white/10">
                    {accessStatus.subscriptionType === 'free' ? (
                      <div className="flex items-center justify-center space-x-3 text-emerald-400">
                        <Gift className="w-6 h-6" />
                        <span className="text-lg font-semibold">✓ Kostenlos freigeschaltet - Sie können chatten!</span>
                      </div>
                    ) : accessStatus.subscriptionType === 'stripe' ? (
                      <div className="flex items-center justify-center space-x-3 text-emerald-400">
                        <Crown className="w-6 h-6" />
                        <span className="text-lg font-semibold">✓ Premium Stripe-Abonnement aktiv!</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-3 text-emerald-400">
                        <Zap className="w-6 h-6" />
                        <span className="text-lg font-semibold">✓ Direktes Abonnement aktiv!</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={handleStartChat}
                      disabled={createChat.isPending}
                      className="w-full glass-button py-4 rounded-xl text-white font-bold hover:bg-blue-600/30 transition-all duration-300 flex items-center justify-center space-x-3 text-lg border border-blue-400/30"
                    >
                      <MessageCircle className="w-6 h-6" />
                      <span>
                        {createChat.isPending ? 'Chat wird erstellt...' : 'Chat starten'}
                      </span>
                    </button>
                    
                    {accessStatus.hasStripeSubscription ? (
                      <button
                        onClick={handleManageSubscription}
                        disabled={customerPortal.isPending}
                        className="w-full glass-button py-3 rounded-xl text-white hover:bg-purple-600/30 transition-all duration-300 flex items-center justify-center space-x-2 border border-purple-400/30 font-medium"
                      >
                        <Crown className="w-5 h-5" />
                        <span>
                          {customerPortal.isPending ? 'Portal wird geöffnet...' : 'Stripe-Abonnement verwalten'}
                        </span>
                      </button>
                    ) : accessStatus.subscriptionType === 'free' ? (
                      <button
                        onClick={handleUpgrade}
                        disabled={subscribeToWoman.isPending}
                        className="w-full glass-button py-3 rounded-xl text-white hover:bg-yellow-600/30 transition-all duration-300 flex items-center justify-center space-x-2 border border-yellow-400/30 font-medium"
                      >
                        <Crown className="w-5 h-5" />
                        <span>
                          {subscribeToWoman.isPending ? 'Upgrade wird geöffnet...' : 'Upgrade zu Premium'}
                        </span>
                      </button>
                    ) : (
                      <div className="text-center text-white/60">
                        Direktes Abonnement - Kontakt Administrator für Änderungen
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center glass rounded-xl p-6">
                    <p className="text-white/80 text-lg mb-4">
                      Abonnieren Sie {woman.name} für
                    </p>
                    <p className="text-3xl font-bold text-white mb-2">{formattedPrice}</p>
                    <p className="text-white/50 text-sm">
                      Echte Stripe-Zahlung • Jederzeit kündbar
                    </p>
                  </div>
                  <button
                    onClick={handleSubscribe}
                    disabled={subscribeToWoman.isPending}
                    className="w-full glass-button py-4 rounded-xl text-white font-bold hover:bg-purple-600/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-3 text-lg border border-purple-400/30"
                  >
                    <Heart className="w-6 h-6" />
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

export default ProfilePage;
