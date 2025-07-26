import React from 'react';

interface TypingIndicatorProps {
  className?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="text-sm text-gray-500 ml-2 animate-pulse">AI is thinking...</span>
    </div>
  );
};

export default TypingIndicator;
