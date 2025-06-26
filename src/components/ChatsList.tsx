import React, { useState } from 'react';
import { MessageCircle, Clock } from 'lucide-react';
import { useChats } from '../hooks/useChats';
import { useAuth } from '../hooks/useAuth';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useFreeAccessPeriods } from '../hooks/useFreeAccess';
import ProfileModal from './ProfileModal';

interface ChatsListProps {
  onChatSelect: (chatId: string, womanId: string, womanName: string) => void;
}

const ChatsList: React.FC<ChatsListProps> = ({ onChatSelect }) => {
  const { user } = useAuth();
  const { data: chats, isLoading, error } = useChats();
  const { data: subscriptions } = useSubscriptions();
  const { data: freeAccessPeriods } = useFreeAccessPeriods();
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  const getAccessInfo = (womanId: string) => {
    // Check for active subscription
    const subscription = subscriptions?.find(
      sub => sub.woman_id === womanId && sub.active
    );
    
    if (subscription) {
      const expiresAt = subscription.expires_at ? new Date(subscription.expires_at) : null;
      return {
        type: 'subscription',
        expiresAt,
        isExpiring: expiresAt ? expiresAt.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 : false
      };
    }

    // Check for free access
    const freeAccess = freeAccessPeriods?.find(
      period => period.woman_id === womanId && 
                period.active && 
                new Date(period.start_time) <= new Date() && 
                new Date(period.end_time) > new Date() &&
                (!period.user_id || period.user_id === user?.id)
    );
    
    if (freeAccess) {
      const expiresAt = new Date(freeAccess.end_time);
      return {
        type: 'free',
        expiresAt,
        isExpiring: expiresAt.getTime() - Date.now() < 24 * 60 * 60 * 1000
      };
    }

    return null;
  };

  const formatTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Abgelaufen';
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} Tag${days !== 1 ? 'e' : ''}`;
    } else if (hours > 0) {
      return `${hours} Std.`;
    } else {
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${minutes} Min.`;
    }
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)}d`;
    } else {
      return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
    }
  };

  const handleProfileClick = (woman: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProfile(woman);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <MessageCircle className="w-16 h-16 text-white/40 mb-4" />
        <h3 className="text-white font-semibold mb-2">Anmelden erforderlich</h3>
        <p className="text-white/70">
          Melde dich an, um deine Chats zu sehen
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Chats werden geladen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-center">
          <p>Fehler beim Laden der Chats</p>
        </div>
      </div>
    );
  }

  if (!chats || chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <MessageCircle className="w-16 h-16 text-white/40 mb-4" />
        <h3 className="text-white font-semibold mb-2">Keine verfügbaren Chats</h3>
        <p className="text-white/70">
          Du hast derzeit keine aktiven Abonnements oder Freischaltungen. 
          Abonniere Profile oder warte auf Freischaltungen, um zu chatten.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white text-glow mb-6">Deine Chats</h2>
        
        <div className="space-y-3">
          {chats.map((chat) => {
            const accessInfo = getAccessInfo(chat.woman_id);
            const woman = chat.woman;
            const lastMessage = chat.lastMessage;
            
            return (
              <div
                key={chat.id}
                onClick={() => onChatSelect(chat.id, chat.woman_id, woman?.name || 'Unknown')}
                className="glass rounded-xl p-4 cursor-pointer hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={woman?.image_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop'}
                      alt={woman?.name}
                      onClick={(e) => handleProfileClick(woman, e)}
                      className="w-16 h-16 rounded-full object-cover border-2 border-purple-400/50 hover:border-purple-400 transition-colors cursor-pointer"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-gray-900"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 
                        className="font-semibold text-white text-lg hover:text-purple-300 transition-colors cursor-pointer"
                        onClick={(e) => handleProfileClick(woman, e)}
                      >
                        {woman?.name}
                      </h3>
                      {lastMessage && (
                        <span className="text-xs text-white/50">
                          {formatLastMessageTime(lastMessage.created_at)}
                        </span>
                      )}
                    </div>
                    
                    {lastMessage && (
                      <p className="text-white/70 text-sm truncate mb-1">
                        {lastMessage.sender_type === 'user' ? 'Du: ' : ''}
                        {lastMessage.content}
                      </p>
                    )}
                    
                    {accessInfo && (
                      <div className={`flex items-center space-x-2 text-sm ${
                        accessInfo.isExpiring ? 'text-orange-400' : 'text-white/70'
                      }`}>
                        <Clock className="w-4 h-4" />
                        <span>
                          {accessInfo.type === 'subscription' ? 'Abonniert' : 'Freigeschaltet'}
                          {accessInfo.expiresAt && (
                            <span className="ml-2">
                              • {formatTimeRemaining(accessInfo.expiresAt)} verbleibend
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <MessageCircle className="w-5 h-5 text-purple-400" />
                    {accessInfo?.isExpiring && (
                      <div className="bg-orange-500/20 px-2 py-1 rounded text-xs text-orange-400">
                        Läuft bald ab
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedProfile && (
        <ProfileModal
          isOpen={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
          woman={selectedProfile}
        />
      )}
    </>
  );
};

export default ChatsList;
