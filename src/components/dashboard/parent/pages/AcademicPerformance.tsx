import React from 'react';
import { Book, Calendar, AlertTriangle, TrendingUp, Award, Clock } from 'lucide-react';

const AcademicPerformance = () => {
  const userData = JSON.parse(sessionStorage.getItem('userData') || 'null');

  return (
    <div className="p-8">
      {/* Header with student info */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Academic Performance</h1>
        <div className="flex items-center text-gray-600">
          <span className="font-medium">{userData?.studentName}</span>
          <span className="mx-2">•</span>
          <span>Class {userData?.class}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 p-6 rounded-xl border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Overall Grade</p>
              <h3 className="text-3xl font-bold text-green-700 mt-1">A+</h3>
            </div>
            <Award className="h-12 w-12 text-green-500" />
          </div>
          <p className="text-green-600 text-sm mt-2">Top 5% of the class</p>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Attendance Rate</p>
              <h3 className="text-3xl font-bold text-blue-700 mt-1">95%</h3>
            </div>
            <Calendar className="h-12 w-12 text-blue-500" />
          </div>
          <p className="text-blue-600 text-sm mt-2">Above class average</p>
        </div>

        <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Assignments</p>
              <h3 className="text-3xl font-bold text-purple-700 mt-1">28/30</h3>
            </div>
            <Book className="h-12 w-12 text-purple-500" />
          </div>
          <p className="text-purple-600 text-sm mt-2">Completed assignments</p>
        </div>
      </div>

      {/* Recent Performance & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Grades */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Grades</h2>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-4">
            {[
              { subject: 'Mathematics', grade: 'A', date: '2023-11-20', score: '92%' },
              { subject: 'Science', grade: 'A-', date: '2023-11-18', score: '88%' },
              { subject: 'English', grade: 'A', date: '2023-11-15', score: '90%' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.subject}</p>
                  <p className="text-sm text-gray-500">{item.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{item.grade}</p>
                  <p className="text-sm text-gray-500">{item.score}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-4">
            {[
              { title: 'Math Quiz', subject: 'Mathematics', due: 'Tomorrow', priority: 'high' },
              { title: 'Science Project', subject: 'Science', due: 'In 3 days', priority: 'medium' },
              { title: 'English Essay', subject: 'English', due: 'Next week', priority: 'low' },
            ].map((task, index) => (
              <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className={`h-2 w-2 mt-2 rounded-full flex-shrink-0 ${
                  task.priority === 'high' ? 'bg-red-500' :
                  task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div className="ml-3 flex-1">
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-500">{task.subject}</p>
                  <p className="text-sm text-gray-500">Due: {task.due}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Important Notices */}
      <div className="mt-8 bg-yellow-50 border border-yellow-100 rounded-xl p-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important Reminder</h3>
            <p className="mt-1 text-sm text-yellow-700">
              End-of-term exams start in 2 weeks. Make sure to review all study materials and complete pending assignments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicPerformance;