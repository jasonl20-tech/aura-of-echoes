
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Chat {
  id: string;
  user_id: string;
  woman_id: string;
  created_at: string | null;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_type: string;
  content: string;
  created_at: string;
}

export function useChats() {
  return useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Chat[];
    },
  });
}

export function useMessages(chatId: string) {
  return useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      if (!chatId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!chatId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, content, womanId }: { 
      chatId: string; 
      content: string; 
      womanId: string;
    }) => {
      console.log('Sending message via webhook...', { chatId, content, womanId });

      // Rufe die send-message Edge Function auf
      const { data, error } = await supabase.functions.invoke('send-message', {
        body: {
          chatId,
          content,
          womanId,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Message sent successfully:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidiere die Messages Query um neue Nachrichten zu laden
      queryClient.invalidateQueries({ 
        queryKey: ['messages', variables.chatId] 
      });
      
      console.log('Message sent and queries invalidated');
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
    },
  });
}

export function useCreateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ womanId }: { womanId: string }) => {
      const { data, error } = await supabase
        .from('chats')
        .insert({
          woman_id: womanId,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Chat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}
