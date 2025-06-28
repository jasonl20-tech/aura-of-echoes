
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Eye } from 'lucide-react';
import { useWomen } from '@/hooks/useWomen';
import { useCreateWoman, useUpdateWoman, useDeleteWoman } from '@/hooks/useAdminWomen';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import MultiImageUpload from './MultiImageUpload';

interface ImageData {
  url: string;
  alt?: string;
}

interface WomanFormData {
  name: string;
  age: number;
  description: string;
  personality: string;
  image_url: string;
  images: ImageData[];
  webhook_url: string;
  interests: string[];
  price: number;
  pricing_interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  height: number | null;
  origin: string;
  nsfw: boolean;
}

const WomenManagement: React.FC = () => {
  const { data: women, isLoading, refetch } = useWomen();
  const createWoman = useCreateWoman();
  const updateWoman = useUpdateWoman();
  const deleteWoman = useDeleteWoman();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingWoman, setEditingWoman] = useState<any>(null);
  const [formData, setFormData] = useState<WomanFormData>({
    name: '',
    age: 18,
    description: '',
    personality: '',
    image_url: '',
    images: [],
    webhook_url: '',
    interests: [],
    price: 3.99,
    pricing_interval: 'monthly',
    height: null,
    origin: '',
    nsfw: false
  });

  const resetForm = () => {
    setFormData({
      name: '',
      age: 18,
      description: '',
      personality: '',
      image_url: '',
      images: [],
      webhook_url: '',
      interests: [],
      price: 3.99,
      pricing_interval: 'monthly',
      height: null,
      origin: '',
      nsfw: false
    });
    setEditingWoman(null);
    setShowForm(false);
  };

  const handleEdit = (woman: any) => {
    setEditingWoman(woman);
    setFormData({
      name: woman.name || '',
      age: woman.age || 18,
      description: woman.description || '',
      personality: woman.personality || '',
      image_url: woman.image_url || '',
      images: Array.isArray(woman.images) ? woman.images : (typeof woman.images === 'string' ? JSON.parse(woman.images || '[]') : []),
      webhook_url: woman.webhook_url || '',
      interests: woman.interests || [],
      price: woman.price || 3.99,
      pricing_interval: woman.pricing_interval || 'monthly',
      height: woman.height || null,
      origin: woman.origin || '',
      nsfw: woman.nsfw || false
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.webhook_url.trim()) {
      toast({
        title: "Fehler",
        description: "Name und Webhook-URL sind erforderlich.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingWoman) {
        await updateWoman.mutateAsync({
          id: editingWoman.id,
          ...formData
        });
        toast({
          title: "Erfolg",
          description: "Frau wurde erfolgreich aktualisiert."
        });
      } else {
        await createWoman.mutateAsync(formData);
        toast({
          title: "Erfolg",
          description: "Neue Frau wurde erfolgreich erstellt."
        });
      }
      
      resetForm();
      refetch();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Es ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (womanId: string, womanName: string) => {
    if (!confirm(`Sind Sie sicher, dass Sie ${womanName} löschen möchten?`)) {
      return;
    }

    try {
      await deleteWoman.mutateAsync(womanId);
      toast({
        title: "Erfolg",
        description: `${womanName} wurde erfolgreich gelöscht.`
      });
      refetch();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen.",
        variant: "destructive"
      });
    }
  };

  const handleInterestsChange = (value: string) => {
    const interests = value.split(',').map(i => i.trim()).filter(i => i);
    setFormData({ ...formData, interests });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white text-glow">Frauen verwalten</h2>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Neue Frau hinzufügen
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingWoman ? 'Frau bearbeiten' : 'Neue Frau erstellen'}
              </h3>
              <button
                onClick={resetForm}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full glass rounded-lg px-3 py-2 text-white placeholder-white/60 border border-purple-400/30 focus:border-purple-400 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Alter *
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="99"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                    className="w-full glass rounded-lg px-3 py-2 text-white placeholder-white/60 border border-purple-400/30 focus:border-purple-400 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Beschreibung
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full glass rounded-lg px-3 py-2 text-white placeholder-white/60 border border-purple-400/30 focus:border-purple-400 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Persönlichkeit
                </label>
                <textarea
                  value={formData.personality}
                  onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                  rows={3}
                  className="w-full glass rounded-lg px-3 py-2 text-white placeholder-white/60 border border-purple-400/30 focus:border-purple-400 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Hauptbild URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full glass rounded-lg px-3 py-2 text-white placeholder-white/60 border border-purple-400/30 focus:border-purple-400 outline-none"
                />
              </div>

              <MultiImageUpload
                images={formData.images}
                onChange={(images) => setFormData({ ...formData, images })}
                maxImages={10}
              />

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Webhook URL *
                </label>
                <input
                  type="url"
                  value={formData.webhook_url}
                  onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                  className="w-full glass rounded-lg px-3 py-2 text-white placeholder-white/60 border border-purple-400/30 focus:border-purple-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Interessen (komma-getrennt)
                </label>
                <input
                  type="text"
                  value={formData.interests.join(', ')}
                  onChange={(e) => handleInterestsChange(e.target.value)}
                  className="w-full glass rounded-lg px-3 py-2 text-white placeholder-white/60 border border-purple-400/30 focus:border-purple-400 outline-none"
                  placeholder="Reisen, Kochen, Sport, Musik"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Preis (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full glass rounded-lg px-3 py-2 text-white placeholder-white/60 border border-purple-400/30 focus:border-purple-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Abrechnungsintervall
                  </label>
                  <select
                    value={formData.pricing_interval}
                    onChange={(e) => setFormData({ ...formData, pricing_interval: e.target.value as any })}
                    className="w-full glass rounded-lg px-3 py-2 text-white bg-black/30 border border-purple-400/30 focus:border-purple-400 outline-none"
                  >
                    <option value="daily">Täglich</option>
                    <option value="weekly">Wöchentlich</option>
                    <option value="monthly">Monatlich</option>
                    <option value="yearly">Jährlich</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Größe (cm)
                  </label>
                  <input
                    type="number"
                    min="140"
                    max="200"
                    value={formData.height || ''}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full glass rounded-lg px-3 py-2 text-white placeholder-white/60 border border-purple-400/30 focus:border-purple-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Herkunft
                  </label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full glass rounded-lg px-3 py-2 text-white placeholder-white/60 border border-purple-400/30 focus:border-purple-400 outline-none"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-6">
                  <input
                    type="checkbox"
                    id="nsfw"
                    checked={formData.nsfw}
                    onChange={(e) => setFormData({ ...formData, nsfw: e.target.checked })}
                    className="w-4 h-4 text-purple-600 bg-transparent border-purple-400/30 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="nsfw" className="text-sm font-medium text-white">
                    NSFW Inhalt
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Abbrechen
                </Button>
                <Button
                  type="submit"
                  disabled={createWoman.isPending || updateWoman.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingWoman ? 'Aktualisieren' : 'Erstellen'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Women List */}
      <div className="space-y-4">
        {women && women.length > 0 ? (
          women.map((woman) => (
            <div key={woman.id} className="glass-card rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex space-x-4">
                  {woman.image_url && (
                    <img
                      src={woman.image_url}
                      alt={woman.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{woman.name}</h3>
                    <p className="text-white/70 text-sm">
                      {woman.age} Jahre • {woman.origin || 'Unbekannte Herkunft'}
                    </p>
                    <p className="text-white/60 text-sm mt-1 line-clamp-2">
                      {woman.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-white/50">
                      <span>€{woman.price}/{woman.pricing_interval}</span>
                      {woman.height && <span>{woman.height}cm</span>}
                      {woman.nsfw && <span className="text-red-400">NSFW</span>}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleEdit(woman)}
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(woman.id, woman.name)}
                    size="sm"
                    variant="outline"
                    className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-white/60">Keine Frauen gefunden. Erstellen Sie eine neue.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WomenManagement;
