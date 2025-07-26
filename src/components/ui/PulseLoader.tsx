import React from 'react';

interface PulseLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'purple' | 'red' | 'green';
  className?: string;
}

const PulseLoader: React.FC<PulseLoaderProps> = ({ 
  size = 'md', 
  color = 'blue',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    green: 'bg-green-500'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className={`absolute inset-0 ${colorClasses[color]} rounded-full animate-ping opacity-75`}></div>
      <div className={`relative ${sizeClasses[size]} ${colorClasses[color]} rounded-full`}></div>
    </div>
  );
};

export default PulseLoader;
