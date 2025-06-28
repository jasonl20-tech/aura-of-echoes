
import React, { useState } from 'react';
import { Settings, Shield, Globe, Trash2, User, LogOut, Crown, Bell, Volume2, Mail } from 'lucide-react';
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
        title: "Successfully signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error signing out: " + error.message,
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
        title: "Notifications enabled",
        description: "You will now receive browser notifications.",
      });
    } else {
      toast({
        title: "Notifications denied",
        description: "Notifications were not activated.",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white text-glow mb-2">Settings</h1>
        <p className="text-white/70">Manage your preferences and account</p>
      </div>

      {/* Account Section */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <User className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Account</h2>
        </div>
        
        {user ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 glass rounded-xl">
              <div>
                <p className="text-white font-medium">Signed in as</p>
                <p className="text-white/70 text-sm">{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="mt-2 sm:mt-0 w-full sm:w-auto glass-button px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-red-600/30 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span>{signingOut ? 'Signing out...' : 'Sign out'}</span>
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
                      <p className="text-white/70 text-sm">Access to admin dashboard</p>
                    </div>
                  </div>
                  <button
                    onClick={onNavigateToAdmin}
                    className="mt-2 sm:mt-0 w-full sm:w-auto glass-button px-4 py-2 rounded-lg text-yellow-400 hover:bg-yellow-600/20 transition-all duration-300"
                  >
                    Open Admin Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-4 glass rounded-xl">
            <p className="text-white/70 mb-4">You are not signed in</p>
            <button
              onClick={onAuthRequired}
              className="glass-button px-6 py-2 rounded-xl text-white font-semibold hover:bg-purple-600/30 transition-all duration-300"
            >
              Sign in now
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
          <h2 className="text-xl font-semibold text-white">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 glass rounded-xl">
            <div>
              <p className="text-white font-medium">Desktop notifications</p>
              <p className="text-white/70 text-sm">Browser notifications for new messages</p>
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
              <p className="text-white font-medium">Push notifications for messages</p>
              <p className="text-white/70 text-sm">Notifications when you're not in the app</p>
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
          <h2 className="text-xl font-semibold text-white">Privacy</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 glass rounded-xl">
            <div>
              <p className="text-white font-medium">Save chat history</p>
              <p className="text-white/70 text-sm">Store your messages locally for better experience</p>
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
              <p className="text-white font-medium">Use data for improvements</p>
              <p className="text-white/70 text-sm">Share anonymous usage data to improve the product</p>
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
          <h2 className="text-xl font-semibold text-white">Language</h2>
        </div>
        
        <div className="p-4 glass rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Interface language</p>
              <p className="text-white/70 text-sm">Choose your preferred language</p>
            </div>
            <select
              value={userSettings.language}
              onChange={(e) => saveSettings({ language: e.target.value as 'de' | 'en' })}
              className="glass rounded-lg px-3 py-2 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="de" className="bg-gray-800">German</option>
              <option value="en" className="bg-gray-800">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Mail className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Support</h2>
        </div>
        
        <div className="p-4 glass rounded-xl">
          <div className="text-center">
            <p className="text-white font-medium mb-2">Need help?</p>
            <p className="text-white/70 text-sm mb-4">Contact our support team</p>
            <a 
              href="mailto:support@mostchats.com"
              className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              <Mail className="w-4 h-4" />
              <span>support@mostchats.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      {user && (
        <div className="glass-card rounded-2xl p-6 border border-red-500/20">
          <div className="flex items-center space-x-3 mb-4">
            <Trash2 className="w-5 h-5 text-red-400" />
            <h2 className="text-xl font-semibold text-white">Danger Zone</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 glass rounded-xl border border-red-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-white font-medium">Delete all chat data</p>
                  <p className="text-white/70 text-sm">Permanently deletes all your messages and chats</p>
                </div>
                <button
                  onClick={deleteAllChatData}
                  disabled={settingsLoading}
                  className="mt-2 sm:mt-0 w-full sm:w-auto glass-button px-4 py-2 rounded-lg text-red-400 hover:bg-red-600/20 transition-all duration-300 disabled:opacity-50"
                >
                  {settingsLoading ? 'Deleting...' : 'Delete chat data'}
                </button>
              </div>
            </div>

            <div className="p-4 glass rounded-xl border border-red-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-white font-medium">Delete account</p>
                  <p className="text-white/70 text-sm">Permanently deletes your entire account and all data</p>
                </div>
                <button
                  onClick={deleteAccount}
                  disabled={settingsLoading}
                  className="mt-2 sm:mt-0 w-full sm:w-auto glass-button px-4 py-2 rounded-lg text-red-400 hover:bg-red-600/30 transition-all duration-300 disabled:opacity-50 font-semibold"
                >
                  {settingsLoading ? 'Deleting...' : 'Delete account'}
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
