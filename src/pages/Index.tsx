import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Settings, MessageCircle, Users, Shuffle, Heart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
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
  const [activeTab, setActiveTab] = useState('profiles');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedWomanId, setSelectedWomanId] = useState<string | null>(null);
  const [selectedWomanName, setSelectedWomanName] = useState<string | null>(null);
  const { user, loading } = useAuth();

  // Handle navigation from profile page
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const isInChat = selectedChatId && selectedWomanName && activeTab === 'chats';

  const handleTabChange = (tab: string) => {
    // Chat Tab requires authentication
    if (tab === 'chats' && !user) {
      setShowAuthModal(true);
      return;
    }
    
    // Reset chat selection when switching tabs
    if (tab !== 'chats') {
      setSelectedChatId(null);
      setSelectedWomanId(null);
      setSelectedWomanName(null);
    }
    
    setActiveTab(tab);
  };

  const handleChatSelect = (chatId: string, womanId: string, womanName: string) => {
    setSelectedChatId(chatId);
    setSelectedWomanId(womanId);
    setSelectedWomanName(womanName);
  };

  const handleBackToChats = () => {
    setSelectedChatId(null);
    setSelectedWomanId(null);
    setSelectedWomanName(null);
  };

  const handleNavigateToAdmin = () => {
    setActiveTab('admin');
  };

  const handleBackFromAdmin = () => {
    setActiveTab('settings');
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
          <div className="text-white text-center text-sm sm:text-base">Wird geladen...</div>
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
          <div className="flex justify-around max-w-md mx-auto px-1 py-2 sm:py-3 relative">
            {/* Enhanced moving cloud indicator */}
            <div 
              className={`absolute top-1.5 bottom-1.5 nav-cloud transition-all duration-500 ease-out animate-glow-pulse ${
                activeTab === 'profiles' ? 'left-1 w-[calc(20%-8px)]' :
                activeTab === 'liked' ? 'left-[calc(20%-2px)] w-[calc(20%-8px)]' :
                activeTab === 'chats' ? 'left-[calc(40%-2px)] w-[calc(20%-8px)]' :
                activeTab === 'random' ? 'left-[calc(60%-2px)] w-[calc(20%-8px)]' :
                activeTab === 'settings' ? 'left-[calc(80%-2px)] w-[calc(20%-8px)]' : ''
              }`}
            />
            
            <button
              onClick={() => setActiveTab('profiles')}
              className={`flex flex-col items-center space-y-1 p-1.5 sm:p-2 rounded-xl transition-all duration-300 relative z-10 hover:scale-110 active:scale-95 animate-micro-bounce ${
                activeTab === 'profiles'
                  ? 'text-white drop-shadow-lg'
                  : 'text-white/60 hover:text-white/90'
              }`}
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[9px] sm:text-xs font-medium">Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('liked')}
              className={`flex flex-col items-center space-y-1 p-1.5 sm:p-2 rounded-xl transition-all duration-300 relative z-10 hover:scale-110 active:scale-95 animate-micro-bounce ${
                activeTab === 'liked'
                  ? 'text-white drop-shadow-lg'
                  : 'text-white/60 hover:text-white/90'
              }`}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[9px] sm:text-xs font-medium">Geliked</span>
            </button>
            
            <button
              onClick={() => handleTabChange('chats')}
              className={`flex flex-col items-center space-y-1 p-1.5 sm:p-2 rounded-xl transition-all duration-300 relative z-10 hover:scale-110 active:scale-95 ${
                activeTab === 'chats'
                  ? 'text-white drop-shadow-lg'
                  : 'text-white/60 hover:text-white/90'
              }`}
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[9px] sm:text-xs font-medium">Chats</span>
              {!user && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse-soft"></div>}
            </button>
            
            <button
              onClick={() => setActiveTab('random')}
              className={`flex flex-col items-center space-y-1 p-1.5 sm:p-2 rounded-xl transition-all duration-300 relative z-10 hover:scale-110 active:scale-95 ${
                activeTab === 'random'
                  ? 'text-white drop-shadow-lg'
                  : 'text-white/60 hover:text-white/90'
              }`}
            >
              <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[9px] sm:text-xs font-medium">Zufall</span>
            </button>
            
            <button
              onClick={() => handleTabChange('settings')}
              className={`flex flex-col items-center space-y-1 p-1.5 sm:p-2 rounded-xl transition-all duration-300 relative z-10 hover:scale-110 active:scale-95 ${
                activeTab === 'settings'
                  ? 'text-white drop-shadow-lg'
                  : 'text-white/60 hover:text-white/90'
              }`}
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[9px] sm:text-xs font-medium">Settings</span>
              {!user && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse-soft"></div>}
            </button>
          </div>
        </nav>
      )}

      {/* Back button for Admin Dashboard */}
      {activeTab === 'admin' && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-4 animate-fade-in">
          <button
            onClick={() => setActiveTab('settings')}
            className="glass-button px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-white font-semibold hover:bg-purple-600/30 transition-all duration-300 text-sm sm:text-base hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-purple-500/20 animate-micro-bounce"
          >
            ← Zurück zu Einstellungen
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
