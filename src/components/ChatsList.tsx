
import React from 'react';
import { MessageCircle, Clock } from 'lucide-react';
import { useChats } from '../hooks/useChats';
import { useAuth } from '../hooks/useAuth';

interface ChatsListProps {
  onChatSelect: (chatId: string, womanName: string) => void;
}

const ChatsList: React.FC<ChatsListProps> = ({ onChatSelect }) => {
  const { user } = useAuth();
  const { data: chats, isLoading, error } = useChats();

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
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white text-glow mb-6">Deine Chats</h2>
      
      <div className="space-y-3">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onChatSelect(chat.id, chat.woman?.name || 'Unknown')}
            className="glass rounded-xl p-4 cursor-pointer hover:bg-white/20 transition-all duration-300"
          >
            <div className="flex items-center space-x-4">
              <img
                src={chat.woman?.image_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop'}
                alt={chat.woman?.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-purple-400/50"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-white">{chat.woman?.name}</h3>
                <div className="flex items-center space-x-2 text-white/60 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>
                    Verfügbar zum Chatten
                  </span>
                </div>
              </div>
              <MessageCircle className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatsList;
