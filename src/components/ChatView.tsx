import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Send, ArrowLeft, MoreVertical, Play, Pause } from 'lucide-react';
import { useMessages, useSendMessage } from '../hooks/useChats';
import { useAuth } from '../hooks/useAuth';
import { useWoman } from '../hooks/useWomen';
import { useNotifications } from '../hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import ProfileModal from './ProfileModal';
import AudioRecorder from './AudioRecorder';
import TypingIndicator from './TypingIndicator';

interface ChatViewProps {
  chatId?: string;
  womanId?: string;
  womanName?: string;
  onBack?: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ chatId, womanId, womanName, onBack }) => {
  const { user } = useAuth();
  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = useMessages(chatId || '');
  const { data: woman, isLoading: womanLoading } = useWoman(womanId || '');
  const { showNotification } = useNotifications();
  const sendMessage = useSendMessage();
  const [newMessage, setNewMessage] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<{ play: () => Promise<void> } | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageCountRef = useRef<number>(0);
  const hasScrolledToBottomOnEntry = useRef<boolean>(false);

  // Memoized woman data to prevent constant re-renders
  const womanData = useMemo(() => {
    return woman || {
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
  }, [woman, womanId, womanName]);

  // Memoized image URL to prevent flickering - with debug logging
  const imageUrl = useMemo(() => {
    const fallbackImageUrl = 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=300&h=300&fit=crop&faces=1&auto=format';
    
    // Check if image_url exists and is not empty/whitespace
    const hasValidImageUrl = womanData.image_url && womanData.image_url.trim().length > 0;
    
    console.log('🖼️ Image URL calculation:', {
      womanName: womanData.name,
      original_image_url: womanData.image_url,
      hasValidImageUrl,
      finalUrl: hasValidImageUrl ? womanData.image_url : fallbackImageUrl
    });
    
    return hasValidImageUrl ? womanData.image_url : fallbackImageUrl;
  }, [womanData.image_url, womanData.name]);

  // Memoized image error handler
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    console.log('🚨 Image error occurred, switching to fallback');
    target.src = 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=300&h=300&fit=crop&faces=1&auto=format';
  }, []);

  // Memoized scroll function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Auto-scroll to bottom when entering chat for the first time
  useEffect(() => {
    if (chatId && messages && messages.length > 0 && !hasScrolledToBottomOnEntry.current) {
      console.log('🎯 Auto-scrolling to bottom on chat entry');
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        hasScrolledToBottomOnEntry.current = true;
      }, 100);
    }
  }, [chatId, messages]);

  // Reset scroll flag when chat changes
  useEffect(() => {
    hasScrolledToBottomOnEntry.current = false;
  }, [chatId]);

  // Initialize audio for notifications
  useEffect(() => {
    const createNotificationSound = async (): Promise<void> => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (error) {
        console.log('Could not create notification sound:', error);
      }
    };

    audioRef.current = { play: createNotificationSound };
  }, []);

  // Enhanced audio message component with real audio playback
  const AudioMessage = useCallback(({ message }: { message: any }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    
    console.log('AudioMessage component:', { 
      messageId: message.id, 
      audioUrl: message.audio_url,
      hasAudioUrl: !!message.audio_url 
    });

    useEffect(() => {
      if (audioElementRef.current && message.audio_url) {
        const audio = audioElementRef.current;
        
        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => {
          setDuration(audio.duration || 0);
          setIsLoading(false);
        };
        const handleEnded = () => setIsPlaying(false);
        const handleLoadStart = () => setIsLoading(true);
        const handleError = (e: any) => {
          console.error('Audio load error:', e);
          setError('Audio konnte nicht geladen werden');
          setIsLoading(false);
        };
        
        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('error', handleError);
        
        return () => {
          audio.removeEventListener('timeupdate', updateTime);
          audio.removeEventListener('loadedmetadata', updateDuration);
          audio.removeEventListener('ended', handleEnded);
          audio.removeEventListener('loadstart', handleLoadStart);
          audio.removeEventListener('error', handleError);
        };
      }
    }, [message.audio_url]);
    
    const handlePlayPause = async () => {
      if (!audioElementRef.current || !message.audio_url) return;
      
      try {
        if (isPlaying) {
          audioElementRef.current.pause();
          setIsPlaying(false);
        } else {
          await audioElementRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Error playing audio:', error);
        setError('Wiedergabe fehlgeschlagen');
      }
    };

    const formatTime = (time: number) => {
      if (!isFinite(time)) return '0:00';
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // If no audio URL, show fallback
    if (!message.audio_url) {
      return (
        <div className="flex items-center space-x-3 bg-purple-600/20 rounded-lg p-3 max-w-xs">
          <div className="p-2 bg-red-500/20 rounded-full">
            <Play className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-white/70">Audio nicht verfügbar</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-3 bg-purple-600/20 rounded-lg p-3 max-w-xs">
        <audio
          ref={audioElementRef}
          src={message.audio_url}
          preload="metadata"
        />
        
        <button
          onClick={handlePlayPause}
          disabled={isLoading || !!error}
          className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white" />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          {error ? (
            <p className="text-xs text-red-400">{error}</p>
          ) : (
            <>
              <div className="flex items-center space-x-1 mb-1">
                <div className="flex space-x-1">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 bg-purple-400 rounded-full transition-all duration-150 ${
                        isPlaying ? 'animate-pulse' : ''
                      }`}
                      style={{ 
                        height: `${Math.random() * 16 + 8}px`,
                        opacity: duration > 0 && currentTime > (duration / 12) * i ? 0.8 : 0.3
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center text-xs text-white/70">
                <span>Audio</span>
                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }, []);

  // Enhanced real-time message subscription with typing indicators and notifications
  useEffect(() => {
    if (!chatId) return;

    console.log('🔄 Setting up enhanced real-time subscription for chat:', chatId);
    setIsRealtimeConnected(false);

    const handleRealtimeMessage = (payload: any) => {
      console.log('🚀 Real-time message received:', payload);
      
      if (payload.new.sender_type === 'ai') {
        console.log('🔊 Playing notification sound for AI message');
        audioRef.current?.play().catch(error => {
          console.log('❌ Could not play notification sound:', error);
        });
        
        // Show push notification for AI messages
        showNotification(
          `Neue Nachricht von ${womanData.name}`,
          {
            body: payload.new.message_type === 'audio' ? '🎤 Audio-Nachricht' : payload.new.content,
            tag: `chat-${chatId}`,
            requireInteraction: false,
          }
        );
        
        // Stop typing indicator when AI message arrives
        setIsTyping(false);
      }
      
      console.log('🔄 Refetching messages due to real-time update');
      refetchMessages();
    };

    const messageChannel = supabase
      .channel(`messages-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        handleRealtimeMessage
      )
      .subscribe((status) => {
        console.log('📡 Real-time message subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setIsRealtimeConnected(true);
          console.log('✅ Real-time connection established successfully');
        } else if (status === 'CHANNEL_ERROR') {
          setIsRealtimeConnected(false);
          console.log('❌ Real-time connection error');
        } else if (status === 'TIMED_OUT') {
          setIsRealtimeConnected(false);
          console.log('⏰ Real-time connection timed out');
        }
      });

    // Typing indicator channel
    const typingChannel = supabase
      .channel(`typing-${chatId}`)
      .on('broadcast', { event: 'typing_start' }, (payload) => {
        console.log('⌨️ Typing started:', payload);
        setIsTyping(true);
      })
      .on('broadcast', { event: 'typing_stop' }, (payload) => {
        console.log('⌨️ Typing stopped:', payload);
        setIsTyping(false);
      })
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up real-time subscriptions for chat:', chatId);
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(typingChannel);
      setIsRealtimeConnected(false);
      setIsTyping(false);
    };
  }, [chatId, refetchMessages, showNotification, womanData.name]);

  // Fallback polling mechanism with fixed dependencies
  useEffect(() => {
    if (!chatId || isRealtimeConnected) return;

    console.log('🔄 Starting fallback polling mechanism');
    
    lastMessageCountRef.current = messages?.length || 0;
    
    pollingIntervalRef.current = setInterval(async () => {
      console.log('🔍 Polling for new messages (fallback)');
      
      try {
        await refetchMessages();
      } catch (error) {
        console.log('❌ Error during polling:', error);
      }
    }, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        console.log('🧹 Cleaning up polling interval');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [chatId, isRealtimeConnected, refetchMessages]);

  // Check for new messages and play sound when messages change
  useEffect(() => {
    if (!messages) return;
    
    const currentMessageCount = messages.length;
    if (currentMessageCount > lastMessageCountRef.current) {
      console.log('📨 New messages detected');
      
      const latestMessage = messages[messages.length - 1];
      if (latestMessage && latestMessage.sender_type === 'ai') {
        console.log('🔊 Playing notification sound for new AI message');
        audioRef.current?.play().catch(error => {
          console.log('❌ Could not play notification sound:', error);
        });
      }
    }
    
    lastMessageCountRef.current = currentMessageCount;
  }, [messages]);

  // Auto-scroll to new messages with stable dependency
  useEffect(() => {
    if (hasScrolledToBottomOnEntry.current) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(async () => {
    if (!chatId || !newMessage.trim() || sendMessage.isPending || !womanId) return;

    console.log('📤 Sending text message to chatId:', chatId, 'womanId:', womanId);

    try {
      await sendMessage.mutateAsync({
        chatId,
        content: newMessage,
        womanId,
      });
      
      setNewMessage('');
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    }
  }, [chatId, newMessage, sendMessage, womanId]);

  const handleSendAudio = useCallback(async (audioBlob: Blob) => {
    if (!chatId || sendMessage.isPending || !womanId) return;

    console.log('🎤 Sending audio message to chatId:', chatId, 'womanId:', womanId, 'audioBlob size:', audioBlob.size);

    try {
      await sendMessage.mutateAsync({
        chatId,
        womanId,
        audioBlob,
      });
      
    } catch (error) {
      console.error('❌ Failed to send audio message:', error);
    }
  }, [chatId, sendMessage, womanId]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const formatMessageTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  const shouldShowDateHeader = useCallback((currentMessage: any, previousMessage: any) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.created_at).toDateString();
    const previousDate = new Date(previousMessage.created_at).toDateString();
    
    return currentDate !== previousDate;
  }, []);

  const formatDateHeader = useCallback((timestamp: string) => {
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
  }, []);

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
                onError={handleImageError}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-black"></div>
            </div>
            
            <div>
              <h3 className="font-semibold text-white text-sm">{womanData.name}</h3>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-green-400">Online</p>
                <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-400' : 'bg-yellow-400'}`} 
                     title={isRealtimeConnected ? 'Real-time verbunden' : 'Fallback-Modus'}>
                </div>
              </div>
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
              const isAudioMessage = message.message_type === 'audio';
              
              return (
                <div key={message.id} className="message-container">
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
                          onError={handleImageError}
                        />
                      )}
                      
                      <div
                        className={`px-4 py-2 rounded-2xl max-w-full ${
                          message.sender_type === 'user'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md'
                            : 'bg-white/10 text-white rounded-bl-md'
                        }`}
                      >
                        {isAudioMessage ? (
                          <AudioMessage message={message} />
                        ) : (
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        )}
                        <p className={`text-xs mt-1 ${
                          message.sender_type === 'user' ? 'text-white/70' : 'text-white/50'
                        }`}>
                          {formatMessageTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Typing Indicator - only show API-controlled typing indicator */}
            {isTyping && (
              <TypingIndicator 
                womanName={womanData.name}
                womanImageUrl={womanData.image_url}
              />
            )}
            
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
              onKeyPress={handleKeyPress}
              placeholder="Nachricht schreiben..."
              className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <AudioRecorder 
            onSendAudio={handleSendAudio}
            disabled={sendMessage.isPending}
          />
          
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
