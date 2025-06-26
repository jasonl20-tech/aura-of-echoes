
import React, { useState } from 'react';
import { Clock, Users, Gift, X, Calendar, CheckCircle } from 'lucide-react';
import { useWomen } from '@/hooks/useWomen';
import { useFreeAccessPeriods, useCreateFreeAccess, useDeactivateFreeAccess } from '@/hooks/useFreeAccess';
import { toast } from '@/hooks/use-toast';

const UserManagement: React.FC = () => {
  const { data: women } = useWomen();
  const { data: freeAccessPeriods, refetch } = useFreeAccessPeriods();
  const createFreeAccess = useCreateFreeAccess();
  const deactivateFreeAccess = useDeactivateFreeAccess();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedWomanId, setSelectedWomanId] = useState('');
  const [duration, setDuration] = useState(24); // Stunden
  const [customEndTime, setCustomEndTime] = useState('');

  const handleCreateFreeAccess = async () => {
    if (!selectedWomanId) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie eine Frau aus.",
        variant: "destructive",
      });
      return;
    }

    try {
      let endTime: string;
      
      if (customEndTime) {
        endTime = new Date(customEndTime).toISOString();
      } else {
        const now = new Date();
        now.setHours(now.getHours() + duration);
        endTime = now.toISOString();
      }

      await createFreeAccess.mutateAsync({
        womanId: selectedWomanId,
        endTime
      });

      const selectedWoman = women?.find(w => w.id === selectedWomanId);
      toast({
        title: "Erfolgreich!",
        description: `${selectedWoman?.name} wurde für alle User freigeschaltet.`,
      });

      setShowCreateForm(false);
      setSelectedWomanId('');
      setDuration(24);
      setCustomEndTime('');
      refetch();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Freischaltung konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
  };

  const handleDeactivate = async (accessId: string, womanName: string) => {
    if (window.confirm(`Möchten Sie die Freischaltung für ${womanName} wirklich deaktivieren?`)) {
      try {
        await deactivateFreeAccess.mutateAsync(accessId);
        toast({
          title: "Erfolgreich!",
          description: `Freischaltung für ${womanName} wurde deaktiviert.`,
        });
        refetch();
      } catch (error: any) {
        toast({
          title: "Fehler",
          description: error.message || "Freischaltung konnte nicht deaktiviert werden",
          variant: "destructive",
        });
      }
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isActive = (startTime: string, endTime: string) => {
    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return now >= start && now <= end;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white text-glow flex items-center gap-2">
          <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          User Management
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full sm:w-auto glass-button px-4 py-2 rounded-xl text-white font-semibold hover:bg-purple-600/30 transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Frau freischalten</span>
        </button>
      </div>

      {/* Create Free Access Form */}
      {showCreateForm && (
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-white">Frau für alle User freischalten</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-white/60 hover:text-white p-1"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="text-white/70 text-sm">Frau auswählen</label>
              <select
                value={selectedWomanId}
                onChange={(e) => setSelectedWomanId(e.target.value)}
                className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="" className="bg-gray-800">Frau auswählen...</option>
                {women?.map((woman) => (
                  <option key={woman.id} value={woman.id} className="bg-gray-800">
                    {woman.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm">Dauer (Stunden)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 24)}
                  className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="8760"
                />
              </div>

              <div>
                <label className="text-white/70 text-sm">Oder spezifisches Enddatum</label>
                <input
                  type="datetime-local"
                  value={customEndTime}
                  onChange={(e) => setCustomEndTime(e.target.value)}
                  className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                onClick={handleCreateFreeAccess}
                disabled={createFreeAccess.isPending || !selectedWomanId}
                className="flex-1 glass-button py-3 rounded-xl text-white font-semibold hover:bg-green-600/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{createFreeAccess.isPending ? 'Wird erstellt...' : 'Freischalten'}</span>
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="w-full sm:w-auto px-6 glass-button py-3 rounded-xl text-white/70 font-semibold hover:bg-red-600/30 transition-all duration-300"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Free Access Periods */}
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-white">
          Aktive Freischaltungen ({freeAccessPeriods?.filter(p => p.active).length || 0})
        </h3>
        
        {freeAccessPeriods && freeAccessPeriods.length > 0 ? (
          <div className="grid gap-3 sm:gap-4">
            {freeAccessPeriods
              .filter(period => period.active)
              .map((period) => {
                const woman = (period as any).women;
                const active = isActive(period.start_time, period.end_time);
                
                return (
                  <div key={period.id} className="glass-card rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex items-center space-x-3 flex-1">
                        <img
                          src={woman?.image_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=60&h=60&fit=crop'}
                          alt={woman?.name || 'Unknown'}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base sm:text-lg font-semibold text-white truncate">
                            {woman?.name || 'Unbekannt'}
                          </h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-white/70">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>Bis: {formatDateTime(period.end_time)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {active ? (
                                <>
                                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                                  <span className="text-green-400">Aktiv</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
                                  <span className="text-orange-400">Abgelaufen</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDeactivate(period.id, woman?.name || 'diese Frau')}
                        className="w-full sm:w-auto glass-button px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-red-600/30 transition-all duration-300 text-sm"
                      >
                        Deaktivieren
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-6 sm:p-8 text-center">
            <p className="text-white/70">Keine aktiven Freischaltungen.</p>
            <p className="text-white/50 text-sm mt-2">
              Klicken Sie auf "Frau freischalten" um eine Frau für alle User verfügbar zu machen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
