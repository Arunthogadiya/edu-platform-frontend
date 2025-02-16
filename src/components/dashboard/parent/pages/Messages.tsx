import React, { useState } from 'react';
import { MessageSquare, Send, Search, User, Clock, AlertCircle, Phone, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '../../ui/alert';

const Messages = () => {
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const userData = JSON.parse(sessionStorage.getItem('userData') || 'null');

  const teachers = [
    {
      id: '1',
      name: 'Mrs. Thompson',
      subject: 'Mathematics',
      lastMessage: 'Regarding tomorrow\'s test preparation',
      time: '2m ago',
      unread: true,
      online: true,
      color: 'blue'
    },
    {
      id: '2',
      name: 'Mr. Davis',
      subject: 'Science',
      lastMessage: 'Great progress in today\'s lab work',
      time: '1h ago',
      unread: false,
      online: false
    },
    {
      id: '3',
      name: 'Ms. Wilson',
      subject: 'English',
      lastMessage: 'Essay submission deadline extended',
      time: '3h ago',
      unread: true,
      online: true
    }
  ];

  return (
    <div className="flex h-[calc(100vh-7rem)]">
      {/* Teacher List */}
      <div className="w-80 border-r border-gray-200 bg-white rounded-l-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search teachers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm
                transition-all duration-200 
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {teachers.map((teacher) => (
            <button
              key={teacher.id}
              onClick={() => setSelectedTeacher(teacher.id)}
              className={`w-full p-4 text-left transition-all duration-200 relative
                ${selectedTeacher === teacher.id 
                  ? 'bg-blue-50 border-l-4 border-blue-500' 
                  : 'hover:bg-gray-50 border-l-4 border-transparent hover:border-blue-500'}
                active:scale-[0.99]`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center
                    ${selectedTeacher === teacher.id ? 'bg-blue-100' : 'bg-gray-100'}
                    transition-colors duration-200`}>
                    <User className={`h-6 w-6 ${selectedTeacher === teacher.id ? 'text-blue-500' : 'text-gray-400'}`} />
                  </div>
                  {teacher.online && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full
                      border-2 border-white transform transition-transform duration-200 hover:scale-110" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium transition-colors duration-200
                      ${selectedTeacher === teacher.id ? 'text-blue-600' : 'text-gray-900'}`}>
                      {teacher.name}
                    </p>
                    <span className="text-xs text-gray-500">{teacher.time}</span>
                  </div>
                  <p className="text-xs text-gray-500">{teacher.subject}</p>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {teacher.lastMessage}
                  </p>
                </div>
                {teacher.unread && (
                  <div className="h-2 w-2 bg-blue-500 rounded-full transform transition-transform duration-200 hover:scale-110" />
                )}
              </div>
            </button>
          ))}
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex justify-start">
                <div className="bg-white rounded-lg p-3 max-w-[70%] shadow-sm
                  hover:shadow-md transition-shadow duration-200">
                  <p className="text-gray-800">
                    Good morning! Just wanted to inform you about tomorrow's math test. Please ensure {userData?.studentName} reviews chapters 5 and 6.
                  </p>
                  <span className="text-xs text-gray-500 mt-1 block">9:30 AM</span>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bg-blue-500 rounded-lg p-3 max-w-[70%] shadow-sm
                  hover:shadow-md transition-shadow duration-200">
                  <p className="text-white">
                    Thank you for the reminder. Will calculators be allowed during the test?
                  </p>
                  <span className="text-xs text-blue-100 mt-1 block">9:45 AM</span>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg
                    transition-all duration-200
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="bg-blue-500 text-white p-2 rounded-lg transition-all duration-200
                  hover:bg-blue-600 active:scale-95 transform">
                  <Send className="h-5 w-5" />
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