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
    age?: number;
    description?: string;
    interests?: string[];
  };
  lastMessage?: {
    id: string;
    content: string;
    sender_type: 'user' | 'ai';
    created_at: string;
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

      // Hole alle Frauen, zu denen der User Zugang hat (Abonnement oder Freischaltung)
      const { data: accessibleWomen, error: accessError } = await supabase
        .from('women')
        .select(`
          id,
          name,
          image_url,
          age,
          description,
          interests
        `);

      if (accessError) throw accessError;

      if (!accessibleWomen || accessibleWomen.length === 0) {
        return [];
      }

      // Filtere Frauen basierend auf Zugang (Abonnement oder Freischaltung)
      const womenWithAccess = [];
      for (const woman of accessibleWomen) {
        const { data: hasAccess } = await supabase.rpc('has_subscription_or_free_access', {
          user_id: user.id,
          woman_id: woman.id
        });

        if (hasAccess) {
          womenWithAccess.push(woman);
        }
      }

      if (womenWithAccess.length === 0) {
        return [];
      }

      // Erstelle automatisch Chats für alle verfügbaren Frauen, falls sie noch nicht existieren
      const womanIds = womenWithAccess.map(w => w.id);
      
      // Hole existierende Chats
      const { data: existingChats } = await supabase
        .from('chats')
        .select('woman_id')
        .eq('user_id', user.id)
        .in('woman_id', womanIds);

      const existingWomanIds = existingChats?.map(chat => chat.woman_id) || [];
      const missingWomanIds = womanIds.filter(id => !existingWomanIds.includes(id));

      // Erstelle fehlende Chats
      if (missingWomanIds.length > 0) {
        const newChats = missingWomanIds.map(womanId => ({
          user_id: user.id,
          woman_id: womanId
        }));

        await supabase
          .from('chats')
          .insert(newChats);
      }

      // Hole alle Chats mit Frauen-Informationen
      const { data: chats, error } = await supabase
        .from('chats')
        .select(`
          *,
          women:woman_id (
            id,
            name,
            image_url,
            age,
            description,
            interests
          )
        `)
        .eq('user_id', user.id)
        .in('woman_id', womanIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Hole letzte Nachricht für jeden Chat
      const chatsWithLastMessage = await Promise.all(
        chats.map(async (chat) => {
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('id, content, sender_type, created_at')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...chat,
            woman: chat.women,
            lastMessage
          };
        })
      );

      // Sortiere Chats nach letzter Nachricht
      return chatsWithLastMessage.sort((a, b) => {
        const aTime = a.lastMessage?.created_at || a.created_at;
        const bTime = b.lastMessage?.created_at || b.created_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });
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

      // Prüfe ob User Zugang zu dieser Frau hat
      const { data: hasAccess } = await supabase.rpc('has_subscription_or_free_access', {
        user_id: user.id,
        woman_id: womanId
      });

      if (!hasAccess) {
        throw new Error('Kein Zugang zu dieser Frau');
      }

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
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}
