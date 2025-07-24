import React, { useState, useRef } from 'react';
import { 
  Search, 
  Mic, 
  Upload, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Zap,
  Brain,
  MessageSquare,
  BarChart3,
  Users,
  Clock,
  X
} from 'lucide-react';

interface CommandSuggestion {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: 'analytics' | 'communication' | 'management' | 'insights';
  action: string;
}

interface AICommandBarProps {
  onCommandExecute: (command: string) => void;
  className?: string;
}

const AICommandBar: React.FC<AICommandBarProps> = ({ onCommandExecute, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Smart suggestions based on teacher workflow
  const suggestions: CommandSuggestion[] = [
    {
      id: '1',
      title: 'Generate attendance insights',
      description: 'Analyze attendance patterns and trends',
      icon: BarChart3,
      category: 'analytics',
      action: 'analyze attendance patterns for class 6A this month'
    },
    {
      id: '2',
      title: 'Draft parent communication',
      description: 'Create personalized messages for parents',
      icon: MessageSquare,
      category: 'communication',
      action: 'draft communication for parents about upcoming parent-teacher meeting'
    },
    {
      id: '3',
      title: 'Student performance summary',
      description: 'Get AI insights on student progress',
      icon: Users,
      category: 'insights',
      action: 'summarize student performance trends for this semester'
    },
    {
      id: '4',
      title: 'Behavior pattern analysis',
      description: 'Identify behavior trends and recommendations',
      icon: Brain,
      category: 'insights',
      action: 'analyze behavior patterns and suggest intervention strategies'
    },
    {
      id: '5',
      title: 'Schedule optimization',
      description: 'Optimize class schedules and activities',
      icon: Clock,
      category: 'management',
      action: 'suggest optimal schedule for upcoming assessments'
    },
    {
      id: '6',
      title: 'Engagement strategies',
      description: 'Get personalized teaching recommendations',
      icon: Sparkles,
      category: 'insights',
      action: 'suggest engagement strategies for low-performing students'
    }
  ];

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.title.toLowerCase().includes(query.toLowerCase()) ||
    suggestion.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      onCommandExecute(query);
      setQuery('');
      setShowSuggestions(false);
      setIsProcessing(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: CommandSuggestion) => {
    setQuery(suggestion.action);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice recognition implementation would go here
    // For now, just toggle the visual state
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const categoryColors = {
    analytics: 'from-primary-500 to-primary-700',
    communication: 'from-coral to-accent',
    management: 'from-mint to-success',
    insights: 'from-amber to-warning'
  };

  return (
    <div className={`ai-command-bar relative ${className}`}>
      {/* Compact Command Bar */}
      <div className={`transition-all duration-500 ease-in-out ${
        isExpanded ? 'mb-6' : ''
      }`}>
        <div className="stats-card p-4 border-2 border-transparent hover:border-primary-200 
          transition-all duration-300 cursor-pointer"
          onClick={() => !isExpanded && setIsExpanded(true)}>
          
          <div className="flex items-center gap-4">
            {/* AI Icon */}
            <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl 
              shadow-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>

            {/* Input Section */}
            <div className="flex-1">
              {!isExpanded ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-700">AI Teaching Assistant</h3>
                    <p className="text-xs text-neutral-500">Ask me anything about your class...</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="w-full">
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(e.target.value.length > 0);
                      }}
                      placeholder="Ask me about attendance, student performance, or get teaching insights..."
                      className="w-full pl-12 pr-24 py-3 border border-neutral-200 rounded-xl 
                               focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 
                               transition-all text-sm bg-white/80 backdrop-blur-sm"
                      autoFocus
                    />
                    
                    {/* Search Icon */}
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 
                      text-neutral-400 w-4 h-4" />
                    
                    {/* Action Buttons */}
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                      <button
                        type="button"
                        onClick={handleVoiceInput}
                        className={`p-2 rounded-lg transition-all hover:bg-neutral-100 ${
                          isListening ? 'bg-coral/10 text-coral' : 'text-neutral-400'
                        }`}
                        title="Voice input"
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleFileUpload}
                        className="p-2 rounded-lg transition-all hover:bg-neutral-100 text-neutral-400"
                        title="Upload file"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setIsExpanded(false)}
                        className="p-2 rounded-lg transition-all hover:bg-neutral-100 text-neutral-400"
                        title="Collapse"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <span className="text-xs text-neutral-500 ml-2">Processing...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Smart Suggestions Panel */}
      {isExpanded && showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2">
          <div className="stats-card p-4 shadow-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber" />
                Smart Suggestions
              </h4>
              <button
                onClick={() => setShowSuggestions(false)}
                className="p-1 hover:bg-neutral-100 rounded"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-left p-3 rounded-lg border border-neutral-200 
                           hover:border-primary-300 hover:bg-primary-50/50 
                           transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${categoryColors[suggestion.category]} 
                      shadow-sm group-hover:shadow-md transition-shadow`}>
                      <suggestion.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-semibold text-neutral-900 group-hover:text-primary-700">
                        {suggestion.title}
                      </h5>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                        {suggestion.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
        onChange={(e) => {
          // Handle file upload
          console.log('File uploaded:', e.target.files?.[0]);
        }}
      />

      {/* Voice Input Indicator */}
      {isListening && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="stats-card p-8 text-center max-w-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-coral to-accent rounded-full 
              flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Listening...</h3>
            <p className="text-sm text-neutral-600">Speak your question or command</p>
            <button
              onClick={() => setIsListening(false)}
              className="mt-4 px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors"
            >
              Stop Listening
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICommandBar;
