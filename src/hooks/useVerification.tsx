
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export function useVerification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get user's verification status
  const { data: verificationStatus, isLoading } = useQuery({
    queryKey: ['verification-status', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('verification_status, verification_requested_at, verified_at, id_document_url')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Request verification
  const requestVerification = useMutation({
    mutationFn: async (idDocumentFile: File) => {
      if (!user) throw new Error('Not authenticated');

      // Upload ID document
      const fileName = `${user.id}/${Date.now()}_${idDocumentFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('id-documents')
        .upload(fileName, idDocumentFile);

      if (uploadError) throw uploadError;

      // Update profile with verification request
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          verification_status: 'pending',
          verification_requested_at: new Date().toISOString(),
          id_document_url: uploadData.path
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Send email notification (this would be handled by an edge function)
      const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
        body: {
          userEmail: user.email,
          documentPath: uploadData.path,
          userId: user.id
        }
      });

      if (emailError) console.warn('Email notification failed:', emailError);

      return uploadData;
    },
    onSuccess: () => {
      toast({
        title: "Verifizierungsantrag gesendet",
        description: "Ihr Antrag wurde erfolgreich eingereicht. Sie erhalten eine Bestätigung per E-Mail.",
      });
      queryClient.invalidateQueries({ queryKey: ['verification-status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Senden des Verifizierungsantrags",
        variant: "destructive",
      });
    }
  });

  return {
    verificationStatus,
    isLoading,
    requestVerification: requestVerification.mutate,
    isRequestingVerification: requestVerification.isPending
  };
}

// Hook for admin user management
export function useUserManagement() {
  const queryClient = useQueryClient();

  // Get all users with verification status
  const { data: users, isLoading } = useQuery({
    queryKey: ['users-verification'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Verify user
  const verifyUser = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'verified' | 'rejected' }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          verification_status: status,
          verified_at: status === 'verified' ? new Date().toISOString() : null,
          verified_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Benutzer-Status aktualisiert",
        description: "Der Verifizierungsstatus wurde erfolgreich geändert.",
      });
      queryClient.invalidateQueries({ queryKey: ['users-verification'] });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Aktualisieren des Benutzer-Status",
        variant: "destructive",
      });
    }
  });

  return {
    users,
    isLoading,
    verifyUser: verifyUser.mutate,
    isVerifying: verifyUser.isPending
  };
}

// Hook for profile applications
export function useProfileApplications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get user's profile applications
  const { data: applications, isLoading } = useQuery({
    queryKey: ['profile-applications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('profile_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Submit profile application
  const submitApplication = useMutation({
    mutationFn: async (applicationData: any) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profile_applications')
        .insert({
          ...applicationData,
          user_id: user.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Profilantrag eingereicht",
        description: "Ihr Profilantrag wurde erfolgreich eingereicht und wird geprüft.",
      });
      queryClient.invalidateQueries({ queryKey: ['profile-applications'] });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Einreichen des Profilantrags",
        variant: "destructive",
      });
    }
  });

  return {
    applications,
    isLoading,
    submitApplication: submitApplication.mutate,
    isSubmitting: submitApplication.isPending
  };
}
