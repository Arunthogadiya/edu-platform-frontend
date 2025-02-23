import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Send, Mic, StopCircle, Minimize2, Maximize2, GraduationCap, Calendar, AlertCircle, HelpCircle, ExternalLink, Upload, X } from 'lucide-react';
import { chatbotService } from '../../../services/chatbotService';
import { notificationService } from '../../../services/notificationService';  // Add this import
import { useLocation } from 'react-router-dom';
import SmartReminderManager from '../../../services/SmartReminderManager';
import './EduPal.css';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  resources?: string[];
  attachments?: UploadedDocument[];
}

interface QuickAccessItem {
  route: string;
  questions: string[];
  hint: string;
}

interface UploadedDocument {
  id: string;
  name: number;
  size: number;
  type: string;
}

const QUICK_ACCESS: Record<string, QuickAccessItem> = {
  'academics': {
    route: '/parent/dashboard/academics',
    questions: [
      "How's my child performing this week?",
      "Any upcoming tests?",
      "Show recent homework scores",
      "Which subject needs attention?"
    ],
    hint: "📚 Check your child's academic progress"
  },
  'attendance': {
    route: '/parent/dashboard/attendance',
    questions: [
      "Show this month's attendance",
      "Any late arrivals this week?",
      "Next holiday or break?",
      "Total absences this term?"
    ],
    hint: "📅 Track attendance and schedules"
  },
  'messages': {
    route: '/parent/dashboard/messages',
    questions: [
      "Any new teacher messages?",
      "Recent parent notifications",
      "Show unread messages",
      "Last teacher feedback"
    ],
    hint: "💬 Stay connected with teachers"
  }
};

const QuickActions = [
  { 
    icon: GraduationCap, 
    text: "How is my child performing in Math?",
    color: "text-purple-600",
    bg: "bg-purple-50" 
  },
  { 
    icon: Calendar, 
    text: "Show this week's attendance",
    color: "text-green-600",
    bg: "bg-green-50"
  },
  { 
    icon: AlertCircle, 
    text: "Any upcoming tests?",
    color: "text-orange-600",
    bg: "bg-orange-50"
  },
  { 
    icon: HelpCircle, 
    text: "Need homework help",
    color: "text-blue-600",
    bg: "bg-blue-50"
  }
];

const getContextualSuggestions = (pathname: string) => {
  if (pathname.includes('academics')) {
    return [
      "How is my child's overall academic progress?",
      "What was the last test score?",
      "Show homework completion rate",
      "Which subject needs improvement?"
    ];
  } else if (pathname.includes('attendance')) {
    return [
      "Show attendance percentage this month",
      "Was my child late this week?",
      "Any missed classes recently?",
      "Show attendance trend"
    ];
  } else if (pathname.includes('messages')) {
    return [
      "Any new messages from teachers?",
      "Show unread messages",
      "Last parent-teacher meeting notes",
      "Upcoming meetings"
    ];
  }
  return [
    "Show today's overview",
    "Any important updates?",
    "What should I know today?",
    "Any upcoming events?"
  ];
};

const WELCOME_MESSAGE = {
  id: 'welcome',
  type: 'bot' as const,
  content: `👋 Welcome to EduPal! I'm your AI assistant for staying connected with your child's education.

Quick Tips:
• Press Alt + E to open/close chat
• Press Alt + V for voice input
• Click the 📌 icons for quick questions
• I'll show relevant hints as you navigate

How can I help you today?`,
  timestamp: new Date(),
  resources: []
};

const generateStaticSuggestions = (pathname: string) => {
  if (pathname.includes('academics')) {
    return {
      text: "Would you like to check recent academic performance?",
      type: 'smart' as const,
      icon: '📚'
    };
  } else if (pathname.includes('attendance')) {
    return {
      text: "Want to review this month's attendance?",
      type: 'smart' as const,
      icon: '📅'
    };
  }
  return {
    text: "How can I help you today?",
    type: 'smart' as const,
    icon: '💡'
  };
};

