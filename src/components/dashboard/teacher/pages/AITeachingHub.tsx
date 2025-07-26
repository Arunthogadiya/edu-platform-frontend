import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Settings, 
  Volume2, 
  VolumeX, 
  Trash2, 
  X, 
  Sparkles, 
  User, 
  Copy, 
  Lightbulb, 
  BookOpen, 
  Users, 
  Calendar, 
  BarChart3, 
  MessageSquare, 
  Target, 
  Filter, 
  ThumbsUp, 
  ThumbsDown, 
  Loader2,
  Phone,
  PhoneOff,
  Waves,
  ExternalLink 
} from 'lucide-react';
import { authService } from '../../../../services/authService';
import { aiTeachingHubService } from '../../../../services/aiTeachingHubService';
import { 
  startAudioRecorderWorklet, 
  startAudioPlayerWorklet, 
  base64ToArray, 
  stopMicrophone,
  AudioRecorderWorkletNode,
  AudioPlayerWorkletNode
} from '../../../../utils/audioUtils';
import './AITeachingHub.css';

// UI Components
import StatusBar from '../../../ui/StatusBar';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  processing?: boolean;
  attachments?: {
    type: 'image' | 'file';
    name: string;
    url: string;
    size: number;
  }[];
}

interface VoiceSettings {
  enabled: boolean;
  autoPlay: boolean;
  speed: number;
  voice: string;
}

