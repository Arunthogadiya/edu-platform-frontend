import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
  X
} from 'lucide-react';

interface VoiceCommand {
  command: string;
  response: string;
  action?: () => void;
}

interface SmartNotification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const SmartAttendanceAssistant: React.FC<{
  onVoiceCommand: (command: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}> = ({ onVoiceCommand, isListening, setIsListening }) => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');

  const voiceCommands: VoiceCommand[] = [
    {
      command: 'start attendance',
      response: 'Starting AI attendance system for your class',
      action: () => onVoiceCommand('start_ai')
    },
    {
      command: 'mark all present',
      response: 'Marking all students as present',
      action: () => onVoiceCommand('mark_all_present')
    },
    {
      command: 'show insights',
      response: 'Displaying smart attendance analytics',
      action: () => onVoiceCommand('show_insights')
    },
    {
      command: 'save attendance',
      response: 'Saving attendance records',
      action: () => onVoiceCommand('save_attendance')
    }
  ];

  useEffect(() => {
    // Add initial smart notifications
    addNotification({
      type: 'info',
      title: 'AI Assistant Ready',
      message: 'Voice commands are active. Say "start attendance" to begin.',
      timestamp: new Date()
    });
  }, []);

  const addNotification = (notification: Omit<SmartNotification, 'id'>) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString()
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
    
    // Auto-remove after 5 seconds for non-critical notifications
    if (notification.type === 'info' || notification.type === 'success') {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setCurrentTranscript('');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setCurrentTranscript(transcript);
        
        if (event.results[0].isFinal) {
          processVoiceCommand(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        addNotification({
          type: 'error',
          title: 'Voice Recognition Error',
          message: 'Could not process voice command. Please try again.',
          timestamp: new Date()
        });
      };

      recognition.onend = () => {
        setIsListening(false);
        setCurrentTranscript('');
      };

      recognition.start();
    } else {
      addNotification({
        type: 'warning',
        title: 'Voice Commands Unavailable',
        message: 'Your browser does not support voice recognition.',
        timestamp: new Date()
      });
    }
  };

  const processVoiceCommand = (transcript: string) => {
    const matchedCommand = voiceCommands.find(cmd => 
      transcript.includes(cmd.command)
    );

    if (matchedCommand) {
      speak(matchedCommand.response);
      matchedCommand.action?.();
      
      addNotification({
        type: 'success',
        title: 'Command Executed',
        message: `"${matchedCommand.command}" - ${matchedCommand.response}`,
        timestamp: new Date()
      });
    } else {
      speak('Sorry, I didn\'t understand that command.');
      addNotification({
        type: 'warning',
        title: 'Command Not Recognized',
        message: `"${transcript}" - Try commands like "start attendance" or "mark all present"`,
        timestamp: new Date()
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error': return <X className="w-5 h-5 text-red-600" />;
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Voice Control Panel */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Smart Assistant</h3>
              <p className="text-sm text-gray-600">Voice commands and notifications</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => speak('AI assistant is ready to help')}
              className={`p-3 rounded-xl transition-all ${
                isSpeaking 
                  ? 'bg-blue-100 text-blue-700 scale-110' 
                  : 'bg-gray-100 text-gray-600 hover:bg-blue-50'
              }`}
            >
              {isSpeaking ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            
            <button
              onClick={isListening ? () => setIsListening(false) : startListening}
              className={`p-3 rounded-xl transition-all ${
                isListening 
                  ? 'bg-red-100 text-red-700 scale-110 animate-pulse' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Voice Status */}
        <div className={`p-3 rounded-lg border transition-all ${
          isListening 
            ? 'border-red-200 bg-red-50' 
            : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-2">
            <MessageSquare className={`w-4 h-4 ${isListening ? 'text-red-600' : 'text-gray-500'}`} />
            <span className={`text-sm font-medium ${isListening ? 'text-red-700' : 'text-gray-600'}`}>
              {isListening 
                ? `Listening... ${currentTranscript || 'Say something'}` 
                : 'Click microphone to activate voice commands'
              }
            </span>
          </div>
        </div>

        {/* Available Commands */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Available Voice Commands:</h4>
          <div className="grid grid-cols-2 gap-2">
            {voiceCommands.map((cmd, index) => (
              <div key={index} className="text-xs bg-gray-100 rounded-lg px-3 py-2">
                <span className="font-medium text-gray-900">"{cmd.command}"</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Smart Notifications */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`border-2 rounded-xl p-4 transition-all hover:shadow-lg ${getNotificationColor(notification.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{notification.title}</h4>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="p-1 hover:bg-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                
                <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {notification.timestamp.toLocaleTimeString()}
                  </span>
                  
                  {notification.action && (
                    <button
                      onClick={notification.action.onClick}
                      className="text-xs bg-white px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
                    >
                      {notification.action.label}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {notifications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartAttendanceAssistant;
