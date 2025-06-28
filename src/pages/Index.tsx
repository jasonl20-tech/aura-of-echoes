import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Settings, MessageCircle, Users, Shuffle, Heart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useMobileNavigation } from '../hooks/useMobileNavigation';
import { useGlobalMessageNotifications } from '../hooks/useGlobalMessageNotifications';
import ProfileGallery from '../components/ProfileGallery';
import SwipeView from '../components/SwipeView';
import ChatView from '../components/ChatView';
import ChatsList from '../components/ChatsList';
import SettingsView from '../components/SettingsView';
import AdminDashboard from '../components/AdminDashboard';
import LikedProfilesView from '../components/LikedProfilesView';
import AuthModal from '../components/AuthModal';

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedWomanId, setSelectedWomanId] = useState<string | null>(null);
  const [selectedWomanName, setSelectedWomanName] = useState<string | null>(null);
  const { user, loading } = useAuth();

  // Initialize mobile navigation with exit confirmation
  useMobileNavigation();

  // Initialize global message notifications
  useGlobalMessageNotifications({ currentChatId: selectedChatId });

  // Determine active tab from URL
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path === '/' || path === '/profiles') return 'profiles';
    if (path === '/liked') return 'liked';
    if (path === '/chats') return 'chats';
    if (path.startsWith('/chats/')) return 'chats';
    if (path === '/random') return 'random';
    if (path === '/settings') return 'settings';
    if (path === '/admin') return 'admin';
    return 'profiles';
  };

  const activeTab = getActiveTabFromPath();

  // Handle chat route parameters
  useEffect(() => {
    if (location.pathname.startsWith('/chats/')) {
      const chatId = location.pathname.split('/chats/')[1];
      const state = location.state as any;
      if (chatId && state?.womanId && state?.womanName) {
        setSelectedChatId(chatId);
        setSelectedWomanId(state.womanId);
        setSelectedWomanName(state.womanName);
      }
    } else {
      setSelectedChatId(null);
      setSelectedWomanId(null);
      setSelectedWomanName(null);
    }
  }, [location.pathname, location.state]);

  const isInChat = selectedChatId && selectedWomanName && activeTab === 'chats';

  const handleTabChange = (tab: string) => {
    // Chat Tab requires authentication
    if (tab === 'chats' && !user) {
      setShowAuthModal(true);
      return;
    }
    
    // Navigate to the appropriate route
    const routes = {
      profiles: '/profiles',
      liked: '/liked',
      chats: '/chats',
      random: '/random',
      settings: '/settings'
    };
    
    navigate(routes[tab as keyof typeof routes] || '/profiles');
  };

  const handleChatSelect = (chatId: string, womanId: string, womanName: string) => {
    navigate(`/chats/${chatId}`, {
      state: { womanId, womanName }
    });
  };

  const handleBackToChats = () => {
    navigate('/chats');
  };

  const handleNavigateToAdmin = () => {
    navigate('/admin');
  };

  const handleBackFromAdmin = () => {
    navigate('/settings');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profiles':
        return <ProfileGallery onAuthRequired={() => setShowAuthModal(true)} />;
      case 'liked':
        return <LikedProfilesView />;
      case 'chats':
        if (!user) {
          return <ProfileGallery onAuthRequired={() => setShowAuthModal(true)} />;
        }
        if (selectedChatId && selectedWomanId && selectedWomanName) {
          return (
            <ChatView 
              chatId={selectedChatId} 
              womanId={selectedWomanId}
              womanName={selectedWomanName}
              onBack={handleBackToChats}
            />
          );
        }
        return <ChatsList onChatSelect={handleChatSelect} />;
      case 'settings':
        return <SettingsView onAuthRequired={() => setShowAuthModal(true)} onNavigateToAdmin={handleNavigateToAdmin} />;
      case 'random':
        return <SwipeView />;
      case 'admin':
        return <AdminDashboard onBack={handleBackFromAdmin} />;
      default:
        return <ProfileGallery onAuthRequired={() => setShowAuthModal(true)} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-6 sm:p-8 rounded-2xl animate-pulse">
          <div className="text-white text-center text-sm sm:text-base">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Subtle background elements - nur wenn nicht im Chat */}
      {!isInChat && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-24 sm:w-32 h-24 sm:h-32 bg-purple-600/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-40 right-16 w-16 sm:w-24 h-16 sm:h-24 bg-purple-500/8 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
      )}

      {/* Main Content - now takes full height */}
      <main className={`flex-1 ${isInChat ? '' : 'px-3 sm:px-4 py-4 sm:py-6 max-w-md mx-auto w-full pb-20 sm:pb-24'}`}>
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </main>

      {/* Bottom Navigation - verstecken wenn im Chat oder Admin */}
      {!isInChat && activeTab !== 'admin' && (
        <nav className="fixed bottom-0 left-0 right-0 nav-glass z-50 safe-area-bottom animate-slide-up">
          <div className="flex justify-around items-center max-w-md mx-auto px-4 py-4 relative h-16">
            {/* Modern navigation indicator */}
            <div 
              className={`nav-indicator transition-all duration-500 ease-out ${
                activeTab === 'profiles' ? 'left-[4%] w-[18.4%]' :
                activeTab === 'liked' ? 'left-[22.4%] w-[18.4%]' :
                activeTab === 'chats' ? 'left-[40.8%] w-[18.4%]' :
                activeTab === 'random' ? 'left-[59.2%] w-[18.4%]' :
                activeTab === 'settings' ? 'left-[77.6%] w-[18.4%]' : ''
              }`}
            />
            
            <button
              onClick={() => handleTabChange('profiles')}
              className={`flex flex-col items-center justify-center space-y-1 p-3 rounded-2xl transition-all duration-300 relative z-10 w-12 h-12 ${
                activeTab === 'profiles'
                  ? 'text-white scale-110'
                  : 'text-white/60 hover:text-white/90 hover:scale-105'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-tight leading-none">Profiles</span>
            </button>

            <button
              onClick={() => handleTabChange('liked')}
              className={`flex flex-col items-center justify-center space-y-1 p-3 rounded-2xl transition-all duration-300 relative z-10 w-12 h-12 ${
                activeTab === 'liked'
                  ? 'text-white scale-110'
                  : 'text-white/60 hover:text-white/90 hover:scale-105'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-tight leading-none">Liked</span>
            </button>
            
            <button
              onClick={() => handleTabChange('chats')}
              className={`flex flex-col items-center justify-center space-y-1 p-3 rounded-2xl transition-all duration-300 relative z-10 w-12 h-12 ${
                activeTab === 'chats'
                  ? 'text-white scale-110'
                  : 'text-white/60 hover:text-white/90 hover:scale-105'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-tight leading-none">Chats</span>
              {!user && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
            </button>
            
            <button
              onClick={() => handleTabChange('random')}
              className={`flex flex-col items-center justify-center space-y-1 p-3 rounded-2xl transition-all duration-300 relative z-10 w-12 h-12 ${
                activeTab === 'random'
                  ? 'text-white scale-110'
                  : 'text-white/60 hover:text-white/90 hover:scale-105'
              }`}
            >
              <Shuffle className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-tight leading-none">Random</span>
            </button>
            
            <button
              onClick={() => handleTabChange('settings')}
              className={`flex flex-col items-center justify-center space-y-1 p-3 rounded-2xl transition-all duration-300 relative z-10 w-12 h-12 ${
                activeTab === 'settings'
                  ? 'text-white scale-110'
                  : 'text-white/60 hover:text-white/90 hover:scale-105'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-tight leading-none">Settings</span>
              {!user && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
            </button>
          </div>
        </nav>
      )}

      {/* Back button for Admin Dashboard */}
      {activeTab === 'admin' && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-4 animate-fade-in">
          <button
            onClick={() => navigate('/settings')}
            className="glass-button px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-white font-semibold hover:bg-purple-600/30 transition-all duration-300 text-sm sm:text-base hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-purple-500/20 animate-micro-bounce"
          >
            ← Back to Settings
          </button>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};

export default Index;
