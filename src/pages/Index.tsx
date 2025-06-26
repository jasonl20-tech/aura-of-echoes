
import React, { useState } from 'react';
import { Heart, Settings, MessageCircle, Users, Shuffle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ProfileGallery from '../components/ProfileGallery';
import ChatView from '../components/ChatView';
import SettingsView from '../components/SettingsView';
import AuthModal from '../components/AuthModal';

const Index = () => {
  const [activeTab, setActiveTab] = useState('profiles');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading } = useAuth();

  const handleTabChange = (tab: string) => {
    // Chat Tab requires authentication
    if (tab === 'chats' && !user) {
      setShowAuthModal(true);
      return;
    }
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profiles':
        return <ProfileGallery onAuthRequired={() => setShowAuthModal(true)} />;
      case 'chats':
        return user ? <ChatView /> : <ProfileGallery onAuthRequired={() => setShowAuthModal(true)} />;
      case 'settings':
        return <SettingsView onAuthRequired={() => setShowAuthModal(true)} />;
      case 'random':
        return <ProfileGallery isRandom onAuthRequired={() => setShowAuthModal(true)} />;
      default:
        return <ProfileGallery onAuthRequired={() => setShowAuthModal(true)} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="text-white text-center">Wird geladen...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Header with user info */}
      <header className="p-4 flex justify-between items-center">
        <div className="text-white/70 text-sm">
          {user ? `Willkommen, ${user.email}` : 'Entdecke AI-Companions'}
        </div>
        {user && (
          <button
            onClick={() => setShowAuthModal(true)}
            className="text-white/70 hover:text-white transition-colors text-sm"
          >
            Profil
          </button>
        )}
      </header>

      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-16 w-24 h-24 bg-purple-500/8 rounded-full blur-2xl"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full pb-20">
        {renderContent()}
      </main>

      {/* Compact Bottom Navigation - Fixed */}
      <nav className="fixed bottom-0 left-0 right-0 nav-glass z-50">
        <div className="flex justify-around max-w-md mx-auto px-2 py-2">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-300 ${
              activeTab === 'profiles'
                ? 'glass-button text-white bg-purple-600/20 purple-glow'
                : 'text-white/60 hover:text-white/90 hover:bg-white/5'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs font-medium">Profile</span>
          </button>
          
          <button
            onClick={() => handleTabChange('chats')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-300 ${
              activeTab === 'chats'
                ? 'glass-button text-white bg-purple-600/20 purple-glow'
                : 'text-white/60 hover:text-white/90 hover:bg-white/5'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs font-medium">Chats</span>
            {!user && <div className="w-2 h-2 bg-red-400 rounded-full -mt-1"></div>}
          </button>
          
          <button
            onClick={() => setActiveTab('random')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-300 ${
              activeTab === 'random'
                ? 'glass-button text-white bg-purple-600/20 purple-glow'
                : 'text-white/60 hover:text-white/90 hover:bg-white/5'
            }`}
          >
            <Shuffle className="w-5 h-5" />
            <span className="text-xs font-medium">Zufall</span>
          </button>
          
          <button
            onClick={() => handleTabChange('settings')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-300 ${
              activeTab === 'settings'
                ? 'glass-button text-white bg-purple-600/20 purple-glow'
                : 'text-white/60 hover:text-white/90 hover:bg-white/5'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs font-medium">Settings</span>
            {!user && <div className="w-2 h-2 bg-red-400 rounded-full -mt-1"></div>}
          </button>
        </div>
      </nav>

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