const AITeachingHub: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [sessionId, setSessionId] = useState<string>('');

  // Enhanced message content renderer with embedded URL support
  const renderMessageContent = (content: string, messageType: 'user' | 'ai') => {
    // Check if the entire message is just a URL
    const urlOnlyRegex = /^https?:\/\/[^\s]+$/;
    if (urlOnlyRegex.test(content.trim())) {
      const url = content.trim();
      
      // Check if it's an image URL
      const imageRegex = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|tif|avif)(\?.*)?$/i;
      if (imageRegex.test(url)) {
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <ImageIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-green-800 font-medium">Shared Image</span>
            </div>
            
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600 font-mono truncate max-w-xs">
                    {new URL(url).pathname.split('/').pop() || 'image'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Open
                  </button>
                </div>
              </div>
              <div className="relative">
                <img
                  src={url}
                  alt="Shared image"
                  className="w-full h-auto max-h-96 object-contain bg-gray-50"
                  onLoad={(e) => {
                    // Hide loading indicator
                    const loading = e.currentTarget.parentElement?.querySelector('.image-loading');
                    if (loading) {
                      (loading as HTMLElement).style.display = 'none';
                    }
                  }}
                  onError={(e) => {
                    console.error('Failed to load image:', e);
                    const target = e.target as HTMLImageElement;
                    if (target.parentElement) {
                      target.parentElement.innerHTML = `
                        <div class="p-8 text-center text-gray-500 bg-gray-50 rounded">
                          <div class="mb-4">
                            <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                          </div>
                          <p class="text-lg font-medium mb-2">Unable to load image</p>
                          <p class="text-sm text-gray-400 mb-4">The image could not be displayed.</p>
                          <a href="${url}" target="_blank" rel="noopener noreferrer" 
                             class="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                            </svg>
                            Open in new tab
                          </a>
                        </div>
                      `;
                    }
                  }}
                />
                {/* Loading indicator */}
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 image-loading">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Loading image...</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              Image from: <span className="font-mono">{new URL(url).hostname}</span>
            </div>
          </div>
        );
      }
      
      // Check if it's a YouTube video
      const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
      const youtubeMatch = url.match(youtubeRegex);
      
      if (youtubeMatch) {
        const videoId = youtubeMatch[1];
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <ExternalLink className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-800 font-medium">YouTube Video</span>
            </div>
            
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600 font-mono truncate max-w-xs">
                    youtube.com/watch?v={videoId}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Open
                </button>
              </div>
              <div className="relative w-full aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube video"
                />
              </div>
            </div>
          </div>
        );
      }
      
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <ExternalLink className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-sm text-blue-800 font-medium">Embedded Content</span>
          </div>
          
          {/* Embedded iframe for the URL */}
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
            <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-600 font-mono truncate max-w-xs">
                  {url}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const iframe = e.currentTarget.closest('.bg-white')?.querySelector('iframe');
                    if (iframe) {
                      iframe.src = iframe.src; // Reload iframe
                    }
                  }}
                  className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  title="Refresh"
                >
                  ↻
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Open
                </button>
              </div>
            </div>
            <div className="relative w-full" style={{ height: '400px' }}>
              <iframe
                src={url}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
                title="Embedded content"
                onLoad={(e) => {
                  const iframe = e.target as HTMLIFrameElement;
                  try {
                    // Try to get the title from the iframe document
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (iframeDoc?.title) {
                      const titleSpan = iframe.parentElement?.parentElement?.querySelector('.font-mono');
                      if (titleSpan) {
                        titleSpan.textContent = iframeDoc.title;
                      }
                    }
                  } catch (e) {
                    // Cross-origin restriction, ignore
                  }
                }}
                onError={(e) => {
                  console.error('Failed to load iframe:', e);
                  const target = e.target as HTMLIFrameElement;
                  if (target.parentElement) {
                    target.parentElement.innerHTML = `
                      <div class="p-8 text-center text-gray-500 bg-gray-50 rounded">
                        <div class="mb-4">
                          <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </div>
                        <p class="text-lg font-medium mb-2">Unable to embed this content</p>
                        <p class="text-sm text-gray-400 mb-4">This website doesn't allow embedding or requires special permissions.</p>
                        <a href="${url}" target="_blank" rel="noopener noreferrer" 
                           class="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                          </svg>
                          Open in new tab
                        </a>
                      </div>
                    `;
                  }
                }}
              />
              {/* Loading indicator */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 iframe-loading">
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading content...</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Content loaded from: <span className="font-mono">{new URL(url).hostname}</span>
          </div>
        </div>
      );
    }

    // For mixed content with URLs, detect and embed them inline
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    
    if (parts.length > 1) {
      return (
        <div className="space-y-4">
          {parts.map((part, index) => {
            if (urlRegex.test(part)) {
              // Check if it's an image URL
              const imageRegex = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|tif|avif)(\?.*)?$/i;
              if (imageRegex.test(part)) {
                return (
                  <div key={index} className="bg-white border border-green-300 rounded-lg overflow-hidden shadow-sm">
                    <div className="p-2 bg-green-50 border-b border-green-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">
                          {new URL(part).pathname.split('/').pop() || 'image'}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(part, '_blank', 'noopener,noreferrer');
                        }}
                        className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        Open
                      </button>
                    </div>
                    <div className="relative">
                      <img
                        src={part}
                        alt={`Shared image ${index}`}
                        className="w-full h-auto max-h-64 object-contain bg-gray-50"
                        onLoad={(e) => {
                          // Hide loading indicator
                          const loading = e.currentTarget.parentElement?.querySelector('.image-loading');
                          if (loading) {
                            (loading as HTMLElement).style.display = 'none';
                          }
                        }}
                        onError={(e) => {
                          console.error('Failed to load image:', e);
                          const target = e.target as HTMLImageElement;
                          if (target.parentElement) {
                            target.parentElement.innerHTML = `
                              <div class="p-4 text-center text-gray-500 bg-gray-50 rounded">
                                <p class="mb-2">Unable to load image</p>
                                <a href="${part}" target="_blank" rel="noopener noreferrer" 
                                   class="text-blue-600 hover:text-blue-800 underline">
                                  Open in new tab
                                </a>
                              </div>
                            `;
                          }
                        }}
                      />
                      {/* Loading indicator */}
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-50 image-loading">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-xs">Loading...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              
              // Check if it's a YouTube video
              const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
              const youtubeMatch = part.match(youtubeRegex);
              
              if (youtubeMatch) {
                const videoId = youtubeMatch[1];
                return (
                  <div key={index} className="bg-white border border-red-300 rounded-lg overflow-hidden shadow-sm">
                    <div className="p-2 bg-red-50 border-b border-red-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-red-600 font-medium">YouTube Video</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(part, '_blank', 'noopener,noreferrer');
                        }}
                        className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Open
                      </button>
                    </div>
                    <div className="relative w-full aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={`YouTube video ${index}`}
                      />
                    </div>
                  </div>
                );
              }
              
              return (
                <div key={index} className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                  <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-600 font-mono truncate max-w-xs">
                        {part}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const iframe = e.currentTarget.closest('.bg-white')?.querySelector('iframe');
                          if (iframe) {
                            iframe.src = iframe.src; // Reload iframe
                          }
                        }}
                        className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        title="Refresh"
                      >
                        ↻
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(part, '_blank', 'noopener,noreferrer');
                        }}
                        className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                  <div className="relative w-full" style={{ height: '300px' }}>
                    <iframe
                      src={part}
                      className="w-full h-full border-0"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
                      title={`Embedded content ${index}`}
                      onLoad={(e) => {
                        const iframe = e.target as HTMLIFrameElement;
                        // Hide loading indicator
                        const loading = iframe.parentElement?.querySelector('.iframe-loading');
                        if (loading) {
                          (loading as HTMLElement).style.display = 'none';
                        }
                      }}
                      onError={(e) => {
                        console.error('Failed to load iframe:', e);
                        const target = e.target as HTMLIFrameElement;
                        if (target.parentElement) {
                          target.parentElement.innerHTML = `
                            <div class="p-4 text-center text-gray-500 bg-gray-50 rounded">
                              <p class="mb-2">Unable to embed this content</p>
                              <a href="${part}" target="_blank" rel="noopener noreferrer" 
                                 class="text-blue-600 hover:text-blue-800 underline">
                                Open in new tab
                              </a>
                            </div>
                          `;
                        }
                      }}
                    />
                    {/* Loading indicator */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 iframe-loading">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs">Loading...</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            } else if (part.trim()) {
              return (
                <div key={index} className={`prose prose-sm max-w-none ${
                  messageType === 'user' ? 'prose-invert' : ''
                }`}>
                  <ReactMarkdown>{part}</ReactMarkdown>
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    }

    // Regular content without URLs
    return (
      <div className={`prose prose-sm max-w-none ${
        messageType === 'user' ? 'prose-invert' : ''
      }`}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  };

  // Voice and interaction states
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    enabled: true,
    autoPlay: false,
    speed: 1,
    voice: 'default'
  });

  // UI states
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // File upload and drag-drop states
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{
    file: File;
    base64: string;
    url: string;
    id: string;
  }[]>([]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Audio worklet refs
  const audioRecorderNodeRef = useRef<AudioRecorderWorkletNode | null>(null);
  const audioRecorderContextRef = useRef<AudioContext | null>(null);
  const audioPlayerNodeRef = useRef<AudioPlayerWorkletNode | null>(null);
  const audioPlayerContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const quickPrompts = [
    {
      category: 'lesson-planning',
      icon: Calendar,
      text: 'Help me create a lesson plan for Mathematics Grade 8',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      category: 'assessment',
      icon: BarChart3,
      text: 'Generate quiz questions for Science Chapter 5',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      category: 'engagement',
      icon: Users,
      text: 'Suggest interactive activities for English class',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      category: 'behavior',
      icon: Target,
      text: 'Help me address classroom behavior issues',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      category: 'communication',
      icon: MessageSquare,
      text: 'Draft a parent communication about student progress',
      color: 'text-pink-600',
      bg: 'bg-pink-50'
    },
    {
      category: 'resources',
      icon: BookOpen,
      text: 'Find educational resources for History topics',
      color: 'text-teal-600',
      bg: 'bg-teal-50'
    }
  ];

  const filteredPrompts = selectedCategory === 'all' 
    ? quickPrompts 
    : quickPrompts.filter(prompt => prompt.category === selectedCategory);

  const promptCategories = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'lesson-planning', label: 'Lesson Planning', icon: Calendar },
    { id: 'assessment', label: 'Assessment', icon: BarChart3 },
    { id: 'engagement', label: 'Engagement', icon: Users },
    { id: 'behavior', label: 'Behavior', icon: Target },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'resources', label: 'Resources', icon: BookOpen }
  ];

  // Initialize session ID based on current user
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user?.id) {
      setSessionId(user.id.toString());
    } else {
      // Fallback to a timestamp-based ID if no user ID
      setSessionId(Date.now().toString());
    }
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setShowQuickPrompts(prev => !prev);
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setShowSettings(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // WebSocket message handlers
  useEffect(() => {
    if (sessionId) {
      // Set up WebSocket message handlers
      aiTeachingHubService.onMessage('audio', (message) => {
        // Play audio if we have a player node
        if (audioPlayerNodeRef.current && message.data) {
          const audioData = base64ToArray(message.data);
          audioPlayerNodeRef.current.port.postMessage(audioData);
        }
      });

      aiTeachingHubService.onMessage('text', (message) => {
        if (message.data) {
          const role = message.role || 'model';
          
          // Get or create message ID for streaming
          let messageId = aiTeachingHubService.getCurrentMessageId();
          
          if (role === 'model' && messageId) {
            // Update existing message for streaming
            setMessages(prev => prev.map(msg => 
              msg.id === messageId 
                ? { ...msg, content: msg.content + message.data }
                : msg
            ));
          } else {
            // Create new message
            messageId = Date.now().toString() + '_ai';
            aiTeachingHubService.setCurrentMessageId(messageId);
            
            const aiResponse: Message = {
              id: messageId,
              type: role === 'user' ? 'user' : 'ai',
              content: message.data,
              timestamp: new Date(),
            };
            
            setMessages(prev => prev.filter(msg => !msg.processing).concat([aiResponse]));
          }
        }
      });

      aiTeachingHubService.onMessage('turn_complete', () => {
        // Reset message ID when turn is complete
        aiTeachingHubService.setCurrentMessageId(null);
        console.log('Turn completed');
      });

      aiTeachingHubService.onMessage('status', (message) => {
        console.log('WebSocket status:', message.message);
      });

      aiTeachingHubService.onMessage('error', (message) => {
        console.error('WebSocket error:', message.message);
        const errorMessage: Message = {
          id: Date.now().toString() + '_error',
          type: 'ai',
          content: `Error: ${message.message}`,
          timestamp: new Date(),
        };
        
        setMessages(prev => prev.filter(msg => !msg.processing).concat([errorMessage]));
      });
    }
  }, [sessionId, voiceSettings]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setShowQuickPrompts(prev => !prev);
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setShowSettings(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Start live voice conversation
  const startLiveConversation = async () => {
    try {
      setIsConnecting(true);
      
      // Connect to WebSocket
      await aiTeachingHubService.connectWebSocket(sessionId, true, false);
      
      // Start audio player
      const [playerNode, playerContext] = await startAudioPlayerWorklet();
      audioPlayerNodeRef.current = playerNode;
      audioPlayerContextRef.current = playerContext;
      
      // Start audio recorder
      const [recorderNode, recorderContext, micStream] = await startAudioRecorderWorklet(
        (pcmData: ArrayBuffer) => {
          if (aiTeachingHubService.isWebSocketConnected()) {
            aiTeachingHubService.sendAudioData(pcmData);
          }
        }
      );
      
      audioRecorderNodeRef.current = recorderNode;
      audioRecorderContextRef.current = recorderContext;
      micStreamRef.current = micStream;
      
      setIsLiveMode(true);
      setIsRecording(true);
      
      // Add initial message
      const startMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: '🎤 Live conversation started. Start speaking...',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, startMessage]);
      
    } catch (error) {
      console.error('Error starting live conversation:', error);
      alert('Unable to start live conversation. Please check permissions.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Stop live voice conversation
  const stopLiveConversation = () => {
    try {
      // Disconnect WebSocket
      aiTeachingHubService.disconnectWebSocket();
      
      // Stop audio recorder
      if (audioRecorderNodeRef.current) {
        audioRecorderNodeRef.current.disconnect();
        audioRecorderNodeRef.current = null;
      }
      
      if (audioRecorderContextRef.current) {
        audioRecorderContextRef.current.close();
        audioRecorderContextRef.current = null;
      }
      
      // Stop microphone
      if (micStreamRef.current) {
        stopMicrophone(micStreamRef.current);
        micStreamRef.current = null;
      }
      
      // Stop audio player
      if (audioPlayerNodeRef.current) {
        audioPlayerNodeRef.current.disconnect();
        audioPlayerNodeRef.current = null;
      }
      
      if (audioPlayerContextRef.current) {
        audioPlayerContextRef.current.close();
        audioPlayerContextRef.current = null;
      }
      
      setIsLiveMode(false);
      setIsRecording(false);
      
      const endMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: '🔇 Live conversation ended.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, endMessage]);
      
    } catch (error) {
      console.error('Error stopping live conversation:', error);
    }
  };

  const callTeachingAssistantAPI = async (message: string, imageData?: string, imageMimeType?: string) => {
    try {
      return await aiTeachingHubService.sendChatMessage(message, sessionId, imageData, imageMimeType);
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && uploadedImages.length === 0) || isLoading) return;

    const messageContent = inputText.trim() || 'Please analyze this image.';
    const hasImages = uploadedImages.length > 0;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageContent,
      timestamp: new Date(),
      attachments: hasImages ? uploadedImages.map(img => ({
        type: 'image' as const,
        name: img.file.name,
        url: img.url,
        size: img.file.size
      })) : undefined
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);
    setLoadingMessage('Processing your message...');
    setShowQuickPrompts(false);

    // Add single processing message
    const processingMessage: Message = {
      id: Date.now().toString() + '_processing',
      type: 'ai',
      content: hasImages ? 'Analyzing image and processing your request...' : 'Processing your request...',
      timestamp: new Date(),
      processing: true
    };

    setMessages(prev => [...prev, processingMessage]);

    try {
      let response;
      if (hasImages && uploadedImages.length > 0) {
        // For now, send the first image. You could modify the backend to handle multiple images
        const firstImage = uploadedImages[0];
        response = await callTeachingAssistantAPI(messageContent, firstImage.base64, firstImage.file.type);
      } else {
        response = await callTeachingAssistantAPI(messageContent);
      }

      const aiResponse: Message = {
        id: Date.now().toString() + '_ai',
        type: 'ai',
        content: response.text,
        timestamp: new Date(),
      };

      // Remove processing message and add actual response
      setMessages(prev => prev.filter(msg => !msg.processing).concat([aiResponse]));

      // Auto-play response if enabled
      if (voiceSettings.enabled && voiceSettings.autoPlay) {
        speakText(response.text);
      }

      // Clear uploaded images after successful send
      uploadedImages.forEach(img => URL.revokeObjectURL(img.url));
      setUploadedImages([]);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        type: 'ai',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages(prev => prev.filter(msg => !msg.processing).concat([errorMessage]));
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = async (promptText: string) => {
    setInputText(promptText);
    setShowQuickPrompts(false);
    
    // Auto-submit the prompt
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: promptText,
      timestamp: new Date(),
    };

    console.log('Quick prompt submitted:', newMessage);

    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const processingMessage: Message = {
        id: Date.now().toString() + '_processing',
        type: 'ai',
        content: 'Processing your request...',
        timestamp: new Date(),
        processing: true
      };

      setMessages(prev => [...prev, processingMessage]);

      const response = await callTeachingAssistantAPI(promptText);

      const aiResponse: Message = {
        id: Date.now().toString() + '_ai',
        type: 'ai',
        content: response.text,
        timestamp: new Date(),
      };

      setMessages(prev => prev.filter(msg => !msg.processing).concat([aiResponse]));

      if (voiceSettings.enabled && voiceSettings.autoPlay) {
        speakText(response.text);
      }

    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        type: 'ai',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages(prev => prev.filter(msg => !msg.processing).concat([errorMessage]));
    } finally {
      setIsLoading(false);
      setInputText('');
    }
  };

  // Start live conversation or stop recording based on current state
  const startRecording = async () => {
    if (isLiveMode) return; // Don't allow traditional recording in live mode
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream, { 
        mimeType: 'audio/pcm' 
      });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/pcm' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (isLiveMode) {
      stopLiveConversation();
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceInput = async (_audioBlob: Blob) => {
    try {
      setIsLoading(true);
      
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: '🎤 Voice message',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      const processingMessage: Message = {
        id: Date.now().toString() + '_processing',
        type: 'ai',
        content: 'Processing voice input...',
        timestamp: new Date(),
        processing: true
      };

      setMessages(prev => [...prev, processingMessage]);

      // For voice input, we'll send a placeholder message indicating voice input
      // The actual transcription would need to be handled by the backend
      const response = await callTeachingAssistantAPI('Voice input received');

      const aiResponse: Message = {
        id: Date.now().toString() + '_ai',
        type: 'ai',
        content: response.text,
        timestamp: new Date(),
      };

      setMessages(prev => prev.filter(msg => !msg.processing).concat([aiResponse]));

      if (voiceSettings.enabled && voiceSettings.autoPlay) {
        speakText(response.text);
      }

    } catch (error) {
      console.error('Error processing voice input:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        type: 'ai',
        content: 'Sorry, I couldn\'t process your voice input. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages(prev => prev.filter(msg => !msg.processing).concat([errorMessage]));
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceSettings.speed;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(processFile);
    }
    // Clear the input so the same file can be uploaded again
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(processFile);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here if needed
      console.log('Text copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const processFile = async (file: File) => {
    if (file.type.startsWith('image/')) {
      try {
        setUploading(true);
        
        // Convert image to base64
        const base64Image = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve(base64.split(',')[1]); // Remove data:image/...;base64, prefix
          };
          reader.readAsDataURL(file);
        });

        // Add to uploaded images instead of immediately sending
        const imageData = {
          file,
          base64: base64Image,
          url: URL.createObjectURL(file),
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        };

        setUploadedImages(prev => [...prev, imageData]);

      } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image. Please try again.');
      } finally {
        setUploading(false);
      }
    } else {
      alert('Please upload only image files (JPG, PNG, GIF, etc.)');
    }
  };

  const removeUploadedImage = (imageId: string) => {
    setUploadedImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  // Clean up uploaded images on unmount
  useEffect(() => {
    return () => {
      uploadedImages.forEach(img => URL.revokeObjectURL(img.url));
    };
  }, []);

  const clearChat = () => {
    setMessages([]);
    setShowQuickPrompts(true);
  };

  return (
    <div className="ai-teaching-hub h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="ai-hub-header p-6 border-b border-neutral-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">AI Teaching Hub</h1>
              <p className="text-neutral-600">Your intelligent teaching assistant</p>
            </div>
            
            {/* Live Mode Indicator */}
            {isLiveMode && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>Live</span>
                <Waves className="w-4 h-4" />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Live Conversation Toggle */}
            <button
              onClick={isLiveMode ? stopLiveConversation : startLiveConversation}
              disabled={isConnecting}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isLiveMode 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
              title={isLiveMode ? "End Live Conversation" : "Start Live Conversation"}
            >
              {isConnecting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLiveMode ? (
                <PhoneOff className="w-5 h-5" />
              ) : (
                <Phone className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => setShowQuickPrompts(!showQuickPrompts)}
              className={`p-3 rounded-xl transition-all duration-300 ${
                showQuickPrompts 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-white text-neutral-600 hover:bg-neutral-50'
              }`}
              title="Toggle Quick Prompts (Ctrl+K)"
            >
              <Lightbulb className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => isSpeaking ? stopSpeaking() : setVoiceSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`p-3 rounded-xl transition-all duration-300 ${
                voiceSettings.enabled 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-white text-neutral-600 hover:bg-neutral-50'
              }`}
              title={isSpeaking ? "Stop Speaking" : "Toggle Voice"}
            >
              {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            <button
              onClick={clearChat}
              className="p-3 bg-white text-neutral-600 hover:bg-neutral-50 rounded-xl transition-all duration-300"
              title="Clear Chat"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowSettings(true)}
              className="p-3 bg-white text-neutral-600 hover:bg-neutral-50 rounded-xl transition-all duration-300"
              title="Settings (Ctrl+Shift+S)"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      {showQuickPrompts && (
        <div className="ai-hub-prompts p-6 border-b border-neutral-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-800">Quick Prompts</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-neutral-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-sm border border-neutral-200 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              >
                {promptCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleQuickPrompt(prompt.text)}
                className={`${prompt.bg} ${prompt.color} p-4 rounded-xl text-left hover:shadow-md transition-all duration-300 border border-transparent hover:border-current/20`}
              >
                <div className="flex items-start gap-3">
                  <prompt.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium leading-tight">{prompt.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        className={`ai-hub-messages flex-1 overflow-y-auto p-6 ${dragOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-lg mb-6">
              <Bot className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-3">Welcome to AI Teaching Hub</h2>
            <p className="text-neutral-600 max-w-md mb-6">
              Your intelligent teaching assistant is ready to help with lesson planning, assessments, 
              student engagement, and more. Start a conversation or choose a quick prompt above.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                <MessageSquare className="w-4 h-4" />
                Text Messages
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full text-sm font-medium">
                <Mic className="w-4 h-4" />
                Voice Input
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm font-medium">
                <ImageIcon className="w-4 h-4" />
                Image Analysis
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                      : 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
                  }`}>
                    {message.type === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  
                  <div className={`rounded-2xl p-4 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                      : 'bg-white border border-neutral-200 shadow-sm'
                  }`}>
                    {message.processing ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-neutral-600">Processing...</span>
                      </div>
                    ) : (
                      <>
                        {renderMessageContent(message.content, message.type)}
                        
                        {message.attachments && (
                          <div className="mt-3 space-y-2">
                            {message.attachments.map((attachment, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg">
                                {attachment.type === 'image' ? (
                                  <img 
                                    src={attachment.url} 
                                    alt={attachment.name}
                                    className="w-20 h-20 object-cover rounded-lg"
                                  />
                                ) : (
                                  <FileText className="w-5 h-5 text-neutral-400" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-neutral-900 truncate">{attachment.name}</p>
                                  <p className="text-xs text-neutral-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {message.type === 'ai' && !message.processing && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
                            <button
                              onClick={() => copyToClipboard(message.content)}
                              className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                              title="Copy response"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => speakText(message.content)}
                              className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                              title="Read aloud"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1.5 text-neutral-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Good response"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Needs improvement"
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="ai-hub-input p-6 border-t border-neutral-200 bg-white">
        {/* Live Mode Controls */}
        {isLiveMode && (
          <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-red-800">Live Conversation Active</span>
              </div>
              <button
                onClick={stopLiveConversation}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                End Conversation
              </button>
            </div>
            <p className="text-sm text-red-600 mt-2">
              Speak naturally - your voice is being processed in real-time
            </p>
          </div>
        )}

        {/* Uploaded Images Preview */}
        {uploadedImages.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">
                {uploadedImages.length} image{uploadedImages.length > 1 ? 's' : ''} uploaded
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {uploadedImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt={image.file.name}
                    className="w-20 h-20 object-cover rounded-lg border border-blue-200"
                  />
                  <button
                    onClick={() => removeUploadedImage(image.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full 
                             opacity-0 group-hover:opacity-100 transition-opacity duration-200
                             flex items-center justify-center hover:bg-red-600"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs 
                                px-1 py-0.5 rounded-b-lg truncate">
                    {image.file.name}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-blue-600 mt-2">
              Add a prompt below to describe what you want me to do with {uploadedImages.length > 1 ? 'these images' : 'this image'}.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex items-end gap-4">
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isLiveMode 
                    ? "Live mode active - use voice input"
                    : uploadedImages.length > 0
                      ? "Describe what you want me to do with the uploaded image(s)..."
                      : "Ask me anything about teaching, lesson planning, assessments..."
                }
                className="w-full resize-none rounded-2xl border border-neutral-200 px-4 py-3 pr-24 
                         focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all
                         min-h-[56px] max-h-32"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={isLoading || isLiveMode}
              />
              
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2 rounded-lg transition-colors ${
                    uploadedImages.length > 0
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                      : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'
                  }`}
                  title="Upload image"
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                </button>
                
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : (isLiveMode ? stopLiveConversation : startRecording)}
                  className={`p-2 rounded-lg transition-colors ${
                    isRecording || isLiveMode
                      ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                      : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'
                  }`}
                  title={
                    isLiveMode 
                      ? "Stop live conversation" 
                      : isRecording 
                        ? "Stop recording" 
                        : "Voice input"
                  }
                >
                  {isRecording || isLiveMode ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={(!inputText.trim() && uploadedImages.length === 0) || isLoading || isLiveMode}
              className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl 
                       hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-3 text-xs text-neutral-500">
            <div className="flex items-center gap-4">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>•</span>
              <span>Ctrl+K for quick prompts</span>
              {uploadedImages.length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-blue-600">
                    {uploadedImages.length} image{uploadedImages.length > 1 ? 's' : ''} ready
                  </span>
                </>
              )}
              {sessionId && (
                <>
                  <span>•</span>
                  <span>Session: {sessionId.slice(0, 8)}...</span>
                </>
              )}
            </div>
            
            {(isRecording || isLiveMode) && (
              <div className="flex items-center gap-2 text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>{isLiveMode ? 'Live conversation...' : 'Recording...'}</span>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-neutral-900">AI Hub Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Voice Settings */}
              <div>
                <h4 className="font-semibold text-neutral-800 mb-3">Voice Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">Enable Voice</span>
                    <button
                      onClick={() => setVoiceSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        voiceSettings.enabled ? 'bg-blue-500' : 'bg-neutral-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        voiceSettings.enabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">Auto-play Responses</span>
                    <button
                      onClick={() => setVoiceSettings(prev => ({ ...prev, autoPlay: !prev.autoPlay }))}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        voiceSettings.autoPlay ? 'bg-blue-500' : 'bg-neutral-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        voiceSettings.autoPlay ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-neutral-700 mb-2">
                      Speech Speed: {voiceSettings.speed}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={voiceSettings.speed}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                      className="w-full accent-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <StatusBar 
        isLoading={isLoading}
        isRecording={isRecording}
        isLiveMode={isLiveMode}
        isConnecting={isConnecting}
        loadingMessage={loadingMessage}
      />
    </div>
  );
};



export default AITeachingHub;
