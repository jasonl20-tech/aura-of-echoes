
import React, { useState } from 'react';
import { Crown, Users, FileText, Calendar, Settings, BarChart3, UserCheck, UserPlus } from 'lucide-react';
import { useIsAdmin } from '@/hooks/useAdminWomen';
import { useAuth } from '@/hooks/useAuth';
import UserManagement from './UserManagement';
import UserVerificationManagement from './UserVerificationManagement';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { data: isAdmin, isLoading } = useIsAdmin();
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Admin-Dashboard wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-2">Zugriff verweigert</h1>
          <p className="text-white/70 mb-4">Sie haben keine Berechtigung für das Admin-Dashboard.</p>
          <button
            onClick={onBack}
            className="glass-button px-6 py-3 rounded-xl text-white font-semibold hover:bg-purple-600/30 transition-all duration-300"
          >
            Zurück
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Übersicht', icon: BarChart3 },
    { id: 'women-management', label: 'Frauen verwalten', icon: UserPlus },
    { id: 'user-management', label: 'User Management', icon: Users },
    { id: 'user-verification', label: 'Benutzer-Verifizierung', icon: UserCheck },
    { id: 'settings', label: 'Einstellungen', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white text-glow mb-2">Admin Dashboard</h2>
              <p className="text-white/70">Willkommen im Admin-Bereich</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Frauen verwalten</h3>
                    <p className="text-white/70 text-sm">Profile erstellen und bearbeiten</p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Benutzer</h3>
                    <p className="text-white/70 text-sm">Verwaltung und Freischaltungen</p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Verifizierungen</h3>
                    <p className="text-white/70 text-sm">Benutzer-Identitätsprüfung</p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Profilanträge</h3>
                    <p className="text-white/70 text-sm">Neue Profile prüfen</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'women-management':
        return <UserManagement />;
      case 'user-management':
        return <UserManagement />;
      case 'user-verification':
        return <UserVerificationManagement />;
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white text-glow">Admin-Einstellungen</h2>
            <div className="glass-card rounded-2xl p-6">
              <p className="text-white/70">Admin-Einstellungen werden hier angezeigt.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="glass-card border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="glass-button p-2 rounded-lg text-white hover:bg-white/10 transition-all duration-300"
          >
            ←
          </button>
          <Crown className="w-6 h-6 text-yellow-400" />
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
        </div>
        <div className="text-white/70 text-sm">
          {user.email}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass-card border-b border-white/10 px-4 py-2">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'glass-button bg-purple-600/30 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
