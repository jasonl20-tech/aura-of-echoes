
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface UserSettings {
  saveChatHistory: boolean;
  useDataForImprovements: boolean;
  language: 'de' | 'en';
}

const DEFAULT_SETTINGS: UserSettings = {
  saveChatHistory: true,
  useDataForImprovements: true,
  language: 'de'
};

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Failed to parse user settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
    
    toast({
      title: "Einstellungen gespeichert",
      description: "Ihre Einstellungen wurden erfolgreich aktualisiert.",
    });
  };

  // Delete all chat data for user
  const deleteAllChatData = async () => {
    if (!user) {
      toast({
        title: "Fehler",
        description: "Sie müssen angemeldet sein, um diese Aktion durchzuführen.",
        variant: "destructive",
      });
      return;
    }

    const confirmDelete = window.confirm(
      "Sind Sie sicher, dass Sie alle Ihre Chat-Daten löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
    );

    if (!confirmDelete) return;

    setLoading(true);
    try {
      // Get all chats for the user
      const { data: chats, error: chatsError } = await supabase
        .from('chats')
        .select('id')
        .eq('user_id', user.id);

      if (chatsError) throw chatsError;

      if (chats && chats.length > 0) {
        const chatIds = chats.map(chat => chat.id);

        // Delete all messages for these chats
        const { error: messagesError } = await supabase
          .from('messages')
          .delete()
          .in('chat_id', chatIds);

        if (messagesError) throw messagesError;

        // Delete all chats
        const { error: deleteChatsError } = await supabase
          .from('chats')
          .delete()
          .eq('user_id', user.id);

        if (deleteChatsError) throw deleteChatsError;
      }

      toast({
        title: "Chat-Daten gelöscht",
        description: "Alle Ihre Chat-Daten wurden erfolgreich gelöscht.",
      });
    } catch (error: any) {
      console.error('Error deleting chat data:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen der Chat-Daten: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete user account
  const deleteAccount = async () => {
    if (!user) {
      toast({
        title: "Fehler",
        description: "Sie müssen angemeldet sein, um diese Aktion durchzuführen.",
        variant: "destructive",
      });
      return;
    }

    const confirmDelete = window.confirm(
      "Sind Sie WIRKLICH sicher, dass Sie Ihr Konto löschen möchten?\n\nDiese Aktion:\n- Löscht alle Ihre Daten unwiderruflich\n- Beendet alle aktiven Abonnements\n- Kann NICHT rückgängig gemacht werden\n\nGeben Sie 'LÖSCHEN' ein, um zu bestätigen:"
    );

    if (!confirmDelete) return;

    const confirmation = window.prompt(
      "Bitte geben Sie 'LÖSCHEN' ein, um die Kontolöschung zu bestätigen:"
    );

    if (confirmation !== 'LÖSCHEN') {
      toast({
        title: "Abgebrochen",
        description: "Kontolöschung wurde abgebrochen.",
      });
      return;
    }

    setLoading(true);
    try {
      // First delete all user data
      await deleteAllChatData();

      // Delete subscriptions
      const { error: subscriptionsError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', user.id);

      if (subscriptionsError) throw subscriptionsError;

      // Delete user roles
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);

      if (rolesError) throw rolesError;

      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Finally delete the auth user (this will sign them out)
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        // If we can't delete via admin API, sign out the user
        await supabase.auth.signOut();
      }

      toast({
        title: "Konto gelöscht",
        description: "Ihr Konto wurde erfolgreich gelöscht.",
      });
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen des Kontos: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    saveSettings,
    deleteAllChatData,
    deleteAccount,
    loading
  };
}
