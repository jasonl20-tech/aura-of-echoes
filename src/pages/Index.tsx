import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Settings, MessageCircle, Users, Shuffle, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ProfileGallery from '../components/ProfileGallery';
import ChatView from '../components/ChatView';
import SettingsView from '../components/SettingsView';

const Index = () => {
  const [activeTab, setActiveTab] = useState('profiles');
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="text-white text-center">Wird geladen...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profiles':
        return <ProfileGallery />;
      case 'chats':
        return <ChatView />;
      case 'settings':
        return <SettingsView />;
      case 'random':
        return <ProfileGallery isRandom />;
      default:
        return <ProfileGallery />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Header with user info and logout */}
      <header className="p-4 flex justify-between items-center">
        <div className="text-white/70 text-sm">
          Willkommen, {user.email}
        </div>
        <button
          onClick={handleSignOut}
          className="text-white/70 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
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
            onClick={() => setActiveTab('chats')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-300 ${
              activeTab === 'chats'
                ? 'glass-button text-white bg-purple-600/20 purple-glow'
                : 'text-white/60 hover:text-white/90 hover:bg-white/5'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs font-medium">Chats</span>
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
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-300 ${
              activeTab === 'settings'
                ? 'glass-button text-white bg-purple-600/20 purple-glow'
                : 'text-white/60 hover:text-white/90 hover:bg-white/5'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Index;
