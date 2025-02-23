import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Search, User } from 'lucide-react';
import { chatService } from '../../../../services/chatService';
import { dashboardService } from '../../../../services/dashboardService';

interface ParentChat {
  parent_id: number;
  parent_name: string;
  student_name: string;
  student_id: string;
}

const Communication: React.FC = () => {
  const [selectedParent, setSelectedParent] = useState<ParentChat | null>(null);
  const [parents, setParents] = useState<ParentChat[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingParents, setIsLoadingParents] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load parents data when component mounts
  useEffect(() => {
    loadParentsData();
  }, []);

  const loadParentsData = async () => {
    try {
      setIsLoadingParents(true);
      const teacherId = JSON.parse(localStorage.getItem('userData') || '{}').id;
      
      if (!teacherId) {
        console.error('No teacher ID found');
        return;
      }

      const parentsList = await dashboardService.fetchParents(teacherId);
      console.log('Parents list:', parentsList);
      
      // Format the parents data, ensure all fields are present
      const formattedParents = parentsList.map((parent: any) => ({
        parent_id: parent.id || parent.parent_id, // Try both possible field names
        parent_name: parent.name || parent.parent_name,
        student_name: parent.student_name || 'Unknown Student',
        student_id: parent.student_id || 'N/A'
      }));

      console.log('Formatted parents data:', formattedParents);
      setParents(formattedParents);
    } catch (error) {
      console.error('Error loading parents data:', error);
    } finally {
      setIsLoadingParents(false);
    }
  };

  const loadChatHistory = async (parentId: number) => {
    try {
      const teacherId = JSON.parse(localStorage.getItem('userData') || '{}').id;
      if (!teacherId) {
        console.error('No teacher ID found');
        return;
      }

      console.log('Loading chat history for:', { teacherId, parentId });
      const history = await chatService.getParentChats(parentId, teacherId);
      
      // Format messages with sender info
      const formattedMessages = history.map(msg => ({
        ...msg,
        isSent: msg.sender === 'teacher'
      }));

      console.log('Formatted chat history:', formattedMessages);
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleParentSelect = async (parent: ParentChat) => {
    console.log('Selected parent:', parent);
    setSelectedParent(parent);
    if (parent.parent_id) {
      await loadChatHistory(parent.parent_id);
    } else {
      console.error('Parent ID is undefined:', parent);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedParent) return;

    const teacherId = JSON.parse(localStorage.getItem('userData') || '{}').id;
    if (!teacherId) {
      console.error('No teacher ID found');
      return;
    }
    
    try {
      await chatService.sendMessage({
        teacher_id: teacherId,
        parent_id: selectedParent.parent_id,
        message: message.trim()
      });

      // Reload chat history to get the new message
      await loadChatHistory(selectedParent.parent_id);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Parent Communications</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold">Chat with Parents</h2>
          <p className="text-sm text-gray-500">Communicate with parents about their child's progress</p>
        </div>
        
        {/* Chat Interface */}
        <div className="flex h-[calc(100vh-16rem)]">
          {/* Parents List */}
          <div className="w-80 border-r border-gray-200 bg-white rounded-l-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search parents..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {isLoadingParents ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                </div>
              ) : parents.length > 0 ? (
                parents.map((parent) => (
                  <button
                    key={parent.parent_id}
                    onClick={() => handleParentSelect(parent)}
                    className={`w-full p-4 text-left transition-all duration-200 relative
                      ${selectedParent?.parent_id === parent.parent_id 
                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                        : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{parent.parent_name}</p>
                        <p className="text-xs text-gray-500">Child: {parent.student_name}</p>
                        <p className="text-xs text-gray-400">ID: {parent.student_id}</p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No parents found
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-gray-50 rounded-r-xl">
            {selectedParent ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-white border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Chat with {selectedParent?.parent_name}</h3>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>Parent ID: {selectedParent?.parent_id}</p>
                        <p>Child: {selectedParent?.student_name}</p>
                        <p>Student ID: {selectedParent?.student_id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, index) => (
                    <div key={msg.chat_id || index} 
                      className={`flex ${msg.sender === 'teacher' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`
                        rounded-lg p-3 max-w-[70%] shadow-sm hover:shadow-md 
                        transition-all duration-200 
                        ${msg.sender === 'teacher' 
                          ? 'bg-blue-500 text-white rounded-br-none' 
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <div className={`
                          text-xs mt-1 flex items-center justify-end gap-2
                          ${msg.sender === 'teacher' ? 'text-blue-100' : 'text-gray-500'}
                        `}>
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Select a Parent</h3>
                  <p className="text-gray-500">Choose a parent to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communication;