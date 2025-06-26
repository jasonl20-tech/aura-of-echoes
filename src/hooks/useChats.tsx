
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Chat {
  id: string;
  user_id: string;
  woman_id: string;
  created_at: string | null;
  woman?: {
    id: string;
    name: string;
    image_url: string | null;
  };
  lastMessage?: {
    id: string;
    content: string;
    sender_type: string;
    created_at: string;
  };
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
      // Lade Chats mit Frauen-Daten und letzter Nachricht
      const { data: chatsData, error } = await supabase
        .from('chats')
        .select(`
          *,
          women:woman_id (
            id,
            name,
            image_url
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Lade die letzte Nachricht für jeden Chat
      const chatsWithMessages = await Promise.all(
        (chatsData || []).map(async (chat) => {
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...chat,
            woman: Array.isArray(chat.women) ? chat.women[0] : chat.women,
            lastMessage
          };
        })
      );

      return chatsWithMessages as Chat[];
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
    mutationFn: async ({ chatId, content, womanId, audioBlob }: { 
      chatId: string; 
      content?: string; 
      womanId: string;
      audioBlob?: Blob;
    }) => {
      console.log('Sending message via webhook...', { chatId, content, womanId, hasAudio: !!audioBlob });

      let body: any = {
        chatId,
        womanId,
      };

      if (audioBlob) {
        // Convert audio blob to base64
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        body.audioData = base64Audio;
        body.audioType = audioBlob.type;
        body.content = '[Audio-Nachricht]'; // Fallback text for display
      } else {
        body.content = content;
      }

      // Rufe die send-message Edge Function auf
      const { data, error } = await supabase.functions.invoke('send-message', {
        body
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
      
      // Invalidiere auch die Chats Query um die letzte Nachricht zu aktualisieren
      queryClient.invalidateQueries({ 
        queryKey: ['chats'] 
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('chats')
        .insert({
          woman_id: womanId,
          user_id: user.id,
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
