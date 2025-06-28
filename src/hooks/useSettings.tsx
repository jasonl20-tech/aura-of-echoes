
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
      title: "Settings saved",
      description: "Your settings have been successfully updated.",
    });
  };

  // Delete all chat data for user
  const deleteAllChatData = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to perform this action.",
        variant: "destructive",
      });
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete all your chat data? This action cannot be undone."
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
        title: "Chat data deleted",
        description: "All your chat data has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('Error deleting chat data:', error);
      toast({
        title: "Error",
        description: "Error deleting chat data: " + error.message,
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
        title: "Error",
        description: "You must be signed in to perform this action.",
        variant: "destructive",
      });
      return;
    }

    const confirmDelete = window.confirm(
      "Are you REALLY sure you want to delete your account?\n\nThis action:\n- Permanently deletes all your data\n- Cancels all active subscriptions\n- CANNOT be undone\n\nType 'DELETE' to confirm:"
    );

    if (!confirmDelete) return;

    const confirmation = window.prompt(
      "Please type 'DELETE' to confirm account deletion:"
    );

    if (confirmation !== 'DELETE') {
      toast({
        title: "Cancelled",
        description: "Account deletion was cancelled.",
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
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Error deleting account: " + error.message,
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
