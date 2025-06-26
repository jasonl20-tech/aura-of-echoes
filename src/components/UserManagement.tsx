
import React, { useState } from 'react';
import { Clock, Users, Gift, X, Calendar, CheckCircle, User } from 'lucide-react';
import { useWomen } from '@/hooks/useWomen';
import { useUsers } from '@/hooks/useUsers';
import { useFreeAccessPeriods, useCreateFreeAccess, useDeactivateFreeAccess } from '@/hooks/useFreeAccess';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const UserManagement: React.FC = () => {
  const { data: women } = useWomen();
  const { data: users } = useUsers();
  const { data: freeAccessPeriods, refetch } = useFreeAccessPeriods();
  const createFreeAccess = useCreateFreeAccess();
  const deactivateFreeAccess = useDeactivateFreeAccess();
  const isMobile = useIsMobile();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedWomanId, setSelectedWomanId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [accessType, setAccessType] = useState<'all' | 'specific'>('all');
  const [duration, setDuration] = useState(24);
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

    if (accessType === 'specific' && !selectedUserId) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie einen User aus.",
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
        endTime,
        userId: accessType === 'specific' ? selectedUserId : undefined
      });

      const selectedWoman = women?.find(w => w.id === selectedWomanId);
      const selectedUser = users?.find(u => u.id === selectedUserId);
      
      toast({
        title: "Erfolgreich!",
        description: accessType === 'all' 
          ? `${selectedWoman?.name} wurde für alle User freigeschaltet.`
          : `${selectedWoman?.name} wurde für ${selectedUser?.email} freigeschaltet.`,
      });

      setShowCreateForm(false);
      setSelectedWomanId('');
      setSelectedUserId('');
      setAccessType('all');
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

  const handleDeactivate = async (accessId: string, womanName: string, userEmail?: string) => {
    const message = userEmail 
      ? `Möchten Sie die Freischaltung für ${womanName} bei ${userEmail} wirklich deaktivieren?`
      : `Möchten Sie die Freischaltung für ${womanName} (alle User) wirklich deaktivieren?`;
      
    if (window.confirm(message)) {
      try {
        await deactivateFreeAccess.mutateAsync(accessId);
        toast({
          title: "Erfolgreich!",
          description: `Freischaltung wurde deaktiviert.`,
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
    <div className="min-h-screen bg-black p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white text-glow flex items-center gap-2">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
            User Management
          </h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full sm:w-auto glass-button px-4 py-3 rounded-xl text-white font-semibold hover:bg-purple-600/30 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Frau freischalten</span>
          </button>
        </div>
      </div>

      {/* Create Free Access Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-black/80 backdrop-blur-sm p-4 sm:p-6 border-b border-white/10 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-lg sm:text-xl font-semibold text-white">Frau freischalten</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Access Type Selection */}
              <div>
                <label className="text-white/70 text-sm mb-3 block font-medium">Freischaltungstyp</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setAccessType('all')}
                    className={`w-full p-4 rounded-xl transition-all duration-300 flex items-center space-x-3 ${
                      accessType === 'all'
                        ? 'glass-button bg-purple-600/30 text-white border-purple-400/40'
                        : 'glass text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Users className="w-5 h-5 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium">Für alle User</div>
                      <div className="text-xs text-white/60">Alle registrierten User können zugreifen</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setAccessType('specific')}
                    className={`w-full p-4 rounded-xl transition-all duration-300 flex items-center space-x-3 ${
                      accessType === 'specific'
                        ? 'glass-button bg-purple-600/30 text-white border-purple-400/40'
                        : 'glass text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <User className="w-5 h-5 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium">Für spezifischen User</div>
                      <div className="text-xs text-white/60">Nur ein bestimmter User kann zugreifen</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* User Selection */}
              {accessType === 'specific' && (
                <div>
                  <label className="text-white/70 text-sm mb-2 block font-medium">User auswählen</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="" className="bg-gray-800">User auswählen...</option>
                    {users?.map((user) => (
                      <option key={user.id} value={user.id} className="bg-gray-800">
                        {user.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Woman Selection */}
              <div>
                <label className="text-white/70 text-sm mb-2 block font-medium">Frau auswählen</label>
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

              {/* Duration Settings */}
              <div className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm mb-2 block font-medium">Dauer (Stunden)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 24)}
                    className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="1"
                    max="8760"
                    placeholder="24"
                  />
                </div>

                <div className="text-center text-white/50 text-sm">oder</div>

                <div>
                  <label className="text-white/70 text-sm mb-2 block font-medium">Spezifisches Enddatum</label>
                  <input
                    type="datetime-local"
                    value={customEndTime}
                    onChange={(e) => setCustomEndTime(e.target.value)}
                    className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3 pt-4">
                <button
                  onClick={handleCreateFreeAccess}
                  disabled={createFreeAccess.isPending || !selectedWomanId || (accessType === 'specific' && !selectedUserId)}
                  className="w-full glass-button py-4 rounded-xl text-white font-semibold hover:bg-green-600/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Gift className="w-5 h-5" />
                  <span>{createFreeAccess.isPending ? 'Wird erstellt...' : 'Freischalten'}</span>
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="w-full glass-button py-4 rounded-xl text-white/70 font-semibold hover:bg-red-600/30 transition-all duration-300"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Free Access Periods */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Aktive Freischaltungen
          </h3>
          <div className="bg-green-400/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
            {freeAccessPeriods?.filter(p => p.active).length || 0}
          </div>
        </div>
        
        {freeAccessPeriods && freeAccessPeriods.length > 0 ? (
          <div className="space-y-3">
            {freeAccessPeriods
              .filter(period => period.active)
              .map((period) => {
                const woman = (period as any).women;
                const userProfile = (period as any).profiles;
                const active = isActive(period.start_time, period.end_time);
                
                return (
                  <div key={period.id} className="glass-card rounded-xl p-4">
                    {/* Mobile Layout */}
                    {isMobile ? (
                      <div className="space-y-4">
                        {/* Woman Info */}
                        <div className="flex items-center space-x-3">
                          <img
                            src={woman?.image_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=60&h=60&fit=crop'}
                            alt={woman?.name || 'Unknown'}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-semibold text-white truncate">
                              {woman?.name || 'Unbekannt'}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              {active ? (
                                <div className="flex items-center space-x-1">
                                  <CheckCircle className="w-3 h-3 text-green-400" />
                                  <span className="text-xs text-green-400">Aktiv</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3 text-orange-400" />
                                  <span className="text-xs text-orange-400">Abgelaufen</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-white/60" />
                            <span className="text-white/70">Bis: {formatDateTime(period.end_time)}</span>
                          </div>
                          
                          {userProfile ? (
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-blue-400" />
                              <span className="text-blue-400 truncate">{userProfile.email}</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-purple-400" />
                              <span className="text-purple-400">Alle User</span>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => handleDeactivate(
                            period.id, 
                            woman?.name || 'diese Frau',
                            userProfile?.email
                          )}
                          className="w-full glass-button px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-red-600/30 transition-all duration-300 text-sm"
                        >
                          Deaktivieren
                        </button>
                      </div>
                    ) : (
                      /* Desktop Layout */
                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <img
                            src={woman?.image_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=60&h=60&fit=crop'}
                            alt={woman?.name || 'Unknown'}
                            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-semibold text-white truncate">
                              {woman?.name || 'Unbekannt'}
                            </h4>
                            
                            <div className="flex items-center gap-4 text-sm text-white/70 mt-1">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">Bis: {formatDateTime(period.end_time)}</span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                {active ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                    <span className="text-green-400">Aktiv</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-4 h-4 text-orange-400 flex-shrink-0" />
                                    <span className="text-orange-400">Abgelaufen</span>
                                  </>
                                )}
                              </div>

                              {userProfile ? (
                                <div className="flex items-center space-x-1">
                                  <User className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                  <span className="text-blue-400 truncate">{userProfile.email}</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1">
                                  <Users className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                  <span className="text-purple-400">Alle User</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleDeactivate(
                            period.id, 
                            woman?.name || 'diese Frau',
                            userProfile?.email
                          )}
                          className="glass-button px-6 py-3 rounded-lg text-white/70 hover:text-white hover:bg-red-600/30 transition-all duration-300 text-sm flex-shrink-0"
                        >
                          Deaktivieren
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">🎁</div>
            <p className="text-white/70 text-lg mb-2">Keine aktiven Freischaltungen.</p>
            <p className="text-white/50 text-sm">
              Klicken Sie auf "Frau freischalten" um eine Frau für User verfügbar zu machen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
