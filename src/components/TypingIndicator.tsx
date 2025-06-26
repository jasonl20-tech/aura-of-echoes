
import React from 'react';

interface TypingIndicatorProps {
  womanName?: string;
  womanImageUrl?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  womanName = 'AI', 
  womanImageUrl 
}) => {
  const fallbackImageUrl = 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=300&h=300&fit=crop&faces=1&auto=format';

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-end space-x-2 max-w-[80%]">
        <img
          src={womanImageUrl || fallbackImageUrl}
          alt={womanName}
          className="w-6 h-6 rounded-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = fallbackImageUrl;
          }}
        />
        
        <div className="bg-white/10 text-white rounded-2xl rounded-bl-md px-4 py-3">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-white/70 mr-2">{womanName} schreibt</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
