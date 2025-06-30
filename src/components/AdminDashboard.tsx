import React, { useState } from 'react';
import { Crown, Users, FileText, Calendar, Settings, BarChart3, UserCheck, UserPlus, Key, Book } from 'lucide-react';
import { useIsAdmin } from '@/hooks/useAdminWomen';
import { useAuth } from '@/hooks/useAuth';
import UserManagement from './UserManagement';
import UserVerificationManagement from './UserVerificationManagement';
import WomenManagement from './WomenManagement';
import ApiKeysManagement from './ApiKeysManagement';
import ApiDocumentation from './ApiDocumentation';

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
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-2">Access denied</h1>
          <p className="text-white/70 mb-4">You don't have permission to access the admin dashboard.</p>
          <button
            onClick={onBack}
            className="glass-button px-6 py-3 rounded-xl text-white font-semibold hover:bg-purple-600/30 transition-all duration-300"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'women-management', label: 'Manage Women', icon: UserPlus },
    { id: 'user-management', label: 'User Management', icon: Users },
    { id: 'user-verification', label: 'User Verification', icon: UserCheck },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'documentation', label: 'API Documentation', icon: Book },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white text-glow mb-2">Admin Dashboard</h2>
              <p className="text-white/70">Welcome to the admin area</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Manage Women</h3>
                    <p className="text-white/70 text-sm">Create and edit profiles</p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Users</h3>
                    <p className="text-white/70 text-sm">Management and unlocks</p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Verifications</h3>
                    <p className="text-white/70 text-sm">User identity verification</p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-600/20 rounded-full flex items-center justify-center">
                    <Key className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">API Keys</h3>
                    <p className="text-white/70 text-sm">Manage integration keys</p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-full flex items-center justify-center">
                    <Book className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Documentation</h3>
                    <p className="text-white/70 text-sm">API integration guide</p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Profile requests</h3>
                    <p className="text-white/70 text-sm">Review new profiles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'women-management':
        return <WomenManagement />;
      case 'user-management':
        return <UserManagement />;
      case 'user-verification':
        return <UserVerificationManagement />;
      case 'api-keys':
        return <ApiKeysManagement />;
      case 'documentation':
        return <ApiDocumentation />;
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white text-glow">Admin Settings</h2>
            <div className="glass-card rounded-2xl p-6">
              <p className="text-white/70">Admin settings will be displayed here.</p>
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
