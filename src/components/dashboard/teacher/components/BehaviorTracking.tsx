import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mockStudents } from '@/data/dummyTeacherData';

const BehaviorTracking: React.FC = () => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<'individual' | 'class'>('class');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const behaviorStats = mockStudents.reduce((acc, student) => {
    student.behavior.forEach(record => {
      acc[record.type] = (acc[record.type] || 0) + 1;
      acc[record.category] = (acc[record.category] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('teacher.behavior.title')}</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveView('individual')}
            className={`px-4 py-2 rounded ${
              activeView === 'individual' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {t('teacher.behavior.individualView')}
          </button>
          <button
            onClick={() => setActiveView('class')}
            className={`px-4 py-2 rounded ${
              activeView === 'class' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {t('teacher.behavior.classView')}
          </button>
        </div>
      </div>

      {activeView === 'individual' && (
        <div className="mb-6">
          <select
            value={selectedStudent || ''}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="">Select Student</option>
            {mockStudents.map(student => (
              <option key={student.id} value={student.id}>{student.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">
              {activeView === 'individual' 
                ? t('teacher.behavior.studentBehavior')
                : t('teacher.behavior.classBehavior')}
            </h2>
            {activeView === 'class' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded">
                    <p className="text-sm text-gray-600">Positive Behaviors</p>
                    <p className="text-2xl font-bold text-green-600">{behaviorStats.positive || 0}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded">
                    <p className="text-sm text-gray-600">Areas for Improvement</p>
                    <p className="text-2xl font-bold text-red-600">{behaviorStats.negative || 0}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {mockStudents.map(student => (
                    <div key={student.id} className="p-3 border rounded">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{student.name}</h3>
                        <div className="flex gap-2">
                          {student.behavior.slice(-2).map((record, idx) => (
                            <span key={idx} className={`text-xs px-2 py-1 rounded-full ${
                              record.type === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {record.category}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedStudent && (
              <div className="space-y-4">
                {mockStudents
                  .find(s => s.id === selectedStudent)
                  ?.behavior.map((record, idx) => (
                    <div key={idx} className={`p-3 rounded ${
                      record.type === 'positive' ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            record.type === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {record.category}
                          </span>
                          <p className="mt-2">{record.description}</p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
          
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">{t('teacher.behavior.patterns')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-blue-50 rounded">
                <p className="text-sm text-gray-600">Engagement</p>
                <p className="text-xl font-bold text-blue-600">{behaviorStats.engagement || 0}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded">
                <p className="text-sm text-gray-600">Teamwork</p>
                <p className="text-xl font-bold text-purple-600">{behaviorStats.teamwork || 0}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded">
                <p className="text-sm text-gray-600">Leadership</p>
                <p className="text-xl font-bold text-yellow-600">{behaviorStats.leadership || 0}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Discipline</p>
                <p className="text-xl font-bold text-gray-600">{behaviorStats.discipline || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">{t('teacher.behavior.quickActions')}</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded">
                {t('teacher.behavior.recordIncident')}
              </button>
              <button className="w-full px-4 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded">
                {t('teacher.behavior.praiseStudent')}
              </button>
              <button className="w-full px-4 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded">
                {t('teacher.behavior.generateReport')}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">{t('teacher.behavior.recommendations')}</h2>
            <div className="space-y-2 text-sm">
              {activeView === 'class' ? (
                <>
                  <p>• Increase group activities to promote teamwork</p>
                  <p>• Recognize and reward positive behaviors more frequently</p>
                  <p>• Consider implementing peer mentoring program</p>
                </>
              ) : selectedStudent && (
                mockStudents
                  .find(s => s.id === selectedStudent)
                  ?.behavior.slice(-1).map((record, idx) => (
                    <p key={idx}>
                      • {record.type === 'positive' 
                          ? 'Continue encouraging ' 
                          : 'Work on improving '}{record.category}
                    </p>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehaviorTracking;