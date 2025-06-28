import React, { useState } from 'react';
import { Settings, Shield, Globe, Trash2, User, LogOut, Crown, Bell, Volume2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { useSettings } from '../hooks/useSettings';
import { useIsAdmin } from '../hooks/useAdminWomen';
import { useVerification } from '../hooks/useVerification';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import SubscriptionManagement from './SubscriptionManagement';
import VerificationSection from './VerificationSection';
import ProfileApplicationForm from './ProfileApplicationForm';

interface SettingsViewProps {
  onAuthRequired?: () => void;
  onNavigateToAdmin?: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onAuthRequired, onNavigateToAdmin }) => {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const { verificationStatus } = useVerification();
  const { 
    settings: notificationSettings, 
    updateSettings: updateNotificationSettings,
    requestPermission 
  } = useNotifications();
  const { 
    settings: userSettings, 
    saveSettings, 
    deleteAllChatData, 
    deleteAccount,
    loading: settingsLoading 
  } = useSettings();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Erfolgreich abgemeldet",
        description: "Sie wurden erfolgreich abgemeldet.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Fehler beim Abmelden: " + error.message,
        variant: "destructive",
      });
    } finally {
      setSigningOut(false);
    }
  };

  const handleNotificationPermission = async () => {
    const permission = await requestPermission();
    if (permission === 'granted') {
      toast({
        title: "Benachrichtigungen aktiviert",
        description: "Sie erhalten jetzt Browser-Benachrichtigungen.",
      });
    } else {
      toast({
        title: "Benachrichtigungen verweigert",
        description: "Benachrichtigungen wurden nicht aktiviert.",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Einstellungen werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white text-glow mb-2">Einstellungen</h1>
        <p className="text-white/70">Verwalten Sie Ihre Präferenzen und Ihr Konto</p>
      </div>

      {/* Account Section */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <User className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Konto</h2>
        </div>
        
        {user ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 glass rounded-xl">
              <div>
                <p className="text-white font-medium">Angemeldet als</p>
                <p className="text-white/70 text-sm">{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="mt-2 sm:mt-0 w-full sm:w-auto glass-button px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-red-600/30 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span>{signingOut ? 'Wird abgemeldet...' : 'Abmelden'}</span>
              </button>
            </div>

            {/* Admin Panel Access */}
            {isAdmin && (
              <div className="p-4 glass rounded-xl border border-purple-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-3">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="text-white font-medium">Administrator</p>
                      <p className="text-white/70 text-sm">Zugang zum Admin-Dashboard</p>
                    </div>
                  </div>
                  <button
                    onClick={onNavigateToAdmin}
                    className="mt-2 sm:mt-0 w-full sm:w-auto glass-button px-4 py-2 rounded-lg text-yellow-400 hover:bg-yellow-600/20 transition-all duration-300"
                  >
                    Admin-Dashboard öffnen
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-4 glass rounded-xl">
            <p className="text-white/70 mb-4">Sie sind nicht angemeldet</p>
            <button
              onClick={onAuthRequired}
              className="glass-button px-6 py-2 rounded-xl text-white font-semibold hover:bg-purple-600/30 transition-all duration-300"
            >
              Jetzt anmelden
            </button>
          </div>
        )}
      </div>

      {/* Verification Section - Only for authenticated users */}
      {user && <VerificationSection />}

      {/* Profile Application Form - Only for verified users */}
      {user && verificationStatus?.verification_status === 'verified' && (
        <ProfileApplicationForm />
      )}

      {/* Subscription Management Section */}
      {user && <SubscriptionManagement />}

      {/* Notification Settings */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Bell className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Benachrichtigungen</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 glass rounded-xl">
            <div>
              <p className="text-white font-medium">Desktop-Benachrichtigungen</p>
              <p className="text-white/70 text-sm">Browser-Benachrichtigungen für neue Nachrichten</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.desktopNotifications}
                onChange={(e) => {
                  updateNotificationSettings({ desktopNotifications: e.target.checked });
                  if (e.target.checked) {
                    handleNotificationPermission();
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 glass rounded-xl">
            <div>
              <p className="text-white font-medium">Push-Benachrichtigungen für Nachrichten</p>
              <p className="text-white/70 text-sm">Benachrichtigungen wenn Sie nicht in der App sind</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.pushNotificationsForMessages}
                onChange={(e) => updateNotificationSettings({ pushNotificationsForMessages: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Datenschutz</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 glass rounded-xl">
            <div>
              <p className="text-white font-medium">Chat-Verlauf speichern</p>
              <p className="text-white/70 text-sm">Ihre Nachrichten lokal für bessere Erfahrung speichern</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={userSettings.saveChatHistory}
                onChange={(e) => saveSettings({ saveChatHistory: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 glass rounded-xl">
            <div>
              <p className="text-white font-medium">Daten für Verbesserungen nutzen</p>
              <p className="text-white/70 text-sm">Anonyme Nutzungsdaten zur Produktverbesserung teilen</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={userSettings.useDataForImprovements}
                onChange={(e) => saveSettings({ useDataForImprovements: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Language Settings */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Globe className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Sprache</h2>
        </div>
        
        <div className="p-4 glass rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Interface-Sprache</p>
              <p className="text-white/70 text-sm">Wählen Sie Ihre bevorzugte Sprache</p>
            </div>
            <select
              value={userSettings.language}
              onChange={(e) => saveSettings({ language: e.target.value as 'de' | 'en' })}
              className="glass rounded-lg px-3 py-2 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="de" className="bg-gray-800">Deutsch</option>
              <option value="en" className="bg-gray-800">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      {user && (
        <div className="glass-card rounded-2xl p-6 border border-red-500/20">
          <div className="flex items-center space-x-3 mb-4">
            <Trash2 className="w-5 h-5 text-red-400" />
            <h2 className="text-xl font-semibold text-white">Gefährlicher Bereich</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 glass rounded-xl border border-red-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-white font-medium">Alle Chat-Daten löschen</p>
                  <p className="text-white/70 text-sm">Löscht unwiderruflich alle Ihre Nachrichten und Chats</p>
                </div>
                <button
                  onClick={deleteAllChatData}
                  disabled={settingsLoading}
                  className="mt-2 sm:mt-0 w-full sm:w-auto glass-button px-4 py-2 rounded-lg text-red-400 hover:bg-red-600/20 transition-all duration-300 disabled:opacity-50"
                >
                  {settingsLoading ? 'Wird gelöscht...' : 'Chat-Daten löschen'}
                </button>
              </div>
            </div>

            <div className="p-4 glass rounded-xl border border-red-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-white font-medium">Konto löschen</p>
                  <p className="text-white/70 text-sm">Löscht unwiderruflich Ihr gesamtes Konto und alle Daten</p>
                </div>
                <button
                  onClick={deleteAccount}
                  disabled={settingsLoading}
                  className="mt-2 sm:mt-0 w-full sm:w-auto glass-button px-4 py-2 rounded-lg text-red-400 hover:bg-red-600/30 transition-all duration-300 disabled:opacity-50 font-semibold"
                >
                  {settingsLoading ? 'Wird gelöscht...' : 'Konto löschen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
