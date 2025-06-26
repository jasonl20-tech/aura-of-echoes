
import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, MoreVertical } from 'lucide-react';
import { useMessages, useSendMessage } from '../hooks/useChats';
import { useAuth } from '../hooks/useAuth';
import { useWoman } from '../hooks/useWomen';
import ProfileModal from './ProfileModal';

interface ChatViewProps {
  chatId?: string;
  womanId?: string;
  womanName?: string;
  onBack?: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ chatId, womanId, womanName, onBack }) => {
  const { user } = useAuth();
  const { data: messages, isLoading: messagesLoading } = useMessages(chatId || '');
  const { data: woman, isLoading: womanLoading } = useWoman(womanId || '');
  const sendMessage = useSendMessage();
  const [newMessage, setNewMessage] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Verwende echte Daten wenn verfügbar, sonst Fallback
  const womanData = woman || {
    id: womanId || 'unknown',
    name: womanName || 'Unknown',
    image_url: null,
    age: 25,
    description: 'Ich liebe es, neue Leute kennenzulernen und interessante Gespräche zu führen.',
    interests: ['Reisen', 'Fotografie', 'Musik', 'Sport'],
    personality: 'Freundlich und aufgeschlossen',
    webhook_url: '',
    price: 3.99,
    height: null,
    origin: null,
    nsfw: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Fallback-Bild URL
  const fallbackImageUrl = 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=300&h=300&fit=crop&faces=1&auto=format';
  const imageUrl = womanData.image_url || fallbackImageUrl;

  // Auto-scroll zu neuen Nachrichten
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!chatId || !newMessage.trim() || sendMessage.isPending || !womanId) return;

    console.log('Sending message to chatId:', chatId, 'womanId:', womanId);

    try {
      // Sende Nachricht über die send-message Edge Function
      await sendMessage.mutateAsync({
        chatId,
        content: newMessage,
        womanId,
      });
      
      setNewMessage('');
      
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const shouldShowDateHeader = (currentMessage: any, previousMessage: any) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.created_at).toDateString();
    const previousDate = new Date(previousMessage.created_at).toDateString();
    
    return currentDate !== previousDate;
  };

  const formatDateHeader = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Heute';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Gestern';
    } else {
      return date.toLocaleDateString('de-DE', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
    }
  };

  if (!chatId || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <p>Kein Chat ausgewählt</p>
        </div>
      </div>
    );
  }

  if (womanLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Chat Header - Fixed/Sticky */}
      <div className="fixed top-0 left-0 right-0 z-40 glass-card border-b border-white/10 px-4 py-3 flex items-center justify-between bg-black/80 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setShowProfileModal(true)}
          >
            <div className="relative">
              <img
                src={imageUrl}
                alt={womanData.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-purple-400/50"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = fallbackImageUrl;
                }}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-black"></div>
            </div>
            
            <div>
              <h3 className="font-semibold text-white text-sm">{womanData.name}</h3>
              <p className="text-xs text-green-400">Online</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-white/70" />
          </button>
        </div>
      </div>

      {/* Messages Container - with top padding to account for fixed header */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pt-20 pb-20">
        {messagesLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {messages?.map((message, index) => {
              const previousMessage = index > 0 ? messages[index - 1] : null;
              const showDate = shouldShowDateHeader(message, previousMessage);
              
              return (
                <React.Fragment key={message.id}>
                  {/* Date Header */}
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="bg-black/50 px-3 py-1 rounded-full text-xs text-white/60">
                        {formatDateHeader(message.created_at)}
                      </span>
                    </div>
                  )}
                  
                  {/* Message */}
                  <div className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex items-end space-x-2 max-w-[80%]">
                      {message.sender_type === 'ai' && (
                        <img
                          src={imageUrl}
                          alt={womanData.name}
                          className="w-6 h-6 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = fallbackImageUrl;
                          }}
                        />
                      )}
                      
                      <div
                        className={`px-4 py-2 rounded-2xl max-w-full ${
                          message.sender_type === 'user'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md'
                            : 'bg-white/10 text-white rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_type === 'user' ? 'text-white/70' : 'text-white/50'
                        }`}>
                          {formatMessageTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            
            {/* Auto-scroll target */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 glass-card border-t border-white/10 p-4 bg-black/80 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Nachricht schreiben..."
              className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={sendMessage.isPending || !newMessage.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        woman={womanData}
      />
    </div>
  );
};

export default ChatView;
