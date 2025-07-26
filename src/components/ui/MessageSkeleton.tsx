import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface MessageSkeletonProps {
  isUser?: boolean;
  className?: string;
}

const MessageSkeleton: React.FC<MessageSkeletonProps> = ({ isUser = false, className = '' }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 ${className}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
        isUser 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
          : 'bg-white border border-gray-200 shadow-sm'
      }`}>
        <div className="flex items-center space-x-2">
          <LoadingSpinner size="sm" color={isUser ? 'gray' : 'blue'} />
          <div className="animate-pulse">
            <div className={`h-3 ${isUser ? 'bg-blue-300' : 'bg-gray-300'} rounded w-20 mb-1`}></div>
            <div className={`h-3 ${isUser ? 'bg-blue-300' : 'bg-gray-300'} rounded w-16`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageSkeleton;
