import React from 'react';
import { Outlet, useMatch } from 'react-router-dom';
import { Book, Bell, Calendar, MessageSquare, TrendingUp, Clock } from 'lucide-react';

const ParentDashboard: React.FC = () => {
  const isIndexRoute = useMatch('/parent/dashboard');
  const userData = JSON.parse(sessionStorage.getItem('userData') || 'null');

  const renderOverview = () => (
    <div className="p-8">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-900">Today's Classes</h3>
            <Clock className="h-6 w-6 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-700">5/6</p>
          <p className="text-sm text-purple-600 mt-1">Classes completed</p>
        </div>

        <div className="bg-green-50 p-6 rounded-xl border border-green-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-900">Attendance</h3>
            <Calendar className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-700">Present</p>
          <p className="text-sm text-green-600 mt-1">Arrived at 8:45 AM</p>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-900">Homework</h3>
            <Book className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-700">2</p>
          <p className="text-sm text-blue-600 mt-1">Tasks due today</p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-yellow-900">Messages</h3>
            <MessageSquare className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-700">{userData?.messages?.unread || 2}</p>
          <p className="text-sm text-yellow-600 mt-1">Unread messages</p>
        </div>
      </div>

      {/* Recent Updates and Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timeline */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Today's Timeline</h2>
            <Clock className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-6">
            {[
              { time: '8:45 AM', event: 'Arrived at school', type: 'attendance' },
              { time: '9:00 AM', event: 'Mathematics Class', type: 'class' },
              { time: '10:30 AM', event: 'Science Test', type: 'assessment' },
              { time: '12:00 PM', event: 'Lunch Break', type: 'break' },
              { time: '1:00 PM', event: 'English Class', type: 'class' },
            ].map((item, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-16 text-sm text-gray-500">
                  {item.time}
                </div>
                <div className={`w-px h-full mx-4 ${
                  item.type === 'assessment' ? 'bg-yellow-500' :
                  item.type === 'class' ? 'bg-blue-500' :
                  item.type === 'break' ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Updates */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Updates</h2>
            <Bell className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            {[
              {
                title: 'Mathematics Test Result',
                description: 'Scored 92% in recent test',
                time: '2 hours ago',
                icon: TrendingUp,
                color: 'text-green-500'
              },
              {
                title: 'New Message from Science Teacher',
                description: 'Regarding upcoming project submission',
                time: '3 hours ago',
                icon: MessageSquare,
                color: 'text-blue-500'
              },
              {
                title: 'Homework Submission',
                description: 'English essay submitted successfully',
                time: '5 hours ago',
                icon: Book,
                color: 'text-purple-500'
              }
            ].map((update, index) => (
              <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className={`flex-shrink-0 ${update.color}`}>
                  <update.icon className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{update.title}</p>
                  <p className="text-sm text-gray-500">{update.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{update.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return isIndexRoute ? renderOverview() : <Outlet />;
};

export default ParentDashboard;