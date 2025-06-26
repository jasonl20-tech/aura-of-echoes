
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Chat {
  id: string;
  user_id: string;
  woman_id: string;
  created_at: string;
  woman?: {
    id: string;
    name: string;
    image_url: string | null;
  };
}

export interface Message {
  id: string;
  chat_id: string;
  content: string;
  sender_type: 'user' | 'ai';
  created_at: string;
}

export function useChats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['chats', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          women:woman_id (
            id,
            name,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Chat[];
    },
    enabled: !!user,
  });
}

export function useCreateChat() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (womanId: string) => {
      if (!user) throw new Error('Not authenticated');

      // Check if chat already exists
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('user_id', user.id)
        .eq('woman_id', womanId)
        .maybeSingle();

      if (existingChat) {
        return existingChat;
      }

      // Create new chat
      const { data, error } = await supabase
        .from('chats')
        .insert({
          user_id: user.id,
          woman_id: womanId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}

export function useMessages(chatId: string) {
  return useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
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
    mutationFn: async ({ chatId, content, senderType }: {
      chatId: string;
      content: string;
      senderType: 'user' | 'ai';
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          content,
          sender_type: senderType,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] });
    },
  });
}