const EduPal: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [hasNewSuggestion, setHasNewSuggestion] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const userData = JSON.parse(localStorage.getItem('userData') || 'null');
  const location = useLocation();
  const [showContextSuggestions, setShowContextSuggestions] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(true);
  const [smartSuggestion, setSmartSuggestion] = useState<string | null>(null);
  const [floatingState, setFloatingState] = useState<string | null>(null);
  const [currentContext, setCurrentContext] = useState<QuickAccessItem | null>(null);
  const [shouldShowReminder, setShouldShowReminder] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<{
    text: string;
    type: 'smart' | 'context' | 'time';
    icon?: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const suggestionInterval = setInterval(() => {
      if (!isOpen) {
        setHasNewSuggestion(true);
      }
    }, 300000); // Every 5 minutes

    return () => clearInterval(suggestionInterval);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setShowContextSuggestions(true);
      const timer = setTimeout(() => setShowContextSuggestions(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Show welcome message on first load
    if (messages.length === 0) {
      setMessages([WELCOME_MESSAGE]);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      // Reset conversation when chat is closed
      chatbotService.resetConversation();
    }
  }, [isOpen]);

  const loadChatHistory = async () => {
    try {
      const history = await chatbotService.fetchChatHistory(userData?.id);
      const formattedHistory = history.map((msg, index) => ({
        id: `hist-${index}`,
        type: 'bot' as const,
        content: msg.response,
        timestamp: new Date(msg.timestamp),
        resources: msg.resources
      }));
      setMessages(formattedHistory);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatbotService.submitTextQuery(inputText, userData?.childId);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.response,
        timestamp: new Date(),
        resources: response.resources
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to get response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1];
          if (base64Audio) {
            setIsLoading(true);
            try {
              const response = await chatbotService.submitVoiceQuery(base64Audio, userData?.childId);
              const botMessage: Message = {
                id: Date.now().toString(),
                type: 'bot',
                content: response.response,
                timestamp: new Date(),
                resources: response.resources
              };
              setMessages(prev => [...prev, botMessage]);
            } catch (error) {
              console.error('Failed to process voice query:', error);
            } finally {
              setIsLoading(false);
            }
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleQuickAction = (text: string) => {
    setInputText(text);
    handleSubmit(new Event('submit') as any);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate file upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadProgress(i);
      }

      // Create a message with the document
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: `I've uploaded ${selectedFile.name}. Can you help me with this document?`,
        timestamp: new Date(),
        attachments: [{
          id: Date.now().toString(),
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type
        }]
      };

      setMessages(prev => [...prev, newMessage]);
      setSelectedFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const renderFileUploadUI = () => (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Upload document"
        disabled={isUploading}
      >
        <Upload className="h-5 w-5" />
      </button>
    </>
  );

  // Keyboard shortcut handler
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Alt/Option + E to toggle EduPal
    if (event.altKey && event.key.toLowerCase() === 'e') {
      setIsOpen(prev => !prev);
    }
    // Alt/Option + V to toggle voice input when open
    if (event.altKey && event.key.toLowerCase() === 'v' && isOpen) {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  }, [isOpen, isRecording]);

  // Add keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Show floating reminder about activity
  useEffect(() => {
    const currentPath = location.pathname;
    const reminders = {
      'academics': 'Ask me about recent test scores or homework!',
      'attendance': 'Want to know about attendance trends?',
      'messages': 'I can help summarize teacher communications!'
    };

    const pathKey = Object.keys(reminders).find(key => currentPath.includes(key));
    if (pathKey && !isOpen) {
      setFloatingState(reminders[pathKey as keyof typeof reminders]);
      const timer = setTimeout(() => setFloatingState(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  // Update context based on current route
  useEffect(() => {
    const route = location.pathname.split('/').pop() || '';
    const context = QUICK_ACCESS[route];
    if (context) {
      setCurrentContext(context);
      // Show a subtle notification if we have relevant questions
      if (!isOpen) {
        setHasNewSuggestion(true);
        setSmartSuggestion(`Quick questions about ${route}?`);
      }
    }
  }, [location.pathname]);

  // Check for smart reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      const reminders = SmartReminderManager.getContextualReminders(location.pathname);
      if (reminders.length > 0) {
        const reminder = reminders[0];
        setSmartSuggestion(reminder.message);
        setShouldShowReminder(true);
        setPulseAnimation(true);
        
        // Auto-show EduPal for high-priority updates
        if (!isOpen && reminder.priority === 'high') {
          setIsOpen(true);
        }
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 6000); // Check every minute
    return () => clearInterval(interval);
  }, [location.pathname, isOpen]);

  // Auto-minimize after a period of inactivity
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const timer = setTimeout(() => {
        const lastMessage = messages[messages.length - 1];
        const inactiveTime = Date.now() - new Date(lastMessage?.timestamp || 0).getTime();
        
        // Auto-minimize after 5 minutes of inactivity
        if (inactiveTime > 300000) {
          setIsMinimized(true);
        }
      }, 300000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, isMinimized, messages]);

  // Show periodic activity suggestions
  useEffect(() => {
    const suggestActivity = () => {
      const currentHour = new Date().getHours();
      if (currentHour >= 8 && currentHour <= 20) { // Only during school/homework hours
        const suggestions = {
          morning: "👋 Good morning! Let's check today's schedule?",
          afternoon: "📚 Time to check homework updates?",
          evening: "📝 Review today's academic progress?"
        };
        
        const timeOfDay = 
          currentHour < 12 ? 'morning' :
          currentHour < 17 ? 'afternoon' : 'evening';
        
        if (!isOpen) {
          setSmartSuggestion(suggestions[timeOfDay]);
          setHasNewSuggestion(true);
          setPulseAnimation(true);
        }
      }
    };

    const interval = setInterval(suggestActivity, 7200000); // Every 2 hours
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    const generateTimeSensitiveSuggestion = () => {
      const hour = new Date().getHours();
      if (hour >= 8 && hour <= 20) {
        const suggestions = {
          morning: { text: "👋 Let's check today's schedule?", type: 'time' as const },
          afternoon: { text: "📚 Time to review homework updates!", type: 'time' as const },
          evening: { text: "📝 Let's check today's progress?", type: 'time' as const }
        };
        
        const timeOfDay = 
          hour < 12 ? 'morning' :
          hour < 17 ? 'afternoon' : 'evening';
        
        return suggestions[timeOfDay];
      }
      return null;
    };

    const checkSmartSuggestions = async () => {
      try {
        // First check for important updates
        const updates = await notificationService.getImportantUpdates(userData?.childId);
        if (updates.length > 0) {
          const latestUpdate = updates[0];
          setActiveSuggestion({
            text: `New ${latestUpdate.type} update: ${notificationService.generateNotificationMessage(latestUpdate)}`,
            type: 'smart',
            icon: latestUpdate.type === 'grade' ? '📊' :
                  latestUpdate.type === 'attendance' ? '📅' :
                  latestUpdate.type === 'homework' ? '📚' : '📣'
          });
          setPulseAnimation(true);
          return;
        }

        // Then check for contextual suggestions
        const contextSuggestions = SmartReminderManager.getContextualReminders(location.pathname);
        if (contextSuggestions.length > 0) {
          setActiveSuggestion({
            text: contextSuggestions[0].message,
            type: 'context'
          });
          return;
        }

        // Finally, check for time-based suggestions
        const timeSuggestion = generateTimeSensitiveSuggestion();
        if (timeSuggestion) {
          setActiveSuggestion(timeSuggestion);
        }
      } catch (error) {
        console.error('Error checking suggestions:', error);
      }
    };

    // Initial check
    checkSmartSuggestions();

    // Set up intervals for checking different types of suggestions
    const smartInterval = setInterval(checkSmartSuggestions, 6000); // Every minute
    
    return () => {
      clearInterval(smartInterval);
    };
  }, [location.pathname, userData?.childId]);

  useEffect(() => {
    if (!isOpen) {
      const suggestion = generateStaticSuggestions(location.pathname);
      setActiveSuggestion(suggestion);
      setPulseAnimation(true);
      setTimeout(() => setPulseAnimation(false), 5000);
    }
  }, [location.pathname, isOpen]);

  const renderSuggestionBubble = () => {
    if (!activeSuggestion || isOpen) return null;

    return (
      <div 
        onClick={() => {
          setIsOpen(true);
          if (activeSuggestion.text) {
            setInputText(activeSuggestion.text);
            handleSubmit(new Event('submit') as any);
          }
        }}
        className="preview-bubble notification-preview shine-effect cursor-pointer group
          hover:shadow-lg transition-all duration-300 max-w-xs"
      >
        <div className="flex items-start space-x-3">
          {activeSuggestion.icon && (
            <span className="text-xl">{activeSuggestion.icon}</span>
          )}
          <div>
            <p className="text-sm font-medium text-white">
              {activeSuggestion.text}
            </p>
            <p className="text-xs text-blue-100 mt-1 group-hover:underline">
              Click to learn more →
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end space-y-2">
      {/* Context Indicator */}
      {currentContext && !isOpen && (
        <div className="preview-bubble notification-preview shine-effect">
          <p className="text-sm font-medium">{currentContext.hint}</p>
        </div>
      )}

      {/* Quick Access Questions when minimized */}
      {currentContext && !isOpen && hasNewSuggestion && (
        <div className="bg-white rounded-lg shadow-lg p-3 max-w-xs notification-preview">
          <div className="text-sm font-medium text-gray-900 mb-2">Quick Questions:</div>
          <div className="space-y-1">
            {currentContext.questions.slice(0, 2).map((question, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsOpen(true);
                  setInputText(question);
                  handleSubmit(new Event('submit') as any);
                }}
                className="w-full text-left text-sm p-2 rounded hover:bg-blue-50 
                  text-gray-600 hover:text-blue-700 transition-colors edupal-suggestion"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main EduPal button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setHasNewSuggestion(false);
            setPulseAnimation(false);
          }}
          className="edupal-button group relative flex items-center space-x-2 px-4 py-3 rounded-full
            bg-gradient-to-r from-blue-600 to-blue-700 text-white
            hover:shadow-lg hover:shadow-blue-200 transition-all duration-300
            shine-effect"
          aria-label="Open EduPal Chat"
        >
          <div className="relative">
            <Bot className="h-6 w-6" />
            {hasNewSuggestion && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping" />
            )}
          </div>
          <span className="font-medium">Ask EduPal</span>
        </button>
      )}

      {/* Keyboard Shortcut Tooltip */}
      {!isOpen && (
        <div className="text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
          Press Alt + E to open
        </div>
      )}

      {/* Floating State Reminder */}
      {floatingState && !isOpen && (
        <div className="bg-white/90 backdrop-blur-sm text-sm text-gray-700 px-4 py-2 rounded-lg shadow-sm animate-fade-in-down">
          💡 {floatingState}
        </div>
      )}

      {/* Smart Suggestion Bubble */}
      {renderSuggestionBubble()}

      {/* Contextual Suggestions Tooltip */}
      {showContextSuggestions && isOpen && !isMinimized && (
        <div className="bg-white rounded-lg shadow-lg p-3 mb-2 w-[26rem] transform animate-fade-in-down">
          <div className="text-sm font-medium text-gray-700 mb-2">Quick Questions for This Section:</div>
          <div className="grid grid-cols-2 gap-2">
            {getContextualSuggestions(location.pathname).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(suggestion)}
                className="text-left text-sm p-2 rounded hover:bg-blue-50 text-gray-600 hover:text-blue-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick float button when minimized */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setHasNewSuggestion(false);
            setPulseAnimation(false);
          }}
          className="edupal-button group relative flex items-center space-x-2 px-4 py-3 rounded-full
            bg-gradient-to-r from-blue-600 to-blue-700 text-white
            hover:shadow-lg hover:shadow-blue-200 transition-all duration-300"
          aria-label="Open EduPal Chat"
        >
          <div className="relative">
            <Bot className="h-6 w-6" />
            {hasNewSuggestion && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping" />
            )}
          </div>
          <span className="font-medium">Ask EduPal</span>
        </button>
      )}

      {/* Main chat window */}
      {isOpen && (
        <div className={`edupal-chat-window bg-gradient-to-br from-blue-50 to-purple-50 
          rounded-xl shadow-lg flex flex-col transition-all duration-300 ease-in-out overflow-hidden
          ${isMinimized ? 'h-19 w-75' : 'h-[45rem] w-[35rem]'}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center">
              <Bot className="h-6 w-6" />
              <div className="ml-2">
                <h2 className="font-semibold">EduPal</h2>
                {!isMinimized && (
                  <p className="text-xs text-blue-100">Your Education Assistant</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={16} />}
            </button>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 messages-container">
                {messages.length === 0 && !isLoading && (
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <Bot className="h-16 w-16 text-blue-600/30 mx-auto" />
                      <h3 className="text-lg font-semibold text-gray-700">Welcome to EduPal!</h3>
                      <p className="text-sm text-gray-500">
                        I'm here to help you stay updated with your child's education journey.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quick Actions</p>
                      <div className="grid grid-cols-2 gap-2">
                        {QuickActions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuickAction(action.text)}
                            className={`flex items-center p-3 rounded-lg ${action.bg} 
                              hover:shadow-md transition-all duration-200 group text-left`}
                          >
                            <action.icon className={`h-5 w-5 ${action.color} mr-2 
                              group-hover:scale-110 transition-transform duration-200`} />
                            <span className="text-sm text-gray-700">{action.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="text-center text-xs text-gray-500">
                      You can also use voice commands by clicking the microphone icon below
                    </div>
                  </div>
                )}

                {/* Existing messages */}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-2.5 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white ml-4'
                          : 'bg-white text-gray-800 mr-4'
                      }`}
                    >
                      <div className="text-sm prose-sm dark:prose-invert">
                        <ReactMarkdown
                          components={{
                            p: ({children}) => <p className="m-0">{children}</p>,
                            ul: ({children}) => <ul className="m-0 pl-4">{children}</ul>,
                            li: ({children}) => <li className="m-0">{children}</li>,
                            a: ({children, href}) => (
                              <a 
                                href={href} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`${
                                  message.type === 'user' 
                                    ? 'text-blue-100 hover:text-blue-200' 
                                    : 'text-blue-600 hover:text-blue-700'
                                } underline`}
                              >
                                {children}
                              </a>
                            ),
                            code: ({children}) => (
                              <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-sm">
                                {children}
                              </code>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      {/* Rest of the message component (resources, etc.) */}
                      {message.resources && message.resources.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.resources.map((resource, index) => (
                            <a
                              key={index}
                              href={resource}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center text-xs ${
                                message.type === 'user' ? 'text-blue-100' : 'text-blue-600'
                              } hover:underline`}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Resource {index + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Existing loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-lg p-2 flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-100" />
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSubmit} className="p-3 bg-white/50 backdrop-blur-sm border-t">
                {/* File upload progress */}
                {isUploading && (
                  <div className="mb-2">
                    <div className="h-1 w-full bg-gray-200 rounded">
                      <div 
                        className="h-1 bg-blue-600 rounded transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Uploading document... {uploadProgress}%</p>
                  </div>
                )}
                
                {/* Selected file indicator */}
                {selectedFile && !isUploading && (
                  <div className="mb-2 flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Upload className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-blue-700 truncate max-w-[200px]">
                        {selectedFile.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-blue-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="text-blue-700 hover:text-blue-900 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Input controls */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-2 rounded-full transition-colors ${
                      isRecording
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    } hover:shadow-md`}
                    title={isRecording ? "Stop recording" : "Start voice command"}
                    disabled={isUploading}
                  >
                    {isRecording ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>
                  {renderFileUploadUI()}
                  <div className="flex-1 flex items-center space-x-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Ask about grades, attendance, or homework..."
                      className="flex-1 p-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading || isRecording || isUploading}
                    />
                    <button
                      type={selectedFile ? "button" : "submit"}
                      onClick={selectedFile ? handleFileUpload : undefined}
                      disabled={selectedFile ? false : (!inputText.trim() || isLoading || isUploading)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                        hover:shadow-md active:scale-95 flex-shrink-0"
                    >
                      {selectedFile ? <Upload className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EduPal;