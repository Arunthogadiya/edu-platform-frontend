import React, { useState, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { dashboardService } from '../../../services/dashboardService';

interface VoiceQueryProps {
  onQueryResult: (result: any) => void;
}

const VoiceQuery: React.FC<VoiceQueryProps> = ({ onQueryResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback(async () => {
    try {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = async (event) => {
        const command = event.results[0][0].transcript;
        setIsProcessing(true);
        
        try {
          const userData = JSON.parse(localStorage.getItem('userData') || 'null');
          const result = await dashboardService.submitVoiceQuery(
            userData?.userId || 123,
            userData?.childId || 456,
            command
          );
          onQueryResult(result);
        } catch (err) {
          setError('Failed to process voice command');
          console.error('Voice query error:', err);
        } finally {
          setIsProcessing(false);
        }
      };

      recognition.start();
    } catch (err) {
      setError('Voice recognition not supported in this browser');
      console.error('Speech recognition error:', err);
    }
  }, [onQueryResult]);

  return (
    <div className="fixed bottom-6 right-6">
      <button
        onClick={startListening}
        disabled={isListening || isProcessing}
        className={`p-4 rounded-full shadow-lg transition-all duration-200 
          ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Voice Command"
      >
        {isProcessing ? (
          <Loader2 className="h-6 w-6 text-white animate-spin" />
        ) : isListening ? (
          <MicOff className="h-6 w-6 text-white" />
        ) : (
          <Mic className="h-6 w-6 text-white" />
        )}
      </button>
      {error && (
        <div className="absolute bottom-full mb-2 right-0 bg-red-100 text-red-800 
          px-3 py-1 rounded-lg text-sm whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceQuery;