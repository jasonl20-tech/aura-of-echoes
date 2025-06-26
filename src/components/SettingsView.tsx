
import React from 'react';
import { User, Shield, Bell, Globe, Trash2, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useAdminWomen';

interface SettingsViewProps {
  onAuthRequired?: () => void;
  onNavigateToAdmin?: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onAuthRequired, onNavigateToAdmin }) => {
  const { user, signOut } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
        <div className="glass-card rounded-3xl p-8 max-w-sm">
          <User className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-3">
            Anmeldung erforderlich
          </h2>
          <p className="text-white/70 mb-6">
            Melde dich an, um deine Einstellungen zu verwalten und dein Profil anzupassen.
          </p>
          <button
            onClick={() => onAuthRequired?.()}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl transition-all duration-300"
          >
            Jetzt anmelden
          </button>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white text-glow mb-2">
          Einstellungen
        </h1>
        <p className="text-white/70">
          Verwalte dein Profil und deine Präferenzen
        </p>
      </div>

      <div className="space-y-4">
        {/* Admin Dashboard Section */}
        {!adminLoading && isAdmin && (
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="w-6 h-6 text-orange-400" />
              <h2 className="text-xl font-semibold text-white">Administration</h2>
            </div>
            <p className="text-white/70 text-sm mb-4">
              Als Administrator können Sie neue Frauen erstellen und verwalten.
            </p>
            <button
              onClick={() => onNavigateToAdmin?.()}
              className="w-full glass-button py-3 rounded-xl text-white font-semibold hover:bg-orange-600/30 transition-all duration-300"
            >
              Admin Dashboard öffnen
            </button>
          </div>
        )}

        {/* Profile Section */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <User className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Profil</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-white/70 text-sm">E-Mail</label>
              <p className="text-white font-medium">{user.email}</p>
            </div>
            <div>
              <label className="text-white/70 text-sm">Mitglied seit</label>
              <p className="text-white font-medium">
                {new Date(user.created_at).toLocaleDateString('de-DE')}
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Datenschutz</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/80">Chat-Verlauf speichern</span>
              <div className="w-12 h-6 bg-purple-600 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-all"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">Daten für Verbesserungen nutzen</span>
              <div className="w-12 h-6 bg-gray-600 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-all"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">Benachrichtigungen</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/80">Neue Nachrichten</span>
              <div className="w-12 h-6 bg-purple-600 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-all"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">Neue Features</span>
              <div className="w-12 h-6 bg-purple-600 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-all"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Language Section */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Sprache</h2>
          </div>
          <div className="space-y-3">
            <select className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="de" className="bg-gray-800">Deutsch</option>
              <option value="en" className="bg-gray-800">English</option>
              <option value="fr" className="bg-gray-800">Français</option>
              <option value="es" className="bg-gray-800">Español</option>
            </select>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass-card rounded-2xl p-6 border border-red-500/20">
          <div className="flex items-center space-x-3 mb-4">
            <Trash2 className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-semibold text-white">Gefährlicher Bereich</h2>
          </div>
          <div className="space-y-3">
            <button className="w-full glass-button py-3 rounded-xl text-red-400 font-semibold hover:bg-red-600/20 transition-all duration-300">
              Alle Chat-Daten löschen
            </button>
            <button className="w-full glass-button py-3 rounded-xl text-red-400 font-semibold hover:bg-red-600/20 transition-all duration-300">
              Konto löschen
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className="w-full glass-button py-4 rounded-xl text-white font-semibold hover:bg-red-600/30 transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Abmelden</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
