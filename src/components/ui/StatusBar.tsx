import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface StatusBarProps {
  isLoading?: boolean;
  isRecording?: boolean;
  isLiveMode?: boolean;
  isConnecting?: boolean;
  loadingMessage?: string;
  className?: string;
}

const StatusBar: React.FC<StatusBarProps> = ({
  isLoading = false,
  isRecording = false,
  isLiveMode = false,
  isConnecting = false,
  loadingMessage = '',
  className = ''
}) => {
  if (!isLoading && !isRecording && !isLiveMode && !isConnecting) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center py-2 px-4 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-200 ${className}`}>
      <div className="flex items-center space-x-3">
        {isLoading && (
          <>
            <LoadingSpinner size="sm" color="blue" />
            <span className="text-sm text-blue-700 font-medium">
              {loadingMessage || 'Processing...'}
            </span>
          </>
        )}
        
        {isRecording && (
          <>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <span className="text-sm text-red-700 font-medium">Recording...</span>
          </>
        )}
        
        {isLiveMode && (
          <>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            </div>
            <span className="text-sm text-green-700 font-medium">Live Mode Active</span>
          </>
        )}
        
        {isConnecting && (
          <>
            <LoadingSpinner size="sm" color="blue" />
            <span className="text-sm text-blue-700 font-medium">Connecting...</span>
          </>
        )}
      </div>
    </div>
  );
};

export default StatusBar;
