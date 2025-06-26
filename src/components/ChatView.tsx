
import React, { useState } from 'react';
import { MessageCircle, Send, Smile } from 'lucide-react';

interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'ai',
      message: 'Hallo! Schön, dass du da bist. Wie geht es dir heute? 😊',
      timestamp: new Date(Date.now() - 300000)
    },
    {
      id: 2,
      sender: 'user',
      message: 'Hi Emma! Mir geht es gut, danke. Wie war dein Tag?',
      timestamp: new Date(Date.now() - 240000)
    },
    {
      id: 3,
      sender: 'ai',
      message: 'Mein Tag war wunderbar! Ich habe neue Rezepte ausprobiert und dabei an dich gedacht. Was machst du gerne zum Entspannen? 💕',
      timestamp: new Date(Date.now() - 180000)
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false); // Mock subscription state

  const handleSendMessage = () => {
    if (!isSubscribed) {
      alert('Abonnement erforderlich um Nachrichten zu senden. Upgrade auf Premium!');
      return;
    }
    
    if (newMessage.trim()) {
      const userMessage: ChatMessage = {
        id: messages.length + 1,
        sender: 'user',
        message: newMessage,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: messages.length + 2,
          sender: 'ai',
          message: 'Das klingt interessant! Erzähl mir mehr davon. Ich höre gerne zu 😊',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const suggestedMessages = [
    "Wie war dein Tag?",
    "Was sind deine Hobbies?",
    "Erzähl mir von dir",
    "Was machst du gerne?"
  ];

  if (!isSubscribed) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
        <div className="glass-card rounded-3xl p-8 max-w-sm">
          <MessageCircle className="w-16 h-16 text-pink-400 mx-auto mb-4 animate-glow" />
          <h2 className="text-xl font-bold text-white mb-3">
            Premium Chat freischalten
          </h2>
          <p className="text-white/70 mb-6">
            Starte bedeutungsvolle Gespräche mit deinen Lieblingsprofilen. 
            Unbegrenzte Nachrichten und exklusive Features.
          </p>
          <button
            onClick={() => setIsSubscribed(true)} // Mock subscription
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl transition-all duration-300"
          >
            Jetzt Premium werden
          </button>
          <p className="text-xs text-white/60 mt-3">
            Ab 9,99€/Monat • Jederzeit kündbar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[70vh]">
      {/* Chat Header */}
      <div className="glass-card rounded-2xl p-4 mb-4">
        <div className="flex items-center space-x-3">
          <img
            src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop"
            alt="Emma"
            className="w-12 h-12 rounded-full object-cover border-2 border-pink-400/50"
          />
          <div>
            <h3 className="font-semibold text-white">Emma</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-white/60">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-br-sm'
                  : 'glass-card text-white rounded-bl-sm'
              }`}
            >
              <p className="text-sm">{message.message}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-white/70' : 'text-white/50'
              }`}>
                {message.timestamp.toLocaleTimeString('de-DE', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}
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
            className="bg-gradient-to-r from-pink-500 to-purple-500 p-2 rounded-full hover:from-pink-600 hover:to-purple-600 transition-all duration-300"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
