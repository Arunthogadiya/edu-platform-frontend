import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, X, User, Users } from 'lucide-react';

const AttendanceBehavior = () => {
  const userData = JSON.parse(sessionStorage.getItem('userData') || 'null');
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  // Sample data - replace with real data in production
  const monthlyAttendance = {
    present: 18,
    absent: 2,
    total: 20,
    percentage: '90%'
  };

  const behaviorReports = [
    {
      type: 'positive',
      title: 'Outstanding Participation',
      description: 'Actively participated in class discussions and helped other students',
      date: '2023-11-20',
      teacher: 'Mrs. Thompson'
    },
    {
      type: 'attention',
      title: 'Late Arrival',
      description: 'Arrived 10 minutes late to Mathematics class',
      date: '2023-11-18',
      teacher: 'Mr. Davis'
    }
  ];

  const timeTable = [
    { time: '09:00 AM', subject: 'Mathematics', teacher: 'Mrs. Thompson', room: '301' },
    { time: '10:30 AM', subject: 'Science', teacher: 'Mr. Davis', room: 'Lab 2' },
    { time: '12:00 PM', subject: 'Lunch Break', teacher: '', room: 'Cafeteria' },
    { time: '01:00 PM', subject: 'English', teacher: 'Ms. Wilson', room: '205' }
  ];

  return (
    <div className="p-8">
      {/* Header with student info */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance & Schedule</h1>
        <div className="flex items-center text-gray-600">
          <span className="font-medium">{userData?.studentName}</span>
          <span className="mx-2">•</span>
          <span>Class {userData?.class}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 p-6 rounded-xl border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-800">Today's Status</h3>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-green-600">Present</p>
          <p className="text-sm text-green-600 mt-1">Arrived at 8:45 AM</p>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-800">Monthly Overview</h3>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-blue-600">{monthlyAttendance.percentage} Attendance</p>
          <p className="text-sm text-blue-600 mt-1">
            {monthlyAttendance.present} present out of {monthlyAttendance.total} days
          </p>
        </div>

        <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-800">Class Strength</h3>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-purple-600">35 Students</p>
          <p className="text-sm text-purple-600 mt-1">Full attendance today</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Schedule */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-4">
            {timeTable.map((period, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-24 flex-shrink-0">
                  <p className="text-sm font-medium text-gray-900">{period.time}</p>
                </div>
                <div className="flex-1 ml-4">
                  <p className="font-medium text-gray-900">{period.subject}</p>
                  {period.teacher && (
                    <p className="text-sm text-gray-500">{period.teacher}</p>
                  )}
                </div>
                <div className="text-right text-sm text-gray-500">
                  {period.room}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Behavior Reports */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
            <User className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            {behaviorReports.map((report, index) => (
              <div key={index} className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-start">
                  {report.type === 'positive' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  )}
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      report.type === 'positive' ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      {report.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">{report.description}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      <span>{report.teacher}</span>
                      <span className="mx-2">•</span>
                      <span>{report.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Calendar */}
      <div className="mt-8 bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {currentMonth} {currentYear} Attendance
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
              <span className="text-sm text-gray-600">Present</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
              <span className="text-sm text-gray-600">Absent</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: 31 }, (_, i) => (
            <div
              key={i}
              className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium ${
                i % 7 === 0 || i % 7 === 6
                  ? 'bg-gray-100 text-gray-400'
                  : Math.random() > 0.1
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttendanceBehavior;