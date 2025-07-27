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
  ExternalLink,
  GraduationCap,
  Heart,
  RotateCcw
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
import './AITeachingHub-overflow.css';

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

  const quickPrompts = [
    {
      category: 'planning',
      icon: Calendar,
      title: 'Lesson Planning',
      text: 'Help me create a comprehensive lesson plan for my next class',
      description: 'Generate structured lesson plans with objectives, activities, and assessments',
      gradient: 'from-sage-400 to-sage-500',
      bgGradient: 'from-sage-50 to-sage-100'
    },
    {
      category: 'assessment',
      icon: Target,
      title: 'Assessment Creation',
      text: 'Generate quiz questions and rubrics for my upcoming test',
      description: 'Create meaningful assessments that measure student understanding',
      gradient: 'from-academic-blue-400 to-academic-blue-500',
      bgGradient: 'from-academic-blue-50 to-academic-blue-100'
    },
    {
      category: 'engagement',
      icon: Users,
      title: 'Student Engagement',
      text: 'Suggest interactive activities to boost classroom participation',
      description: 'Discover creative ways to make learning more engaging',
      gradient: 'from-warm-amber-400 to-warm-amber-500',
      bgGradient: 'from-warm-amber-50 to-warm-amber-100'
    },
    {
      category: 'communication',
      icon: MessageSquare,
      title: 'Parent Communication',
      text: 'Help me draft a thoughtful message to parents about student progress',
      description: 'Craft professional and caring communications',
      gradient: 'from-gentle-purple-400 to-gentle-purple-500',
      bgGradient: 'from-gentle-purple-50 to-gentle-purple-100'
    },
    {
      category: 'resources',
      icon: BookOpen,
      title: 'Learning Resources',
      text: 'Find educational materials and resources for my subject',
      description: 'Discover curated content that enhances your teaching',
      gradient: 'from-warm-teal-400 to-warm-teal-500',
      bgGradient: 'from-warm-teal-50 to-warm-teal-100'
    },
    {
      category: 'reflection',
      icon: Lightbulb,
      title: 'Teaching Reflection',
      text: 'Help me reflect on today\'s lesson and identify areas for improvement',
      description: 'Thoughtful analysis to enhance your teaching practice',
      gradient: 'from-soft-rose-400 to-soft-rose-500',
      bgGradient: 'from-soft-rose-50 to-soft-rose-100'
    }
  ];

  // Enhanced message content renderer with thoughtful micro-interactions
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
                <div key={index} className={`prose prose-sm w-full break-words ${
                  messageType === 'user' ? 'prose-invert' : ''
                } prose-pre:overflow-x-auto prose-pre:w-full prose-code:break-words prose-code:whitespace-pre-wrap`}>
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
      <div className={`prose prose-sm w-full break-words ${
        messageType === 'user' ? 'prose-invert prose-slate' : 'prose-slate'
      } prose-headings:font-display prose-headings:text-slate-800 prose-p:text-slate-700 prose-p:leading-relaxed
        prose-pre:overflow-x-auto prose-pre:w-full prose-code:break-words prose-code:whitespace-pre-wrap`}>
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

  const filteredPrompts = selectedCategory === 'all' 
    ? quickPrompts 
    : quickPrompts.filter(prompt => prompt.category === selectedCategory);

  const promptCategories = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'planning', label: 'Lesson Planning', icon: Calendar },
    { id: 'assessment', label: 'Assessment', icon: BarChart3 },
    { id: 'engagement', label: 'Engagement', icon: Users },
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

  const startNewChat = async () => {
    try {
      // Clear current messages first
      setMessages([]);
      setShowQuickPrompts(true);
      
      // Delete the current session if it exists
      if (sessionId) {
        try {
          await aiTeachingHubService.deleteSession(sessionId);
          console.log(`Session ${sessionId} deleted successfully`);
        } catch (error) {
          console.error('Error deleting session:', error);
          // Continue even if delete fails
        }
      }
      
      // Generate new session ID
      const user = authService.getCurrentUser();
      const newSessionId = user?.id ? 
        `${user.id}_${Date.now()}` : 
        `guest_${Date.now()}`;
      
      setSessionId(newSessionId);
      console.log(`Started new chat with session ID: ${newSessionId}`);
      
    } catch (error) {
      console.error('Error starting new chat:', error);
    }
  };

  return (
    <div className="ai-teaching-hub h-full flex flex-col bg-gradient-to-br from-warm-white via-sage-50/30 to-academic-blue-50/20">
      {/* Enhanced Academic Header with Intelligent Micro-interactions */}
      <div className="ai-hub-header px-8 py-6 bg-white/85 backdrop-blur-xl border-b border-sage-200/50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            {/* Enhanced AI Avatar with Personality */}
            <div className="relative group">
              <div className="p-4 bg-gradient-to-br from-sage-500 to-academic-blue-500 rounded-2xl shadow-soft
                            group-hover:shadow-medium transition-all duration-300 group-hover:scale-105">
                <GraduationCap className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              {/* Simple pulse for AI activity */}
              {isLoading && (
                <div className="absolute -inset-1 bg-gradient-to-br from-sage-400 to-academic-blue-400 
                              rounded-2xl animate-pulse opacity-30"></div>
              )}
            </div>
            
            <div className="space-y-1">
              <h1 className="text-2xl font-display font-semibold text-slate-800 tracking-tight 
                           hover:text-slate-900 transition-colors duration-300">
                AI Teaching Hub
              </h1>
              <p className="text-slate-600 font-medium group-hover:text-slate-700 transition-colors duration-300">
                Your thoughtful teaching companion
              </p>
            </div>
            
            {/* Enhanced Live Mode Indicator with Better Design */}
            {isLiveMode && (
              <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-warm-amber-50/90 to-warm-amber-100/90 
                            backdrop-blur-sm border border-warm-amber-200/50 rounded-full shadow-soft animate-slide-in">
                <div className="relative">
                  <div className="w-2.5 h-2.5 bg-warm-amber-500 rounded-full animate-heartbeat"></div>
                  <div className="absolute inset-0 w-2.5 h-2.5 bg-warm-amber-400 rounded-full animate-ping opacity-40"></div>
                </div>
                <span className="text-sm font-medium text-warm-amber-700">Live Conversation</span>
                <div className="flex gap-0.5">
                  <div className="w-1 h-2 bg-warm-amber-500 rounded-full animate-wave"></div>
                  <div className="w-1 h-3 bg-warm-amber-500 rounded-full animate-wave" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1 h-2 bg-warm-amber-500 rounded-full animate-wave" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Enhanced Control Panel with Better Micro-interactions */}
          <div className="flex items-center gap-3">
            {/* Live Conversation Toggle with Enhanced Feedback */}
            <button
              onClick={isLiveMode ? stopLiveConversation : startLiveConversation}
              disabled={isConnecting}
              className={`group relative p-3 rounded-xl transition-all duration-300 shadow-soft hover:shadow-medium 
                        overflow-hidden ${
                isLiveMode 
                  ? 'bg-gradient-to-br from-warm-amber-100 to-warm-amber-200 text-warm-amber-700 hover:from-warm-amber-200 hover:to-warm-amber-300' 
                  : 'bg-white/70 text-sage-600 hover:bg-sage-50 hover:text-sage-700'
              } hover:scale-110`}
              title={isLiveMode ? "End Live Conversation" : "Start Live Conversation"}
            >
              {isConnecting ? (
                <div className="relative">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <div className="absolute inset-0 bg-sage-400/20 rounded-full animate-pulse-gentle"></div>
                </div>
              ) : isLiveMode ? (
                <div className="relative">
                  <PhoneOff className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  {/* Active state pulse */}
                  <div className="absolute inset-0 bg-warm-amber-400/20 rounded-xl animate-pulse-gentle"></div>
                </div>
              ) : (
                <>
                  <Phone className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                                -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                </>
              )}
            </button>

            {/* Enhanced Teaching Prompts Button */}
            <button
              onClick={() => setShowQuickPrompts(!showQuickPrompts)}
              className={`group relative p-3 rounded-xl transition-all duration-300 shadow-soft hover:shadow-medium 
                        overflow-hidden hover:scale-110 ${
                showQuickPrompts 
                  ? 'bg-gradient-to-br from-sage-100 to-sage-200 text-sage-700' 
                  : 'bg-white/70 text-slate-600 hover:bg-slate-100 hover:text-slate-700'
              }`}
              title="Quick Teaching Prompts"
            >
              <Lightbulb className={`w-5 h-5 transition-all duration-300 ${
                showQuickPrompts ? 'rotate-12 scale-110' : 'group-hover:scale-110'
              }`} />
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                            -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
            </button>
            
            {/* Enhanced Voice Settings Button */}
            <button
              onClick={() => isSpeaking ? stopSpeaking() : setVoiceSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`group relative p-3 rounded-xl transition-all duration-300 shadow-soft hover:shadow-medium 
                        overflow-hidden hover:scale-110 ${
                voiceSettings.enabled 
                  ? 'bg-gradient-to-br from-academic-blue-100 to-academic-blue-200 text-academic-blue-700' 
                  : 'bg-white/70 text-slate-600 hover:bg-slate-100 hover:text-slate-700'
              }`}
              title={isSpeaking ? "Stop Speaking" : "Voice Settings"}
            >
              {isSpeaking ? (
                <div className="relative">
                  <VolumeX className="w-5 h-5 animate-pulse" />
                  {/* Speaking indicator waves */}
                  <div className="absolute -right-1 -top-1 flex gap-0.5">
                    <div className="w-0.5 h-2 bg-academic-blue-500 rounded-full animate-wave"></div>
                    <div className="w-0.5 h-3 bg-academic-blue-500 rounded-full animate-wave" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-0.5 h-2 bg-academic-blue-500 rounded-full animate-wave" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              ) : (
                <>
                  <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                                -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                </>
              )}
            </button>
                        
            {/* Start New Chat Button */}
            <button
              onClick={startNewChat}
              className="group relative p-3 rounded-xl bg-white/70 text-sage-600 hover:bg-sage-50 hover:text-sage-700 
                       transition-all duration-300 shadow-soft hover:shadow-medium hover:scale-110 overflow-hidden"
              title="Start New Chat"
            >
              <RotateCcw className="w-5 h-5 group-hover:scale-110 group-hover:rotate-180 transition-all duration-300" />
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                            -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
            </button>
            
            {/* Enhanced Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="group relative p-3 rounded-xl bg-white/70 text-slate-600 hover:bg-slate-50 hover:text-slate-700 
                       transition-all duration-300 shadow-soft hover:shadow-medium hover:scale-110 overflow-hidden"
              title="Settings"
            >
              <Settings className="w-5 h-5 group-hover:rotate-90 group-hover:scale-110 transition-all duration-300" />
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                            -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Elegant Quick Prompts Panel */}
      {showQuickPrompts && (
        <div className="ai-hub-prompts px-8 py-6 bg-white/60 backdrop-blur-md border-b border-sage-200/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6 animate-slide-down">
              <div className="space-y-1">
                <h3 className="text-lg font-display font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 bg-sage-400 rounded-full animate-pulse-gentle"></div>
                  Teaching Companions
                </h3>
                <p className="text-slate-600 text-sm">Thoughtfully crafted prompts for every teaching moment</p>
              </div>
              
              <button
                onClick={() => setShowQuickPrompts(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 
                         transition-all duration-300 hover:rotate-90 hover:scale-110"
                title="Close teaching companions"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Enhanced Grid Layout with Staggered Animation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(prompt.text)}
                  className={`group relative p-6 rounded-2xl bg-gradient-to-br ${prompt.bgGradient} 
                           border border-white/50 shadow-soft hover:shadow-medium transition-all duration-500 
                           hover:-translate-y-2 text-left overflow-hidden transform hover:scale-[1.02]
                           animate-slide-up opacity-0`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  {/* Apple-style shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent 
                                opacity-0 group-hover:opacity-100 transition-all duration-500 
                                transform translate-y-full group-hover:translate-y-0"></div>
                  
                  {/* Gentle ripple effect on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 
                                bg-radial-gradient from-white via-transparent to-transparent 
                                animate-ripple"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${prompt.gradient} shadow-soft
                                     group-hover:shadow-medium transition-all duration-300 
                                     group-hover:scale-110 group-hover:rotate-3`}>
                        <prompt.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-semibold text-slate-800 group-hover:text-slate-900 
                                     text-sm mb-2 transition-colors duration-300">
                          {prompt.title}
                        </h4>
                        <p className="text-xs text-slate-600 group-hover:text-slate-700 line-clamp-2 
                                   leading-relaxed transition-colors duration-300">
                          {prompt.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Apple-style arrow with smooth transition */}
                    <div className="flex justify-end">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center
                                    opacity-0 group-hover:opacity-100 transition-all duration-300 
                                    transform translate-x-2 group-hover:translate-x-0 group-hover:scale-110">
                        <svg className="w-4 h-4 text-slate-700 transition-transform duration-300 group-hover:translate-x-0.5" 
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Conversation Area with Thoughtful Message Flow */}
      <div
        className={`ai-hub-messages flex-1 overflow-y-auto px-8 py-6 transition-all duration-500 ${
          dragOver 
            ? 'bg-gradient-to-br from-sage-50 to-academic-blue-50 border-2 border-dashed border-sage-300 scale-[0.99]' 
            : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Enhanced drag overlay with Apple-style feedback */}
        {dragOver && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-large border border-sage-200/50
                          animate-scale-in">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-sage-400 to-academic-blue-400 
                              rounded-2xl flex items-center justify-center animate-bounce-gentle">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-semibold text-slate-800 mb-1">Drop your files here</h3>
                  <p className="text-sm text-slate-600">I'll analyze them thoughtfully</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            /* Enhanced Welcome Screen with Warm Micro-interactions */
            <div className="flex flex-col items-center justify-center h-full text-center py-16 animate-fade-in">
              <div className="relative mb-8 group">
                <div className="p-8 bg-gradient-to-br from-sage-500 to-academic-blue-500 rounded-3xl shadow-large
                              group-hover:shadow-xl transition-all duration-500 group-hover:scale-105">
                  <GraduationCap className="w-16 h-16 text-white animate-float" />
                </div>
                {/* Gentle pulse ring */}
                <div className="absolute inset-0 bg-gradient-to-br from-sage-400 to-academic-blue-400 
                              rounded-3xl animate-pulse-gentle opacity-30 scale-110"></div>
                {/* Floating companion heart */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-warm-amber-400 to-warm-amber-500 
                              rounded-full animate-float shadow-soft flex items-center justify-center
                              group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="space-y-6 max-w-2xl animate-slide-up" style={{ animationDelay: '200ms' }}>
                <h2 className="text-3xl font-display font-semibold text-slate-800 tracking-tight">
                  Welcome to Your Teaching Companion
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  I'm here to support your teaching journey with thoughtful insights, 
                  creative lesson ideas, and gentle guidance whenever you need it.
                </p>
              </div>
              
              {/* Enhanced Feature Highlights with Micro-interactions */}
              <div className="flex flex-wrap gap-6 justify-center mt-8 animate-slide-up" 
                   style={{ animationDelay: '400ms' }}>
                <div className="group flex items-center gap-3 px-5 py-3 bg-white/60 backdrop-blur-sm 
                              rounded-full shadow-soft hover:shadow-medium transition-all duration-300 
                              hover:scale-105 hover:bg-white/80">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sage-400 to-sage-500 
                                flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-800">
                    Thoughtful Conversations
                  </span>
                </div>
                <div className="group flex items-center gap-3 px-5 py-3 bg-white/60 backdrop-blur-sm 
                              rounded-full shadow-soft hover:shadow-medium transition-all duration-300 
                              hover:scale-105 hover:bg-white/80">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-academic-blue-400 to-academic-blue-500 
                                flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Mic className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-800">
                    Voice Interactions
                  </span>
                </div>
                <div className="group flex items-center gap-3 px-5 py-3 bg-white/60 backdrop-blur-sm 
                              rounded-full shadow-soft hover:shadow-medium transition-all duration-300 
                              hover:scale-105 hover:bg-white/80">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-warm-amber-400 to-warm-amber-500 
                                flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <ImageIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-800">
                    Document Analysis
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Enhanced Message Thread with Thoughtful Flow */
            <div className="space-y-8">
              {messages.map((message, index) => (
                <div 
                  key={message.id} 
                  className={`flex gap-4 animate-message-slide-in ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                  style={{ 
                    // animationDelay: `${index * 100}ms`,
                    // animationFillMode: 'backwards'
                  }}
                >
                  <div className={`flex gap-4 max-w-[80%] ${
                    message.type === 'user' ? 'flex-row-reverse' : ''
                  }`}>
                    {/* Enhanced Avatar with Personality */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 
                                   shadow-soft transition-all duration-300 hover:shadow-medium hover:scale-105 ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-br from-slate-500 to-slate-600 text-white hover:from-slate-600 hover:to-slate-700' 
                        : 'bg-gradient-to-br from-sage-500 to-academic-blue-500 text-white hover:from-sage-600 hover:to-academic-blue-600'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-6 h-6" />
                      ) : (
                        <GraduationCap className="w-6 h-6" />
                      )}
                      {/* Simple pulse for AI thinking */}
                      {message.processing && message.type === 'ai' && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sage-400 to-academic-blue-400 
                                      animate-pulse opacity-40"></div>
                      )}
                    </div>
                    
                    {/* Enhanced Message Card with Paper-like Feel */}
                    <div className={`rounded-2xl px-6 py-5 shadow-soft backdrop-blur-sm transition-all duration-500 
                                   hover:shadow-medium group break-words ${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800'
                        : 'bg-white/85 border border-sage-200/30 text-slate-800 hover:bg-white/95 hover:border-sage-300/50'
                    }`}>
                      {message.processing ? (
                        /* Simple Thinking Indicator */
                        <div className="flex items-center gap-3 py-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-sage-500 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-sage-500 rounded-full animate-pulse" 
                                 style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 bg-sage-500 rounded-full animate-pulse" 
                                 style={{animationDelay: '0.4s'}}></div>
                          </div>
                          <span className="text-slate-600 text-sm">
                            Agent is thinking...
                          </span>
                        </div>
                      ) : (
                        <>
                          {/* Direct message content without typing animation */}
                          <div className="w-full">
                            {renderMessageContent(message.content, message.type)}
                          </div>
                          
                          {/* Enhanced Attachment Preview */}
                          {message.attachments && (
                            <div className="mt-5 space-y-3">
                              {message.attachments.map((attachment, idx) => (
                                <div key={idx} className="group flex items-center gap-4 p-4 bg-slate-50/60 backdrop-blur-sm 
                                                        rounded-xl border border-slate-200/30 hover:border-slate-300/50 
                                                        transition-all duration-300 hover:bg-slate-50/80">
                                  {attachment.type === 'image' ? (
                                    <div className="relative overflow-hidden rounded-lg">
                                      <img 
                                        src={attachment.url} 
                                        alt={attachment.name}
                                        className="w-20 h-20 object-cover shadow-soft group-hover:scale-105 
                                                 transition-transform duration-300"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent 
                                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                  ) : (
                                    <div className="w-12 h-12 bg-gradient-to-br from-academic-blue-400 to-academic-blue-500 
                                                  rounded-xl flex items-center justify-center shadow-soft">
                                      <FileText className="w-6 h-6 text-white" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate group-hover:text-slate-900">
                                      {attachment.name}
                                    </p>
                                    <p className="text-xs text-slate-500 group-hover:text-slate-600">
                                      {(attachment.size / 1024).toFixed(1)} KB
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Enhanced Message Actions with Micro-interactions */}
                          {message.type === 'ai' && !message.processing && (
                            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-200/20 
                                          opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <button
                                onClick={() => copyToClipboard(message.content)}
                                className="group/btn p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 
                                         rounded-xl transition-all duration-200 hover:scale-110"
                                title="Copy response"
                              >
                                <Copy className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
                              </button>
                              <button
                                onClick={() => speakText(message.content)}
                                className="group/btn p-2.5 text-slate-400 hover:text-academic-blue-600 hover:bg-academic-blue-50 
                                         rounded-xl transition-all duration-200 hover:scale-110"
                                title="Read aloud"
                              >
                                <Volume2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
                              </button>
                              <button
                                className="group/btn p-2.5 text-slate-400 hover:text-sage-600 hover:bg-sage-50 
                                         rounded-xl transition-all duration-200 hover:scale-110"
                                title="Helpful response"
                              >
                                <ThumbsUp className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
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
      </div>

      {/* Enhanced Input Area - Floating Academic Design */}
      <div className="ai-hub-input px-8 py-6 bg-white/80 backdrop-blur-xl border-t border-sage-200/50">
        {/* Enhanced Live Mode Indicator with Apple-style Design */}
        {isLiveMode && (
          <div className="max-w-4xl mx-auto mb-6 animate-slide-down">
            <div className="p-6 bg-gradient-to-r from-warm-amber-50/90 to-warm-amber-100/90 backdrop-blur-sm
                          border border-warm-amber-200/50 rounded-2xl shadow-soft hover:shadow-medium 
                          transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Enhanced live indicator with multiple rings */}
                  <div className="relative">
                    <div className="w-4 h-4 bg-warm-amber-500 rounded-full animate-heartbeat"></div>
                    <div className="absolute inset-0 w-4 h-4 bg-warm-amber-400 rounded-full animate-ping opacity-40"></div>
                    <div className="absolute -inset-1 w-6 h-6 bg-warm-amber-300 rounded-full animate-pulse-gentle opacity-20"></div>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-display font-semibold text-warm-amber-800 flex items-center gap-2">
                      Live conversation is active
                      <div className="flex gap-1">
                        <div className="w-1 h-3 bg-warm-amber-500 rounded-full animate-wave"></div>
                        <div className="w-1 h-4 bg-warm-amber-500 rounded-full animate-wave" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1 h-2 bg-warm-amber-500 rounded-full animate-wave" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-1 h-4 bg-warm-amber-500 rounded-full animate-wave" style={{animationDelay: '0.3s'}}></div>
                        <div className="w-1 h-3 bg-warm-amber-500 rounded-full animate-wave" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </h4>
                    <p className="text-sm text-warm-amber-700">
                      Speak naturally - I'm listening and will respond thoughtfully
                    </p>
                  </div>
                </div>
                
                {/* Enhanced end conversation button */}
                <button
                  onClick={stopLiveConversation}
                  className="group px-6 py-3 bg-gradient-to-br from-warm-amber-500 to-warm-amber-600 
                           hover:from-warm-amber-600 hover:to-warm-amber-700 text-white rounded-xl 
                           transition-all duration-300 shadow-soft hover:shadow-medium
                           hover:scale-105 hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <PhoneOff className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="font-medium">End Conversation</span>
                </button>
              </div>
              
              {/* Connection quality indicator */}
              <div className="mt-4 flex items-center gap-2 text-xs text-warm-amber-700">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-warm-amber-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-warm-amber-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-warm-amber-400 rounded-full animate-pulse"></div>
                </div>
                <span>Excellent connection quality</span>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Image Upload Preview with Apple-style Design */}
        {uploadedImages.length > 0 && (
          <div className="max-w-4xl mx-auto mb-6 animate-slide-up">
            <div className="p-6 bg-gradient-to-br from-academic-blue-50/80 to-white/60 backdrop-blur-sm 
                          border border-academic-blue-200/30 rounded-2xl shadow-soft hover:shadow-medium 
                          transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-academic-blue-400 to-academic-blue-500 
                              rounded-xl flex items-center justify-center shadow-soft">
                  <ImageIcon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-display font-semibold text-academic-blue-800 text-sm">
                    {uploadedImages.length} image{uploadedImages.length > 1 ? 's' : ''} ready for analysis
                  </h4>
                  <p className="text-xs text-academic-blue-600">
                    I'll analyze {uploadedImages.length > 1 ? 'these images' : 'this image'} together with your question
                  </p>
                </div>
              </div>
              
              {/* Enhanced Image Grid */}
              <div className="flex flex-wrap gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={image.id} className="group relative animate-scale-in" 
                       style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="relative overflow-hidden rounded-xl border-2 border-academic-blue-200/30 
                                  shadow-soft group-hover:shadow-medium transition-all duration-300 
                                  group-hover:scale-105">
                      <img
                        src={image.url}
                        alt={image.file.name}
                        className="w-24 h-24 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Enhanced remove button */}
                      <button
                        onClick={() => removeUploadedImage(image.id)}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-slate-500 hover:bg-slate-600 text-white 
                                 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200
                                 flex items-center justify-center shadow-medium hover:scale-110 
                                 hover:rotate-90 backdrop-blur-sm"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      {/* File info on hover */}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent
                                    transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-xs text-white truncate font-medium">{image.file.name}</p>
                      </div>
                    </div>
                    
                    {/* Processing indicator */}
                    {uploading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl 
                                    flex items-center justify-center">
                        <div className="text-center">
                          <Loader2 className="w-5 h-5 animate-spin text-academic-blue-500 mx-auto mb-1" />
                          <p className="text-xs text-academic-blue-600">Processing...</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Helpful hint */}
              <div className="mt-4 p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-academic-blue-200/20">
                <p className="text-xs text-academic-blue-700 flex items-center gap-2">
                  <Lightbulb className="w-3 h-3" />
                  Type your question below and I'll analyze {uploadedImages.length > 1 ? 'these images' : 'this image'} thoughtfully
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Main Input Form with Apple-style Interactions */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex items-end gap-4">
            <div className="flex-1 relative group">
              {/* Enhanced textarea with better focus states */}
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isLiveMode 
                    ? "Live conversation active - speak naturally..."
                    : uploadedImages.length > 0
                      ? "What would you like to know about these images?"
                      : "Share your teaching thoughts, questions, or challenges..."
                }
                className="w-full resize-none rounded-2xl border-0 bg-white/90 backdrop-blur-sm 
                         px-6 py-5 pr-28 shadow-soft focus:shadow-large transition-all duration-500
                         focus:ring-2 focus:ring-sage-400/30 focus:bg-white/95 min-h-[64px] max-h-40
                         text-slate-800 placeholder-slate-500 font-medium leading-relaxed
                         group-hover:shadow-medium"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={isLoading || isLiveMode}
              />
              
              {/* Floating character count (subtle) */}
              {inputText.length > 50 && (
                <div className="absolute bottom-2 left-4 text-xs text-slate-400 opacity-60">
                  {inputText.length} characters
                </div>
              )}
              
              {/* Enhanced Input Actions with Better Micro-interactions */}
              <div className="absolute right-4 bottom-4 flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {/* File upload button with enhanced feedback */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`group/upload p-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                    uploadedImages.length > 0
                      ? 'text-academic-blue-600 bg-academic-blue-50 hover:bg-academic-blue-100 shadow-soft'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/60 hover:shadow-soft'
                  } hover:scale-110`}
                  title="Share an image"
                  disabled={uploading}
                >
                  {uploading ? (
                    <div className="relative">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <div className="absolute inset-0 bg-academic-blue-400/20 rounded-full animate-pulse-gentle"></div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 transition-transform duration-200 group-hover/upload:scale-110" />
                      {/* Shine effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                                    -translate-x-full group-hover/upload:translate-x-full transition-transform duration-500"></div>
                    </>
                  )}
                </button>
                
                {/* Enhanced voice button with waveform indication */}
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : (isLiveMode ? stopLiveConversation : startRecording)}
                  className={`group/voice relative p-3 rounded-xl transition-all duration-300 overflow-hidden ${
                    isRecording || isLiveMode
                      ? 'text-white bg-gradient-to-br from-warm-amber-500 to-warm-amber-600 shadow-medium' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/60 hover:shadow-soft'
                  } hover:scale-110`}
                  title={
                    isLiveMode 
                      ? "End live conversation" 
                      : isRecording 
                        ? "Stop recording" 
                        : "Voice message"
                  }
                >
                  {isRecording || isLiveMode ? (
                    <div className="relative">
                      <MicOff className="w-5 h-5" />
                      {/* Animated waveform rings */}
                      <div className="absolute inset-0 rounded-xl">
                        <div className="absolute inset-0 bg-warm-amber-400/30 rounded-xl animate-ping"></div>
                        <div className="absolute inset-0 bg-warm-amber-400/20 rounded-xl animate-pulse-gentle"></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 transition-transform duration-200 group-hover/voice:scale-110" />
                      {/* Shine effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                                    -translate-x-full group-hover/voice:translate-x-full transition-transform duration-500"></div>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Enhanced Send Button with Paper Plane Animation */}
            <button
              type="submit"
              disabled={(!inputText.trim() && uploadedImages.length === 0) || isLoading || isLiveMode}
              className="group relative p-4 bg-gradient-to-br from-sage-500 to-academic-blue-500 text-white rounded-2xl 
                       hover:from-sage-600 hover:to-academic-blue-600 disabled:opacity-50 
                       disabled:cursor-not-allowed transition-all duration-300 shadow-soft hover:shadow-large
                       hover:-translate-y-1 hover:scale-105 disabled:hover:translate-y-0 disabled:hover:scale-100
                       overflow-hidden"
            >
              {isLoading ? (
                <div className="relative">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {/* Pulsing background */}
                  <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse-gentle"></div>
                </div>
              ) : (
                <>
                  <Send className="w-6 h-6 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                                -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </>
              )}
            </button>
          </div>
          
          {/* Enhanced Status Information with Better Typography */}
          <div className="flex items-center justify-between mt-4 text-xs">
            <div className="flex items-center gap-6 text-slate-500">
              <span className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-mono text-xs border">Enter</kbd>
                to send
              </span>
              <span className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-mono text-xs border">Shift+Enter</kbd>
                for new line
              </span>
              {uploadedImages.length > 0 && (
                <span className="flex items-center gap-2 text-academic-blue-600 font-medium">
                  <div className="w-2 h-2 bg-academic-blue-400 rounded-full animate-pulse-gentle"></div>
                  {uploadedImages.length} image{uploadedImages.length > 1 ? 's' : ''} attached
                </span>
              )}
            </div>
            
            {/* Enhanced Activity Indicator */}
            {(isRecording || isLiveMode) && (
              <div className="flex items-center gap-3 text-warm-amber-600 animate-slide-up">
                <div className="flex gap-1">
                  <div className="w-1 h-3 bg-warm-amber-500 rounded-full animate-wave"></div>
                  <div className="w-1 h-4 bg-warm-amber-500 rounded-full animate-wave" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1 h-2 bg-warm-amber-500 rounded-full animate-wave" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1 h-4 bg-warm-amber-500 rounded-full animate-wave" style={{animationDelay: '0.3s'}}></div>
                  <div className="w-1 h-3 bg-warm-amber-500 rounded-full animate-wave" style={{animationDelay: '0.4s'}}></div>
                </div>
                <span className="font-medium">
                  {isLiveMode ? 'Live conversation active' : 'Recording audio'}
                </span>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Settings Modal - Clean Academic */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-large max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-display font-semibold text-slate-800">Teaching Hub Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-slate-100/50 rounded-xl transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Voice Settings */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-4">Voice & Audio</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 font-medium">Enable voice responses</span>
                    <button
                      onClick={() => setVoiceSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                      className={`w-12 h-6 rounded-full transition-all duration-300 ${
                        voiceSettings.enabled ? 'bg-sage-500' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-soft transition-transform duration-300 ${
                        voiceSettings.enabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 font-medium">Auto-play responses</span>
                    <button
                      onClick={() => setVoiceSettings(prev => ({ ...prev, autoPlay: !prev.autoPlay }))}
                      className={`w-12 h-6 rounded-full transition-all duration-300 ${
                        voiceSettings.autoPlay ? 'bg-sage-500' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-soft transition-transform duration-300 ${
                        voiceSettings.autoPlay ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-700 font-medium mb-2">
                      Speech speed: {voiceSettings.speed}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={voiceSettings.speed}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                      className="w-full accent-sage-500"
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
