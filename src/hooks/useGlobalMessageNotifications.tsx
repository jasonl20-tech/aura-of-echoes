
import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';
import { useChats } from './useChats';
import { supabase } from '@/integrations/supabase/client';

interface UseGlobalMessageNotificationsProps {
  currentChatId?: string | null;
}

export const useGlobalMessageNotifications = ({ currentChatId }: UseGlobalMessageNotificationsProps) => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const { data: chats } = useChats();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user || !chats) return;

    console.log('🔔 Setting up global message notifications for user:', user.id);

    // Create a channel to listen to all messages for user's chats
    const channel = supabase
      .channel(`global-messages-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_type=eq.ai`
        },
        async (payload) => {
          console.log('🔔 Global message received:', payload);
          
          const message = payload.new;
          const messageChatId = message.chat_id;
          
          // Check if this message is for one of the user's chats
          const userChat = chats.find(chat => chat.id === messageChatId);
          if (!userChat) {
            console.log('🔔 Message not for user chat, ignoring');
            return;
          }

          // Don't show notification if user is currently in this chat
          if (messageChatId === currentChatId) {
            console.log('🔔 User is in current chat, not showing notification');
            return;
          }

          // Get woman name for notification
          const womanName = userChat.woman?.name || 'Unknown';
          
          console.log('🔔 Showing global notification for message from:', womanName);
          
          // Show notification
          showNotification(
            `New message from ${womanName}`,
            {
              body: message.message_type === 'audio' ? '🎤 Audio message' : message.content,
              tag: `global-chat-${messageChatId}`,
              requireInteraction: true,
              icon: userChat.woman?.image_url || '/favicon.ico',
            }
          );
        }
      )
      .subscribe((status) => {
        console.log('🔔 Global message subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('🔔 Cleaning up global message notifications');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, chats, currentChatId, showNotification]);

  return null;
};
