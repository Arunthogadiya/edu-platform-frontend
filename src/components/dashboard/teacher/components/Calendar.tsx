import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mockCalendarEvents } from '@/data/dummyTeacherData';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'class' | 'assignment' | 'test' | 'meeting' | 'activity';
  start: string;
  end: string;
  description?: string;
  participants?: string[];
}

const Calendar: React.FC = () => {
  const { t } = useTranslation();
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const upcomingEvents = mockCalendarEvents
    .filter(event => new Date(event.start) > new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('teacher.calendar.title')}</h1>
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg overflow-hidden">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {t('teacher.calendar.monthView')}
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {t('teacher.calendar.weekView')}
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-4 py-2 ${view === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {t('teacher.calendar.dayView')}
            </button>
          </div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => {/* Open event creation modal */}}
          >
            {t('teacher.calendar.newEvent')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white rounded-lg shadow p-4">
          <div className="h-[600px]">
            {/* Calendar content based on selected view */}
            <div className="text-center p-4 text-gray-500">
              Calendar grid implementation coming soon...
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">{t('teacher.calendar.upcomingEvents')}</h2>
            <div className="space-y-3">
              {upcomingEvents.map(event => (
                <div key={event.id} className="p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      event.type === 'test' ? 'bg-red-500' :
                      event.type === 'meeting' ? 'bg-blue-500' :
                      event.type === 'class' ? 'bg-green-500' :
                      'bg-yellow-500'
                    }`} />
                    <span className="font-medium">{event.title}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(event.start).toLocaleString()}
                  </p>
                  {event.description && (
                    <p className="text-sm mt-1">{event.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">{t('teacher.calendar.quickSchedule')}</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded">
                {t('teacher.calendar.scheduleClass')}
              </button>
              <button className="w-full px-4 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded">
                {t('teacher.calendar.scheduleTest')}
              </button>
              <button className="w-full px-4 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded">
                {t('teacher.calendar.parentTeacherMeeting')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;