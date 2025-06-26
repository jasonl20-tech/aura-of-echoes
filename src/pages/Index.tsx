
import React, { useState } from 'react';
import { Heart, Settings, MessageCircle, Users, Shuffle } from 'lucide-react';
import ProfileGallery from '../components/ProfileGallery';
import ChatView from '../components/ChatView';
import SettingsView from '../components/SettingsView';

const Index = () => {
  const [activeTab, setActiveTab] = useState('profiles');

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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background with floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-pink-400/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-purple-400/20 rounded-full blur-lg animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="glass-card rounded-none border-x-0 border-t-0 p-4 z-10">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center space-x-2">
            <Heart className="w-8 h-8 text-pink-400 animate-glow" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              HeartConnect
            </h1>
          </div>
          <div className="text-sm text-white/70">
            Deine virtuelle Verbindung
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="glass-card rounded-none border-x-0 border-b-0 p-4 z-10">
        <div className="flex justify-around max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300 ${
              activeTab === 'profiles'
                ? 'glass-button text-pink-400'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <Users className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>
          
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300 ${
              activeTab === 'chats'
                ? 'glass-button text-purple-400'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs">Chats</span>
          </button>
          
          <button
            onClick={() => setActiveTab('random')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300 ${
              activeTab === 'random'
                ? 'glass-button text-blue-400'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <Shuffle className="w-6 h-6" />
            <span className="text-xs">Random</span>
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300 ${
              activeTab === 'settings'
                ? 'glass-button text-orange-400'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs">Einstellungen</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Index;
