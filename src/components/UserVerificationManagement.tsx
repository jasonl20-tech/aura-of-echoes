
import React, { useState } from 'react';
import { Shield, CheckCircle, X, Clock, Users, Eye, Download } from 'lucide-react';
import { useUserManagement } from '@/hooks/useVerification';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const UserVerificationManagement: React.FC = () => {
  const { users, isLoading, verifyUser, isVerifying } = useUserManagement();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const isMobile = useIsMobile();

  const handleVerifyUser = (userId: string, status: 'verified' | 'rejected') => {
    const confirmMessage = status === 'verified' 
      ? 'Möchten Sie diesen Benutzer wirklich verifizieren?'
      : 'Möchten Sie den Verifizierungsantrag dieses Benutzers wirklich ablehnen?';
      
    if (window.confirm(confirmMessage)) {
      verifyUser({ userId, status });
    }
  };

  const viewDocument = async (user: any) => {
    if (!user.id_document_url) {
      toast({
        title: "Kein Dokument",
        description: "Für diesen Benutzer wurde kein Dokument hochgeladen.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('id-documents')
        .createSignedUrl(user.id_document_url, 3600); // 1 hour

      if (error) throw error;
      
      setSelectedUser({ ...user, documentUrl: data.signedUrl });
      setShowDocumentModal(true);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Dokument konnte nicht geladen werden: " + error.message,
        variant: "destructive",
      });
    }
  };

  const downloadDocument = async (user: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('id-documents')
        .download(user.id_document_url);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ID_${user.email}_${new Date().toISOString().split('T')[0]}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Dokument konnte nicht heruntergeladen werden: " + error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-400" />;
      default:
        return <Shield className="w-4 h-4 text-white/50" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Verifiziert';
      case 'pending':
        return 'Wartet auf Prüfung';
      case 'rejected':
        return 'Abgelehnt';
      default:
        return 'Nicht verifiziert';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'rejected':
        return 'text-red-400';
      default:
        return 'text-white/50';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black p-4 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Benutzerliste wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white text-glow flex items-center gap-2">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
          Benutzer-Verifizierung
        </h2>
        <div className="bg-purple-400/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
          {users ? users.length : 0} Benutzer
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {users && users.length > 0 ? (
          users.map((user) => (
            <div key={user.id} className="glass-card rounded-xl p-4">
              {/* Mobile Layout */}
              {isMobile ? (
                <div className="space-y-4">
                  {/* User Info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-white truncate">
                        {user.email}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusIcon(user.verification_status)}
                        <span className={`text-xs ${getStatusColor(user.verification_status)}`}>
                          {getStatusText(user.verification_status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <p className="text-white/70">
                      Registriert: {new Date(user.created_at).toLocaleDateString('de-DE')}
                    </p>
                    {user.verification_requested_at && (
                      <p className="text-white/70">
                        Antrag: {new Date(user.verification_requested_at).toLocaleDateString('de-DE')}
                      </p>
                    )}
                    {user.verified_at && (
                      <p className="text-green-400 text-sm">
                        Verifiziert: {new Date(user.verified_at).toLocaleDateString('de-DE')}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    {user.id_document_url && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewDocument(user)}
                          className="flex-1 glass-button px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-blue-600/30 transition-all duration-300 text-sm flex items-center justify-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Dokument anzeigen</span>
                        </button>
                        <button
                          onClick={() => downloadDocument(user)}
                          className="flex-1 glass-button px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-purple-600/30 transition-all duration-300 text-sm flex items-center justify-center space-x-1"
                        >
                          <Download className="w-4 h-4" />
                          <span>Herunterladen</span>
                        </button>
                      </div>
                    )}
                    
                    {user.verification_status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleVerifyUser(user.id, 'verified')}
                          disabled={isVerifying}
                          className="flex-1 glass-button px-3 py-2 rounded-lg text-white hover:bg-green-600/30 transition-all duration-300 text-sm disabled:opacity-50"
                        >
                          ✓ Verifizieren
                        </button>
                        <button
                          onClick={() => handleVerifyUser(user.id, 'rejected')}
                          disabled={isVerifying}
                          className="flex-1 glass-button px-3 py-2 rounded-lg text-white hover:bg-red-600/30 transition-all duration-300 text-sm disabled:opacity-50"
                        >
                          ✗ Ablehnen
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Desktop Layout */
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-purple-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-white truncate">
                        {user.email}
                      </h4>
                      
                      <div className="flex items-center space-x-4 text-sm text-white/70 mt-1">
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(user.verification_status)}
                          <span className={getStatusColor(user.verification_status)}>
                            {getStatusText(user.verification_status)}
                          </span>
                        </div>
                        
                        <span>
                          Registriert: {new Date(user.created_at).toLocaleDateString('de-DE')}
                        </span>
                        
                        {user.verification_requested_at && (
                          <span>
                            Antrag: {new Date(user.verification_requested_at).toLocaleDateString('de-DE')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {user.id_document_url && (
                      <>
                        <button
                          onClick={() => viewDocument(user)}
                          className="glass-button px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-blue-600/30 transition-all duration-300 text-sm flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Anzeigen</span>
                        </button>
                        <button
                          onClick={() => downloadDocument(user)}
                          className="glass-button px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-purple-600/30 transition-all duration-300 text-sm flex items-center space-x-1"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </>
                    )}
                    
                    {user.verification_status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleVerifyUser(user.id, 'verified')}
                          disabled={isVerifying}
                          className="glass-button px-4 py-2 rounded-lg text-white hover:bg-green-600/30 transition-all duration-300 text-sm disabled:opacity-50"
                        >
                          ✓ Verifizieren
                        </button>
                        <button
                          onClick={() => handleVerifyUser(user.id, 'rejected')}
                          disabled={isVerifying}
                          className="glass-button px-4 py-2 rounded-lg text-white hover:bg-red-600/30 transition-all duration-300 text-sm disabled:opacity-50"
                        >
                          ✗ Ablehnen
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="glass-card rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-white/70 text-lg">Keine Benutzer gefunden.</p>
          </div>
        )}
      </div>

      {/* Document Modal */}
      {showDocumentModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-black/80 backdrop-blur-sm p-4 sm:p-6 border-b border-white/10 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-lg sm:text-xl font-semibold text-white">
                  Ausweisdokument - {selectedUser.email}
                </h3>
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <img
                src={selectedUser.documentUrl}
                alt="ID Document"
                className="w-full h-auto rounded-lg"
                style={{ maxHeight: '70vh', objectFit: 'contain' }}
              />
              
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  onClick={() => downloadDocument(selectedUser)}
                  className="flex-1 glass-button px-6 py-3 rounded-xl text-white font-semibold hover:bg-purple-600/30 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Herunterladen</span>
                </button>
                
                {selectedUser.verification_status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleVerifyUser(selectedUser.id, 'verified');
                        setShowDocumentModal(false);
                      }}
                      disabled={isVerifying}
                      className="flex-1 glass-button px-6 py-3 rounded-xl text-white font-semibold hover:bg-green-600/30 transition-all duration-300 disabled:opacity-50"
                    >
                      ✓ Verifizieren
                    </button>
                    <button
                      onClick={() => {
                        handleVerifyUser(selectedUser.id, 'rejected');
                        setShowDocumentModal(false);
                      }}
                      disabled={isVerifying}
                      className="flex-1 glass-button px-6 py-3 rounded-xl text-white font-semibold hover:bg-red-600/30 transition-all duration-300 disabled:opacity-50"
                    >
                      ✗ Ablehnen
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserVerificationManagement;
