
import React, { useState } from 'react';
import { Shield, Upload, Clock, CheckCircle, X, AlertCircle } from 'lucide-react';
import { useVerification } from '@/hooks/useVerification';
import { toast } from '@/hooks/use-toast';

const VerificationSection: React.FC = () => {
  const { verificationStatus, isLoading, requestVerification, isRequestingVerification } = useVerification();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Ungültiger Dateityp",
        description: "Bitte laden Sie eine JPG, PNG oder PDF-Datei hoch.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Datei zu groß",
        description: "Die Datei darf maximal 10MB groß sein.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmitVerification = () => {
    if (!selectedFile) {
      toast({
        title: "Keine Datei ausgewählt",
        description: "Bitte wählen Sie eine Datei aus.",
        variant: "destructive",
      });
      return;
    }

    requestVerification(selectedFile);
  };

  const getStatusIcon = () => {
    switch (verificationStatus?.verification_status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'rejected':
        return <X className="w-5 h-5 text-red-400" />;
      default:
        return <Shield className="w-5 h-5 text-purple-400" />;
    }
  };

  const getStatusText = () => {
    switch (verificationStatus?.verification_status) {
      case 'verified':
        return 'Verifiziert';
      case 'pending':
        return 'Antrag in Bearbeitung';
      case 'rejected':
        return 'Antrag abgelehnt';
      default:
        return 'Nicht verifiziert';
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus?.verification_status) {
      case 'verified':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'rejected':
        return 'text-red-400';
      default:
        return 'text-white/70';
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6">
      <div className="flex items-center space-x-3 mb-4">
        {getStatusIcon()}
        <h2 className="text-lg sm:text-xl font-semibold text-white">Kontoverifizierung</h2>
      </div>
      
      <div className="space-y-4">
        {/* Current Status */}
        <div className="p-4 glass rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-white font-medium">Aktueller Status</p>
              <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>
              {verificationStatus?.verification_requested_at && (
                <p className="text-white/50 text-xs mt-1">
                  Beantragt am: {new Date(verificationStatus.verification_requested_at).toLocaleDateString('de-DE')}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
            </div>
          </div>
        </div>

        {/* Verification Request Form */}
        {verificationStatus?.verification_status === 'unverified' && (
          <div className="space-y-4">
            <div className="p-4 glass rounded-xl border border-purple-500/20">
              <div className="flex items-start space-x-3 mb-4">
                <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium mb-2">Verifizierung beantragen</h3>
                  <p className="text-white/70 text-sm">
                    Um Ihr Konto zu verifizieren, laden Sie bitte ein Foto oder Scan Ihres Personalausweises hoch. 
                    Ihre Daten werden sicher behandelt und nur zur Verifizierung verwendet.
                  </p>
                </div>
              </div>

              {/* File Upload Area */}
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                    dragActive 
                      ? 'border-purple-400 bg-purple-400/10' 
                      : 'border-white/20 hover:border-purple-400/50'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                >
                  <Upload className="w-8 h-8 text-white/50 mx-auto mb-4" />
                  <p className="text-white font-medium mb-2">
                    Personalausweis hochladen
                  </p>
                  <p className="text-white/70 text-sm mb-4">
                    Ziehen Sie die Datei hierher oder klicken Sie zum Auswählen
                  </p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileInput}
                    className="hidden"
                    id="id-upload"
                  />
                  <label
                    htmlFor="id-upload"
                    className="glass-button px-4 py-2 rounded-lg text-white cursor-pointer hover:bg-purple-600/30 transition-all duration-300 inline-block"
                  >
                    Datei auswählen
                  </label>
                  <p className="text-white/50 text-xs mt-2">
                    JPG, PNG oder PDF • Max. 10MB
                  </p>
                </div>

                {selectedFile && (
                  <div className="p-3 glass rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                          <Upload className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{selectedFile.name}</p>
                          <p className="text-white/70 text-xs">
                            {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-white/50 hover:text-red-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSubmitVerification}
                  disabled={!selectedFile || isRequestingVerification}
                  className="w-full glass-button px-6 py-3 rounded-xl text-white font-semibold hover:bg-purple-600/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRequestingVerification ? 'Wird gesendet...' : 'Verifizierung beantragen'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pending Status */}
        {verificationStatus?.verification_status === 'pending' && (
          <div className="p-4 glass rounded-xl border border-yellow-500/20">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-white font-medium">Antrag in Bearbeitung</p>
                <p className="text-white/70 text-sm">
                  Ihr Verifizierungsantrag wird geprüft. Sie erhalten eine E-Mail mit dem Ergebnis.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Verified Status */}
        {verificationStatus?.verification_status === 'verified' && (
          <div className="p-4 glass rounded-xl border border-green-500/20">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Konto verifiziert</p>
                <p className="text-white/70 text-sm">
                  Ihr Konto wurde erfolgreich verifiziert. Sie können jetzt ein Profil beantragen.
                </p>
                {verificationStatus?.verified_at && (
                  <p className="text-white/50 text-xs mt-1">
                    Verifiziert am: {new Date(verificationStatus.verified_at).toLocaleDateString('de-DE')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rejected Status */}
        {verificationStatus?.verification_status === 'rejected' && (
          <div className="p-4 glass rounded-xl border border-red-500/20">
            <div className="flex items-center space-x-3">
              <X className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-white font-medium">Antrag abgelehnt</p>
                <p className="text-white/70 text-sm">
                  Ihr Verifizierungsantrag wurde abgelehnt. Sie können einen neuen Antrag stellen.
                </p>
                <button
                  onClick={() => {
                    // Reset status to allow new request
                    window.location.reload();
                  }}
                  className="text-purple-400 text-sm hover:text-purple-300 transition-colors mt-2"
                >
                  Neuen Antrag stellen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationSection;
