
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Users, Settings } from 'lucide-react';
import { useWomen } from '@/hooks/useWomen';
import { useCreateWoman, useUpdateWoman, useDeleteWoman } from '@/hooks/useAdminWomen';
import { toast } from '@/hooks/use-toast';
import UserManagement from './UserManagement';

interface NewWomanForm {
  name: string;
  age: number;
  description: string;
  personality: string;
  image_url: string;
  webhook_url: string;
  interests: string[];
}

const AdminDashboard: React.FC = () => {
  const { data: women, refetch } = useWomen();
  const [activeTab, setActiveTab] = useState<'women' | 'users'>('women');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWoman, setEditingWoman] = useState<string | null>(null);
  const [newWoman, setNewWoman] = useState<NewWomanForm>({
    name: '',
    age: 18,
    description: '',
    personality: '',
    image_url: '',
    webhook_url: '',
    interests: []
  });

  const createWoman = useCreateWoman();
  const updateWoman = useUpdateWoman();
  const deleteWoman = useDeleteWoman();

  const handleCreateWoman = async () => {
    try {
      await createWoman.mutateAsync(newWoman);
      toast({
        title: "Erfolgreich!",
        description: `${newWoman.name} wurde erfolgreich erstellt.`,
      });
      setNewWoman({
        name: '',
        age: 18,
        description: '',
        personality: '',
        image_url: '',
        webhook_url: '',
        interests: []
      });
      setShowAddForm(false);
      refetch();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Erstellen der Frau",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWoman = async (id: string, name: string) => {
    if (window.confirm(`Sind Sie sicher, dass Sie ${name} löschen möchten?`)) {
      try {
        await deleteWoman.mutateAsync(id);
        toast({
          title: "Erfolgreich!",
          description: `${name} wurde erfolgreich gelöscht.`,
        });
        refetch();
      } catch (error: any) {
        toast({
          title: "Fehler",
          description: error.message || "Fehler beim Löschen der Frau",
          variant: "destructive",
        });
      }
    }
  };

  const handleInterestsChange = (interests: string, isNew: boolean = true) => {
    const interestArray = interests.split(',').map(i => i.trim()).filter(i => i);
    if (isNew) {
      setNewWoman(prev => ({ ...prev, interests: interestArray }));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white text-glow">
          Admin Dashboard
        </h1>
        
        {/* Tab Navigation */}
        <div className="flex w-full sm:w-auto glass rounded-xl p-1">
          <button
            onClick={() => setActiveTab('women')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === 'women'
                ? 'bg-purple-600/30 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Frauen</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === 'users'
                ? 'bg-purple-600/30 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User</span>
          </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <UserManagement />
      ) : (
        <>
          {/* Add New Woman Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full sm:w-auto glass-button px-4 py-2 rounded-xl text-white font-semibold hover:bg-purple-600/30 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Neue Frau hinzufügen</span>
            </button>
          </div>

          {/* Add New Woman Form */}
          {showAddForm && (
            <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white">Neue Frau erstellen</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-white/60 hover:text-white p-1"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/70 text-sm">Name</label>
                    <input
                      type="text"
                      value={newWoman.name}
                      onChange={(e) => setNewWoman(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Name eingeben..."
                    />
                  </div>

                  <div>
                    <label className="text-white/70 text-sm">Alter</label>
                    <input
                      type="number"
                      value={newWoman.age}
                      onChange={(e) => setNewWoman(prev => ({ ...prev, age: parseInt(e.target.value) || 18 }))}
                      className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="18"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/70 text-sm">Beschreibung</label>
                  <textarea
                    value={newWoman.description}
                    onChange={(e) => setNewWoman(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500 h-20"
                    placeholder="Beschreibung eingeben..."
                  />
                </div>

                <div>
                  <label className="text-white/70 text-sm">Persönlichkeit</label>
                  <textarea
                    value={newWoman.personality}
                    onChange={(e) => setNewWoman(prev => ({ ...prev, personality: e.target.value }))}
                    className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500 h-20"
                    placeholder="Persönlichkeit beschreiben..."
                  />
                </div>

                <div>
                  <label className="text-white/70 text-sm">Bild-URL</label>
                  <input
                    type="url"
                    value={newWoman.image_url}
                    onChange={(e) => setNewWoman(prev => ({ ...prev, image_url: e.target.value }))}
                    className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="text-white/70 text-sm">Webhook-URL</label>
                  <input
                    type="url"
                    value={newWoman.webhook_url}
                    onChange={(e) => setNewWoman(prev => ({ ...prev, webhook_url: e.target.value }))}
                    className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://api.example.com/webhook"
                    required
                  />
                </div>

                <div>
                  <label className="text-white/70 text-sm">Interessen (kommagetrennt)</label>
                  <input
                    type="text"
                    value={newWoman.interests.join(', ')}
                    onChange={(e) => handleInterestsChange(e.target.value)}
                    className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Sport, Musik, Reisen, Kochen"
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    onClick={handleCreateWoman}
                    disabled={createWoman.isPending || !newWoman.name || !newWoman.webhook_url}
                    className="flex-1 glass-button py-3 rounded-xl text-white font-semibold hover:bg-green-600/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{createWoman.isPending ? 'Wird erstellt...' : 'Erstellen'}</span>
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="w-full sm:w-auto px-6 glass-button py-3 rounded-xl text-white/70 font-semibold hover:bg-red-600/30 transition-all duration-300"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Women List */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              Verwaltete Frauen ({women?.length || 0})
            </h2>
            
            {women && women.length > 0 ? (
              <div className="grid gap-3 sm:gap-4">
                {women.map((woman) => (
                  <div key={woman.id} className="glass-card rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <img
                        src={woman.image_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=60&h=60&fit=crop'}
                        alt={woman.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover mx-auto sm:mx-0"
                      />
                      
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-base sm:text-lg font-semibold text-white">{woman.name}</h3>
                        <p className="text-white/70 text-sm">{woman.age} Jahre</p>
                        <p className="text-white/60 text-sm truncate">{woman.description}</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-1 sm:space-y-0 sm:space-x-2 mt-1">
                          <span className="text-green-400 font-semibold text-sm">€3.99/Monat</span>
                          {woman.interests && woman.interests.length > 0 && (
                            <span className="text-white/50 text-xs">
                              • {woman.interests.slice(0, 2).join(', ')}
                              {woman.interests.length > 2 && ` +${woman.interests.length - 2}`}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 w-full sm:w-auto justify-center">
                        <button
                          onClick={() => setEditingWoman(woman.id)}
                          className="flex-1 sm:flex-none glass-button p-2 rounded-lg text-white/70 hover:text-white hover:bg-blue-600/30 transition-all duration-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWoman(woman.id, woman.name)}
                          className="flex-1 sm:flex-none glass-button p-2 rounded-lg text-white/70 hover:text-white hover:bg-red-600/30 transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
                <p className="text-white/70">Noch keine Frauen erstellt.</p>
                <p className="text-white/50 text-sm mt-2">
                  Klicken Sie auf "Neue Frau hinzufügen" um zu beginnen.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
