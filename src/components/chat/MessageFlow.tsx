import React, { useEffect, useRef } from 'react';
import { TypingAnimation } from '../ui/TypingAnimation';
import './MessageFlow.css';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isNew?: boolean;
}

interface MessageFlowProps {
  messages: Message[];
  className?: string;
}

export const MessageFlow: React.FC<MessageFlowProps> = ({ messages, className = '' }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={`message-flow ${className}`}>
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={`message-container ${message.sender} ${message.isNew ? 'slide-up' : ''}`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="message-bubble">
            {message.sender === 'ai' && message.isNew ? (
              <TypingAnimation 
                text={message.content}
                speed={25}
              />
            ) : (
              <span>{message.content}</span>
            )}
          </div>
          <div className="message-timestamp">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
