import React, { useState, useEffect, useRef } from 'react';
import { Bell, Calendar, Book } from 'lucide-react';
import { eventService } from '../../services/eventService';
import { authService } from '../../services/authService';

interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
}

interface Assessment {
  id: number;
  title: string;
  description: string;
  assessment_date: string;
}

interface Notification {
  id: number;
  type: 'event' | 'assessment';
  title: string;
  description: string;
  date: string;
}

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadNotifications = async () => {
      const user = authService.getCurrentUser();
      if (user) {
        try {
          const [events, assessments] = await Promise.all([
            eventService.getUpcomingEvents(user.class_value, user.section),
            eventService.getUpcomingAssessments(user.class_value, user.section)
          ]);

          const combinedNotifications: Notification[] = [
            ...events.map(event => ({
              id: event.id,
              type: 'event' as const,
              title: event.title,
              description: event.description,
              date: event.event_date
            })),
            ...assessments.map(assessment => ({
              id: assessment.id,
              type: 'assessment' as const,
              title: assessment.title,
              description: assessment.description,
              date: assessment.assessment_date
            }))
          ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          setNotifications(combinedNotifications);
        } catch (error) {
          console.error('Error loading notifications:', error);
        }
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-all duration-200
          ${isOpen 
            ? 'bg-white/20 text-white ring-2 ring-white/20 transform scale-105' 
            : 'bg-white/5 text-gray-100 hover:bg-white/10 hover:text-white hover:scale-[1.02]'}
          focus:outline-none`}
      >
        <Bell className={`h-6 w-6 transition-transform duration-200 
          ${isOpen ? 'transform scale-110 filter drop-shadow-sm' : ''}`} />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 shadow-md rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg py-2 z-50 transform scale-100 transition-transform duration-200">
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Upcoming Events & Assessments</h3>
          </div>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={`${notification.type}-${notification.id}`}
                  className={`px-4 py-3 mx-2 my-1 rounded-lg transition-all duration-200
                    ${notification.type === 'event' 
                      ? 'hover:bg-blue-50 group' 
                      : 'hover:bg-yellow-50 group'}
                    hover:scale-[1.02] hover:shadow-md`}
                >
                  <div className="flex items-start">
                    <span className={`flex-shrink-0 mt-1 transition-transform duration-200
                      group-hover:scale-110 group-hover:filter group-hover:drop-shadow-sm
                      ${notification.type === 'event' ? 'text-blue-500' : 'text-yellow-500'}`}>
                      {notification.type === 'event' ? (
                        <Calendar className="h-5 w-5" />
                      ) : (
                        <Book className="h-5 w-5" />
                      )}
                    </span>
                    <div className="ml-3 flex-1">
                      <p className={`text-sm font-medium transition-colors duration-200
                        ${notification.type === 'event' 
                          ? 'group-hover:text-blue-600' 
                          : 'group-hover:text-yellow-600'}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5 group-hover:text-gray-700">
                        {notification.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(notification.date)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                No upcoming events or assessments
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
