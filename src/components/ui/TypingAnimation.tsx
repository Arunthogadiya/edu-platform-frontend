import React, { useState, useEffect } from 'react';
import './TypingAnimation.css';

interface TypingAnimationProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({
  text,
  speed = 30,
  onComplete,
  className = ''
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed + Math.random() * 20); // Add slight randomness for natural feel

      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
      onComplete?.();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <div className={`typing-animation ${className}`}>
      <span>{displayText}</span>
      {isTyping && <span className="typing-cursor">|</span>}
    </div>
  );
};
