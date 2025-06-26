
import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Smile, ArrowLeft } from 'lucide-react';
import { useMessages, useSendMessage } from '../hooks/useChats';
import { useAuth } from '../hooks/useAuth';

interface ChatViewProps {
  chatId?: string;
  womanName?: string;
  onBack?: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ chatId, womanName, onBack }) => {
  const { user } = useAuth();
  const { data: messages, isLoading } = useMessages(chatId || '');
  const sendMessage = useSendMessage();
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = async () => {
    if (!chatId || !newMessage.trim() || sendMessage.isPending) return;

    try {
      await sendMessage.mutateAsync({
        chatId,
        content: newMessage,
        senderType: 'user',
      });
      setNewMessage('');

      // Simulate AI response after a delay
      setTimeout(async () => {
        await sendMessage.mutateAsync({
          chatId,
          content: 'Das ist interessant! Erzähl mir mehr davon. 😊',
          senderType: 'ai',
        });
      }, 1000);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const suggestedMessages = [
    "Wie war dein Tag?",
    "Was sind deine Hobbies?",
    "Erzähl mir von dir",
    "Was machst du gerne?"
  ];

  if (!chatId || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
        <div className="glass-card rounded-3xl p-8 max-w-sm">
          <MessageCircle className="w-16 h-16 text-pink-400 mx-auto mb-4 animate-glow" />
          <h2 className="text-xl font-bold text-white mb-3">
            Chat auswählen
          </h2>
          <p className="text-white/70">
            Wähle einen Chat aus der Liste oder abonniere neue Profile, um zu chatten.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Chat wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[70vh]">
      {/* Chat Header */}
      <div className="glass-card rounded-2xl p-4 mb-4">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="glass-button p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          )}
          <img
            src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop"
            alt={womanName}
            className="w-12 h-12 rounded-full object-cover border-2 border-pink-400/50"
          />
          <div>
            <h3 className="font-semibold text-white">{womanName}</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-white/60">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto mb-4">
        {messages?.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.sender_type === 'user'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-br-sm'
                  : 'glass-card text-white rounded-bl-sm'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.sender_type === 'user' ? 'text-white/70' : 'text-white/50'
              }`}>
                {new Date(message.created_at).toLocaleTimeString('de-DE', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        )) || (
          <div className="text-center text-white/70 py-8">
            <p>Noch keine Nachrichten. Starte das Gespräch!</p>
          </div>
        )}
      </div>

      {/* Suggested Messages */}
      <div className="flex flex-wrap gap-2 mb-4">
        {suggestedMessages.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => setNewMessage(suggestion)}
            className="glass-button px-3 py-1 rounded-full text-sm text-white/80 hover:text-white"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Message Input */}
      <div className="glass-card rounded-2xl p-3">
        <div className="flex items-center space-x-3">
          <button className="glass-button p-2 rounded-full">
            <Smile className="w-5 h-5 text-white/60" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Schreibe eine Nachricht..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/50"
          />
          <button
            onClick={handleSendMessage}
            disabled={sendMessage.isPending || !newMessage.trim()}
            className="bg-gradient-to-r from-pink-500 to-purple-500 p-2 rounded-full hover:from-pink-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
