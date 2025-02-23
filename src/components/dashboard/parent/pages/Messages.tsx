import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Search, User, Clock, AlertCircle, Phone, Mail } from 'lucide-react';
import { dashboardService } from '../../../../services/dashboardService';
import { authService } from '../../../../services/authService';
import { chatService } from '../../../../services/chatService';

interface Teacher {
  id: number;
  name: string;
  email: string;
  role: string;
  subject: string | null;
}

interface ChatMessage {
  chat_id: number;
  created_at: string;
  is_read: boolean;
  message: string;
  parent_id: number;
  sender: 'parent' | 'teacher';
  teacher_id: number;
}

const Messages = () => {
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const userData = authService.getCurrentUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setIsLoading(true);
      const teachersData = await dashboardService.fetchTeachers();
      // Filter out teachers without subjects
      const validTeachers = teachersData.filter(teacher => teacher.subject);
      setTeachers(validTeachers);
    } catch (err) {
      console.error('Error loading teachers:', err);
      setError('Failed to load teachers');
    } finally {
      setIsLoading(false);
    }
  };

  // Get parent ID once when component mounts
  const [parentId, setParentId] = useState<number | null>(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const id = userData?.id || userData?.parent_id;
    if (id) {
      setParentId(Number(id));
    }
  }, []);

  // Update teacher selection handler
  const handleTeacherSelect = async (teacherId: number) => {
    console.log('Selected teacher:', teacherId);
    setSelectedTeacher(teacherId);
    
    const storedUserData = localStorage.getItem('userData');
    if (!storedUserData) {
      console.error('No user data found in localStorage');
      return;
    }

    const userData = JSON.parse(storedUserData);
    const parentId = userData.parent_id || userData.id;

    if (!parentId) {
      console.error('No parent ID found in userData:', userData);
      return;
    }

    try {
      console.log('Loading chat history for:', { parentId, teacherId });
      const history = await chatService.getParentChats(Number(parentId), teacherId);
      
      if (Array.isArray(history)) {
        const formattedMessages = formatMessages(history);

        console.log('Formatted messages:', formattedMessages);
        setChatMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const formatMessages = (history: ChatMessage[]) => {
    const currentUserRole = JSON.parse(localStorage.getItem('userData') || '{}')?.role;
    
    return history.map(msg => ({
      id: msg.chat_id,
      message: msg.message,
      sender_id: msg.sender === 'parent' ? msg.parent_id : msg.teacher_id,
      timestamp: msg.created_at,
      sender: msg.sender,
      isSent: currentUserRole === msg.sender
    }));
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedTeacher) return;

    // Get user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    if (!storedUserData) {
      console.error('No user data found in localStorage');
      return;
    }

    const userData = JSON.parse(storedUserData);
    console.log('User data for sending message:', userData);
    
    // Get parent ID - try all possible locations
    const parentId = userData.parent_id || userData.id;
    if (!parentId) {
      console.error('No parent ID found in userData:', userData);
      return;
    }

    try {
      setIsSending(true);
      console.log('Sending message with data:', {
        teacher_id: selectedTeacher,
        parent_id: parentId,
        message: message.trim()
      });

      const response = await chatService.sendMessage({
        teacher_id: selectedTeacher,
        parent_id: parentId,
        message: message.trim()
      });
      
      // Add new message to chat window
      const newMessage = {
        message: message.trim(),
        sender_id: parentId,
        timestamp: new Date().toISOString(),
        isSent: true,
        id: response?.id
      };
      
      setChatMessages(prev => [...prev, newMessage]);
      setMessage('');
      
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Reset chat messages when selecting a different teacher
  useEffect(() => {
    setChatMessages([]);
  }, [selectedTeacher]);

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>{error}</p>
          <button onClick={loadTeachers} className="mt-2 text-sm underline">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7rem)]">
      {/* Teacher List */}
      <div className="w-80 border-r border-gray-200 bg-white rounded-l-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teachers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {filteredTeachers.length > 0 ? (
            filteredTeachers.map((teacher) => (
              <button
                key={teacher.id}
                onClick={() => handleTeacherSelect(teacher.id)}
                className={`w-full p-4 text-left transition-all duration-200 relative
                  ${selectedTeacher === teacher.id 
                    ? 'bg-blue-50 border-l-4 border-blue-500' 
                    : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center
                      ${selectedTeacher === teacher.id ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <User className={`h-6 w-6 ${selectedTeacher === teacher.id ? 'text-blue-500' : 'text-gray-400'}`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{teacher.name}</p>
                    <p className="text-xs text-gray-500">{teacher.subject || 'No subject assigned'}</p>
                    <p className="text-xs text-gray-400 mt-1">{teacher.email}</p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No teachers found matching your search
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50 rounded-r-xl">
        {selectedTeacher ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200 rounded-tr-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {teachers.find(t => t.id === selectedTeacher)?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {teachers.find(t => t.id === selectedTeacher)?.subject}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 rounded-lg transition-all duration-200
                    hover:bg-gray-100 hover:text-gray-700 active:scale-95">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-500 rounded-lg transition-all duration-200
                    hover:bg-gray-100 hover:text-gray-700 active:scale-95">
                    <Mail className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Updated Messages Section */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, index) => (
                <div key={msg.id || index} 
                  className={`flex ${msg.isSent ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Message bubble with improved styling */}
                  <div className={`
                    rounded-lg p-3 max-w-[70%] shadow-sm hover:shadow-md 
                    transition-all duration-200 
                    ${msg.sender === 'parent'
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <div className={`
                      text-xs mt-1 flex items-center justify-end gap-2
                      ${msg.sender === 'parent' ? 'text-blue-100' : 'text-gray-500'}
                    `}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} /> {/* Scroll anchor */}
            </div>

            {/* Updated Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg
                    transition-all duration-200
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isSending || !message.trim()}
                  className={`p-2 rounded-lg transition-all duration-200 transform
                    ${isSending || !message.trim() 
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
                    }
                    text-white`}
                >
                  <Send className={`h-5 w-5 ${isSending ? 'animate-pulse' : ''}`} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Messages are monitored for student safety. Keep communication professional.
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4
                transition-transform duration-200 hover:scale-110">
                <MessageSquare className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Select a Teacher</h3>
              <p className="text-gray-500 mt-1">
                Choose a teacher from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;