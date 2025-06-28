
import React, { useState } from 'react';
import { User, Camera, Upload, X, Plus } from 'lucide-react';
import { useProfileApplications } from '@/hooks/useVerification';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const ProfileApplicationForm: React.FC = () => {
  const { user } = useAuth();
  const { applications, submitApplication, isSubmitting } = useProfileApplications();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    description: '',
    personality: '',
    height: '',
    origin: '',
    price: '3.99',
    pricing_interval: 'monthly',
    nsfw: false,
    interests: [] as string[],
    images: [] as File[]
  });
  const [newInterest, setNewInterest] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 5) {
      toast({
        title: "Zu viele Bilder",
        description: "Sie können maximal 5 Bilder hochladen.",
        variant: "destructive",
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.age || parseInt(formData.age) < 18) {
      toast({
        title: "Ungültige Eingabe",
        description: "Bitte füllen Sie alle Pflichtfelder aus. Mindestalter: 18 Jahre.",
        variant: "destructive",
      });
      return;
    }

    // Upload images first (simplified - in production you'd upload to storage)
    const imageUrls = formData.images.map(file => URL.createObjectURL(file));

    const applicationData = {
      name: formData.name,
      age: parseInt(formData.age),
      description: formData.description,
      personality: formData.personality,
      height: formData.height ? parseInt(formData.height) : null,
      origin: formData.origin,
      price: parseFloat(formData.price),
      pricing_interval: formData.pricing_interval,
      nsfw: formData.nsfw,
      interests: formData.interests,
      images: imageUrls
    };

    submitApplication(applicationData);
    setShowForm(false);
    setFormData({
      name: '',
      age: '',
      description: '',
      personality: '',
      height: '',
      origin: '',
      price: '3.99',
      pricing_interval: 'monthly',
      nsfw: false,
      interests: [],
      images: []
    });
  };

  if (!showForm) {
    return (
      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-4">
          <User className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg sm:text-xl font-semibold text-white">Profilantrag</h2>
        </div>

        {applications && applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="p-4 glass rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-white font-medium">{app.name}</h3>
                    <p className="text-white/70 text-sm">
                      Status: <span className={`font-medium ${
                        app.status === 'approved' ? 'text-green-400' :
                        app.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {app.status === 'approved' ? 'Genehmigt' :
                         app.status === 'rejected' ? 'Abgelehnt' : 'In Bearbeitung'}
                      </span>
                    </p>
                    <p className="text-white/50 text-xs">
                      Eingereicht: {new Date(app.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
                {app.rejection_reason && (
                  <p className="text-red-400 text-sm mt-2">
                    Ablehnungsgrund: {app.rejection_reason}
                  </p>
                )}
              </div>
            ))}
            
            <button
              onClick={() => setShowForm(true)}
              className="w-full glass-button px-6 py-3 rounded-xl text-white font-semibold hover:bg-purple-600/30 transition-all duration-300"
            >
              Neuen Profilantrag stellen
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">👤</div>
            <p className="text-white/70 text-lg mb-4">Sie haben noch keinen Profilantrag gestellt.</p>
            <button
              onClick={() => setShowForm(true)}
              className="glass-button px-6 py-3 rounded-xl text-white font-semibold hover:bg-purple-600/30 transition-all duration-300"
            >
              Profilantrag stellen
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-white">Profilantrag stellen</h2>
        <button
          onClick={() => setShowForm(false)}
          className="text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-white font-medium mb-4">Grundinformationen</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ihr Name"
                required
              />
            </div>
            
            <div>
              <label className="block text-white/70 text-sm mb-2">Alter *</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="18"
                min="18"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Größe (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="170"
              />
            </div>
            
            <div>
              <label className="block text-white/70 text-sm mb-2">Herkunft</label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Deutschland"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-white/70 text-sm mb-2">Beschreibung</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder="Beschreiben Sie sich..."
          />
        </div>

        {/* Personality */}
        <div>
          <label className="block text-white/70 text-sm mb-2">Persönlichkeit</label>
          <textarea
            name="personality"
            value={formData.personality}
            onChange={handleInputChange}
            rows={3}
            className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder="Beschreiben Sie Ihre Persönlichkeit..."
          />
        </div>

        {/* Interests */}
        <div>
          <label className="block text-white/70 text-sm mb-2">Interessen</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.interests.map((interest, index) => (
              <span key={index} className="glass px-3 py-1 rounded-full text-sm text-white flex items-center space-x-2">
                <span>{interest}</span>
                <button
                  type="button"
                  onClick={() => removeInterest(interest)}
                  className="text-white/50 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              className="flex-1 glass rounded-xl px-4 py-2 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Interesse hinzufügen"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
            />
            <button
              type="button"
              onClick={addInterest}
              className="glass-button px-4 py-2 rounded-xl text-white hover:bg-purple-600/30 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/70 text-sm mb-2">Preis (€)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-white/70 text-sm mb-2">Abrechnungsintervall</label>
            <select
              name="pricing_interval"
              value={formData.pricing_interval}
              onChange={handleInputChange}
              className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="daily" className="bg-gray-800">Täglich</option>
              <option value="weekly" className="bg-gray-800">Wöchentlich</option>
              <option value="monthly" className="bg-gray-800">Monatlich</option>
              <option value="yearly" className="bg-gray-800">Jährlich</option>
            </select>
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-white/70 text-sm mb-2">Bilder (max. 5)</label>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Upload ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            
            {formData.images.length < 5 && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="glass-button px-4 py-2 rounded-lg text-white cursor-pointer hover:bg-purple-600/30 transition-all duration-300 inline-flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Bilder hinzufügen</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* NSFW */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="nsfw"
            id="nsfw"
            checked={formData.nsfw}
            onChange={handleInputChange}
            className="w-4 h-4 text-purple-600 bg-transparent border-2 border-white/20 rounded focus:ring-purple-500"
          />
          <label htmlFor="nsfw" className="text-white/70 text-sm">
            Inhalte für Erwachsene (NSFW)
          </label>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="flex-1 glass-button px-6 py-3 rounded-xl text-white/70 font-semibold hover:bg-red-600/30 transition-all duration-300"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 glass-button px-6 py-3 rounded-xl text-white font-semibold hover:bg-green-600/30 transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? 'Wird eingereicht...' : 'Antrag einreichen'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileApplicationForm;
